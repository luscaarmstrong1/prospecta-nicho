from __future__ import annotations

import calendar
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError, as_completed
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Callable, Sequence

OFFICIAL_BASE_URL = "https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj"
REMOTE_UNAVAILABLE_MESSAGE = "Nao foi possivel localizar um snapshot oficial valido da Receita Federal agora."
REQUIRED_RFB_FILES: tuple[str, ...] = tuple(
    [f"Empresas{index}.zip" for index in range(10)]
    + [f"Estabelecimentos{index}.zip" for index in range(10)]
    + ["Municipios.zip", "Cnaes.zip", "Simples.zip", "Naturezas.zip"]
)
EXPLICITLY_SKIPPED_FILES: tuple[str, ...] = tuple(
    [f"Socios{index}.zip" for index in range(10)] + ["Qualificacoes.zip", "Paises.zip"]
)
SNAPSHOT_FILE = "snapshot.json"


@dataclass(frozen=True)
class RemoteFile:
    name: str
    url: str
    size: int | None = None


@dataclass(frozen=True)
class RemoteSnapshot:
    snapshot: str
    url: str
    files: tuple[RemoteFile, ...]


class BasicResponse:
    def __init__(self, status_code: int, *, text: str = "", headers: dict[str, str] | None = None, body: bytes = b"") -> None:
        self.status_code = status_code
        self.text = text
        self.headers = headers or {}
        self._body = body

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")

    def iter_bytes(self, chunk_size: int):
        for index in range(0, len(self._body), chunk_size):
            yield self._body[index : index + chunk_size]

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False


class UrlLibClient:
    def __init__(self, timeout: float = 60.0) -> None:
        self.timeout = timeout

    def get(self, url: str, **kwargs) -> BasicResponse:
        request = urllib.request.Request(url, headers=kwargs.get("headers") or {}, method="GET")
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            body = response.read()
            headers = {key.lower(): value for key, value in response.headers.items()}
            return BasicResponse(response.status, text=body.decode("utf-8", errors="replace"), headers=headers, body=body)

    def head(self, url: str, **_kwargs) -> BasicResponse:
        request = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            headers = {key.lower(): value for key, value in response.headers.items()}
            return BasicResponse(response.status, headers=headers)

    def stream(self, method: str, url: str, headers: dict[str, str] | None = None, **_kwargs) -> BasicResponse:
        request = urllib.request.Request(url, headers=headers or {}, method=method)
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            body = response.read()
            response_headers = {key.lower(): value for key, value in response.headers.items()}
            return BasicResponse(response.status, headers=response_headers, body=body)

    def close(self) -> None:
        return None


def utc_now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def snapshot_dir(data_root: Path, snapshot: str) -> Path:
    return data_root / snapshot


def current_snapshot_pointer(data_root: Path) -> Path:
    return data_root / "current.txt"


def current_snapshot_dir(data_root: Path) -> Path:
    pointer = current_snapshot_pointer(data_root)
    if pointer.exists():
        value = pointer.read_text(encoding="utf-8").strip()
        if value:
            return snapshot_dir(data_root, value)
    root_snapshot = data_root / SNAPSHOT_FILE
    if root_snapshot.exists():
        return data_root
    return data_root


def required_file_names() -> tuple[str, ...]:
    return REQUIRED_RFB_FILES


def skipped_file_names() -> tuple[str, ...]:
    return EXPLICITLY_SKIPPED_FILES


def _snapshot_url(snapshot: str, base_url: str = OFFICIAL_BASE_URL) -> str:
    if snapshot == "root":
        return f"{base_url.rstrip('/')}/"
    return f"{base_url.rstrip('/')}/{snapshot}/"


def _month_candidates(now: datetime | None = None, months_back: int = 12) -> list[str]:
    cursor = now or datetime.now(UTC)
    year = cursor.year
    month = cursor.month
    values: list[str] = []
    for _ in range(months_back + 1):
        values.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    return values


def _parse_snapshot_links(html: str) -> list[str]:
    found = set(re.findall(r"(20\d{2}-\d{2})/?", html))
    valid: list[str] = []
    for item in found:
        year, month = item.split("-")
        if 1 <= int(month) <= 12 and int(year) >= 2000:
            valid.append(item)
    return sorted(valid, reverse=True)


def _make_client():
    try:
        import httpx  # type: ignore

        return httpx.Client(timeout=httpx.Timeout(12.0, connect=5.0))
    except Exception:
        return UrlLibClient(timeout=12.0)


def _head_ok(client, url: str) -> tuple[bool, int | None]:
    try:
        response = client.head(url, follow_redirects=True)
        if response.status_code == 405:
            response = client.get(url, follow_redirects=True, headers={"range": "bytes=0-0"})
        if response.status_code in {200, 206}:
            size_header = response.headers.get("content-length")
            size = int(size_header) if size_header and size_header.isdigit() else None
            return True, size
    except (Exception, urllib.error.URLError):
        return False, None
    return False, None


def discover_latest_snapshot(client=None, base_url: str = OFFICIAL_BASE_URL) -> RemoteSnapshot:
    owns_client = client is None
    client = client or _make_client()
    try:
        candidates: Sequence[str] = ()
        try:
            response = client.get(f"{base_url.rstrip('/')}/", follow_redirects=True)
            if response.status_code == 200:
                candidates = _parse_snapshot_links(response.text)
        except Exception:
            candidates = ()

        from_listing = bool(candidates)
        if not candidates:
            candidates = ["root", *_month_candidates()]

        def valid_candidate(candidate: str) -> tuple[str, int | None] | None:
            local_client = client if from_listing else _make_client()
            url = _snapshot_url(candidate, base_url)
            try:
                ok_empresas, empresas_size = _head_ok(local_client, f"{url}Empresas0.zip")
                ok_estab, _ = _head_ok(local_client, f"{url}Estabelecimentos0.zip")
                if ok_empresas and ok_estab:
                    return candidate, empresas_size
            finally:
                if not from_listing:
                    local_client.close()
            return None

        resolved: tuple[str, int | None] | None = None
        if from_listing:
            for candidate in candidates:
                resolved = valid_candidate(candidate)
                if resolved:
                    break
        else:
            with ThreadPoolExecutor(max_workers=8) as pool:
                futures = {pool.submit(valid_candidate, candidate): candidate for candidate in candidates}
                try:
                    for future in as_completed(futures, timeout=25):
                        candidate_result = future.result()
                        if candidate_result:
                            if not resolved or candidate_result[0] > resolved[0]:
                                resolved = candidate_result
                except FuturesTimeoutError:
                    for future in futures:
                        future.cancel()

        if resolved:
            candidate, empresas_size = resolved
            url = _snapshot_url(candidate, base_url)
            snapshot_name = candidate if candidate != "root" else datetime.now(UTC).strftime("%Y-%m")
            files = [
                RemoteFile(file_name, f"{url}{file_name}", empresas_size if file_name == "Empresas0.zip" else None)
                for file_name in REQUIRED_RFB_FILES
            ]
            return RemoteSnapshot(snapshot_name, url, tuple(files))
        raise RuntimeError("Nenhum snapshot oficial valido da Receita Federal foi localizado.")
    finally:
        if owns_client:
            client.close()


def remote_unavailable_result(error: Exception, data_root: Path | None = None) -> dict[str, object]:
    return {
        "ok": False,
        "status": "REMOTE_UNAVAILABLE",
        "message": REMOTE_UNAVAILABLE_MESSAGE,
        "error": str(error),
        "sourceUrl": OFFICIAL_BASE_URL,
        "dataRoot": str(data_root) if data_root else None,
        "required": list(REQUIRED_RFB_FILES),
        "skipped": list(EXPLICITLY_SKIPPED_FILES),
    }


def _validate_zip(path: Path) -> tuple[bool, str]:
    if not path.exists():
        return False, "missing"
    if path.stat().st_size <= 0:
        return False, "empty"
    try:
        with zipfile.ZipFile(path) as archive:
            names = [name for name in archive.namelist() if not name.endswith("/")]
            if not names:
                return False, "empty_zip"
            bad = archive.testzip()
            if bad:
                return False, f"crc_error:{bad}"
    except zipfile.BadZipFile:
        return False, "bad_zip"
    return True, "valid"


def validate_snapshot(path: Path) -> dict[str, object]:
    files: dict[str, object] = {}
    missing: list[str] = []
    corrupt: list[str] = []
    total_size = 0
    for file_name in REQUIRED_RFB_FILES:
        file_path = path / file_name
        valid, status = _validate_zip(file_path)
        size = file_path.stat().st_size if file_path.exists() else 0
        total_size += size
        files[file_name] = {"size": size, "valid": valid, "status": status}
        if status == "missing":
            missing.append(file_name)
        elif not valid:
            corrupt.append(file_name)

    ok = not missing and not corrupt
    return {
        "ok": ok,
        "status": "READY" if ok else "WAITING_DATA",
        "path": str(path),
        "files": files,
        "missing": missing,
        "corrupt": corrupt,
        "sizeBytes": total_size,
        "required": list(REQUIRED_RFB_FILES),
        "skipped": list(EXPLICITLY_SKIPPED_FILES),
    }


def write_snapshot_metadata(path: Path, remote: RemoteSnapshot, validation: dict[str, object]) -> Path:
    payload = {
        "source": "RFB Dados Abertos CNPJ",
        "source_url": remote.url,
        "snapshot": remote.snapshot,
        "downloaded_at": utc_now_iso(),
        "validated_at": utc_now_iso(),
        "status": validation["status"],
        "required_files": list(REQUIRED_RFB_FILES),
        "skipped_files": list(EXPLICITLY_SKIPPED_FILES),
        "files": validation["files"],
    }
    path.mkdir(parents=True, exist_ok=True)
    metadata_path = path / SNAPSHOT_FILE
    metadata_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    return metadata_path


def _available_space(path: Path) -> int:
    path.mkdir(parents=True, exist_ok=True)
    return shutil.disk_usage(path).free


def _format_bytes(value: int | None) -> str:
    if value is None:
        return "desconhecido"
    units = ["B", "KB", "MB", "GB", "TB"]
    amount = float(value)
    for unit in units:
        if amount < 1024 or unit == units[-1]:
            return f"{amount:.1f} {unit}" if unit != "B" else f"{int(amount)} B"
        amount /= 1024
    return f"{value} B"


def _download_file(
    client,
    remote: RemoteFile,
    destination: Path,
    log: Callable[[str], None] = print,
    max_retries: int = 3,
) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    part_path = destination.with_suffix(destination.suffix + ".part")
    if destination.exists():
        valid, _ = _validate_zip(destination)
        if valid:
            log(f"skip {destination.name}: arquivo ZIP valido ja existe.")
            return

    for attempt in range(1, max_retries + 1):
        downloaded = part_path.stat().st_size if part_path.exists() else 0
        headers = {"Range": f"bytes={downloaded}-"} if downloaded else {}
        try:
            with client.stream("GET", remote.url, headers=headers, follow_redirects=True) as response:
                if response.status_code == 416:
                    part_path.replace(destination)
                    return
                response.raise_for_status()
                if downloaded and response.status_code == 200:
                    downloaded = 0
                    part_path.unlink(missing_ok=True)
                mode = "ab" if downloaded else "wb"
                total = remote.size or None
                started = time.monotonic()
                with part_path.open(mode) as handle:
                    for chunk in response.iter_bytes(1024 * 1024):
                        if not chunk:
                            continue
                        handle.write(chunk)
                        downloaded += len(chunk)
                        if total:
                            elapsed = max(time.monotonic() - started, 0.1)
                            speed = downloaded / elapsed
                            pct = min(100, downloaded / total * 100)
                            log(f"{destination.name}: {_format_bytes(downloaded)} / {_format_bytes(total)} ({pct:.1f}%, {_format_bytes(int(speed))}/s)")
            part_path.replace(destination)
            valid, status = _validate_zip(destination)
            if not valid:
                raise RuntimeError(f"ZIP invalido apos download: {status}")
            return
        except Exception:
            if attempt >= max_retries:
                raise
            time.sleep(min(2**attempt, 10))


def setup_data(
    data_root: Path,
    *,
    dry_run: bool = False,
    yes: bool = False,
    client=None,
    log: Callable[[str], None] = print,
) -> dict[str, object]:
    try:
        remote = discover_latest_snapshot(client=client)
    except Exception as error:
        return remote_unavailable_result(error, data_root)
    target_dir = snapshot_dir(data_root, remote.snapshot)
    known_total = sum(item.size or 0 for item in remote.files)
    missing_or_invalid = []
    for item in remote.files:
        valid, _ = _validate_zip(target_dir / item.name)
        if not valid:
            missing_or_invalid.append(item)
    download_total = sum(item.size or 0 for item in missing_or_invalid)
    free_space = _available_space(data_root)
    summary = {
        "ok": True,
        "status": "DRY_RUN" if dry_run else "READY_TO_DOWNLOAD",
        "snapshot": remote.snapshot,
        "sourceUrl": remote.url,
        "dataRoot": str(data_root),
        "snapshotDir": str(target_dir),
        "filesRequired": len(REQUIRED_RFB_FILES),
        "filesToDownload": [item.name for item in missing_or_invalid],
        "knownTotalBytes": known_total,
        "downloadBytes": download_total,
        "freeSpaceBytes": free_space,
        "skipped": list(EXPLICITLY_SKIPPED_FILES),
    }
    log(f"Snapshot: {remote.snapshot}")
    log(f"Arquivos necessarios: {len(REQUIRED_RFB_FILES)}")
    log(f"Download estimado: {_format_bytes(download_total)}")
    log(f"Espaco disponivel: {_format_bytes(free_space)}")
    if dry_run:
        return summary
    if download_total and free_space < download_total:
        return {**summary, "ok": False, "status": "INSUFFICIENT_DISK_SPACE"}
    if missing_or_invalid and not yes:
        answer = input("Deseja continuar? [S/N] ").strip().lower()
        if answer not in {"s", "sim", "y", "yes"}:
            return {**summary, "ok": False, "status": "CANCELLED"}

    owns_client = client is None
    client = client or _make_client()
    try:
        for index, item in enumerate(missing_or_invalid, start=1):
            log(f"[{index}/{len(missing_or_invalid)}] {item.name}")
            _download_file(client, item, target_dir / item.name, log=log)
    finally:
        if owns_client:
            client.close()

    validation = validate_snapshot(target_dir)
    write_snapshot_metadata(target_dir, remote, validation)
    if validation["ok"]:
        current_snapshot_pointer(data_root).write_text(remote.snapshot, encoding="utf-8")
    return {**summary, "status": validation["status"], "validation": validation}


def latest_command(data_root: Path | None = None) -> dict[str, object]:
    try:
        remote = discover_latest_snapshot()
    except Exception as error:
        return remote_unavailable_result(error, data_root)
    return {
        "ok": True,
        "snapshot": remote.snapshot,
        "sourceUrl": remote.url,
        "files": [{"name": item.name, "size": item.size, "url": item.url} for item in remote.files],
        "required": list(REQUIRED_RFB_FILES),
        "skipped": list(EXPLICITLY_SKIPPED_FILES),
        "dataRoot": str(data_root) if data_root else None,
    }


def status_command(data_root: Path) -> dict[str, object]:
    current_dir = current_snapshot_dir(data_root)
    metadata_path = current_dir / SNAPSHOT_FILE
    metadata = None
    if metadata_path.exists():
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    validation = validate_snapshot(current_dir)
    return {"ok": validation["ok"], "dataRoot": str(data_root), "currentSnapshotDir": str(current_dir), "metadata": metadata, "validation": validation}


def validate_command(data_root: Path) -> dict[str, object]:
    current_dir = current_snapshot_dir(data_root)
    validation = validate_snapshot(current_dir)
    if validation["ok"]:
        snapshot_name = current_dir.name if current_dir != data_root else "manual"
        remote = RemoteSnapshot(snapshot_name, "", tuple(RemoteFile(name, "") for name in REQUIRED_RFB_FILES))
        write_snapshot_metadata(current_dir, remote, validation)
    return validation


def update_command(data_root: Path, *, dry_run: bool = False, yes: bool = False) -> dict[str, object]:
    try:
        remote = discover_latest_snapshot()
    except Exception as error:
        return remote_unavailable_result(error, data_root)
    pointer = current_snapshot_pointer(data_root)
    current = pointer.read_text(encoding="utf-8").strip() if pointer.exists() else ""
    if current == remote.snapshot and validate_snapshot(snapshot_dir(data_root, current))["ok"]:
        return {"ok": True, "status": "UP_TO_DATE", "snapshot": current}
    return setup_data(data_root, dry_run=dry_run, yes=yes)


def prune_command(data_root: Path, *, keep: int = 1, yes: bool = False) -> dict[str, object]:
    snapshots = sorted(
        [item for item in data_root.iterdir() if item.is_dir() and re.fullmatch(r"20\d{2}-\d{2}", item.name)],
        key=lambda item: item.name,
        reverse=True,
    ) if data_root.exists() else []
    remove = snapshots[keep:]
    if remove and not yes:
        return {"ok": False, "status": "CONFIRMATION_REQUIRED", "remove": [str(item) for item in remove]}
    for item in remove:
        shutil.rmtree(item)
    return {"ok": True, "status": "PRUNED", "removed": [str(item) for item in remove], "kept": [str(item) for item in snapshots[:keep]]}


def handle_data_command(argv: Sequence[str], data_root: Path) -> dict[str, object]:
    import argparse

    parser = argparse.ArgumentParser(prog="python -m workers.rfb_cnpj data")
    parser.add_argument("command", choices=["latest", "setup", "status", "validate", "update", "prune"])
    parser.add_argument("--data-dir")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--yes", action="store_true")
    parser.add_argument("--keep", type=int, default=1)
    args = parser.parse_args(list(argv))
    root = Path(args.data_dir or data_root)
    if args.command == "latest":
        return latest_command(root)
    if args.command == "setup":
        return setup_data(root, dry_run=args.dry_run, yes=args.yes)
    if args.command == "status":
        return status_command(root)
    if args.command == "validate":
        return validate_command(root)
    if args.command == "update":
        return update_command(root, dry_run=args.dry_run, yes=args.yes)
    return prune_command(root, keep=max(1, args.keep), yes=args.yes)
