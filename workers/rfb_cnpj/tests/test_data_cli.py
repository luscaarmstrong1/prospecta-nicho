from __future__ import annotations

import io
import zipfile
from pathlib import Path

from workers.rfb_cnpj.data_cli import (
    EXPLICITLY_SKIPPED_FILES,
    REQUIRED_RFB_FILES,
    _parse_snapshot_links,
    setup_data,
    validate_snapshot,
)


def write_zip(path: Path, name: str = "DATA.CSV") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr(name, "codigo;descricao\n1;teste\n")


def test_parse_snapshot_links_orders_latest_first() -> None:
    html = '<a href="2026-07/">2026-07</a><a href="2026-09/">2026-09</a><a href="x">x</a>'
    assert _parse_snapshot_links(html) == ["2026-09", "2026-07"]


def test_required_files_do_not_include_socios() -> None:
    assert "Socios0.zip" not in REQUIRED_RFB_FILES
    assert "Socios0.zip" in EXPLICITLY_SKIPPED_FILES
    assert len(REQUIRED_RFB_FILES) == 24


def test_validate_snapshot_reports_ready(tmp_path: Path) -> None:
    for file_name in REQUIRED_RFB_FILES:
        write_zip(tmp_path / file_name)

    result = validate_snapshot(tmp_path)

    assert result["ok"] is True
    assert result["status"] == "READY"
    assert result["missing"] == []
    assert result["corrupt"] == []


def test_setup_dry_run_uses_official_snapshot_without_downloading(tmp_path: Path) -> None:
    class Response:
        def __init__(self, status_code: int, text: str = "", headers: dict[str, str] | None = None) -> None:
            self.status_code = status_code
            self.text = text
            self.headers = headers or {}

    class Client:
        def get(self, url: str, **_kwargs) -> Response:
            return Response(200, '<a href="2026-08/">2026-08</a>')

        def head(self, url: str, **_kwargs) -> Response:
            return Response(200, headers={"content-length": "123"})

        def close(self) -> None:
            return None

    client = Client()
    logs: list[str] = []

    result = setup_data(tmp_path, dry_run=True, yes=True, client=client, log=logs.append)

    assert result["ok"] is True
    assert result["status"] == "DRY_RUN"
    assert result["snapshot"] == "2026-08"
    assert len(result["filesToDownload"]) == 24
    assert not any(tmp_path.rglob("*.zip"))
