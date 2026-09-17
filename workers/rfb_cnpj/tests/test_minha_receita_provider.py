from __future__ import annotations

import asyncio
import json
from decimal import Decimal

import httpx

from workers.rfb_cnpj.config import WorkerConfig
from workers.rfb_cnpj.models import CnpjFilters
from workers.rfb_cnpj.providers.minha_receita import MinhaReceitaProvider


def _config(tmp_path, **overrides):
    values = {
        "minha_receita_base_url": "https://minhareceita.test",
        "minha_receita_cache_dir": str(tmp_path),
        "minha_receita_page_limit": 2,
        "minha_receita_min_interval_ms": 0,
        "minha_receita_max_retries": 2,
        "minha_receita_max_pages_per_query": 5,
        "minha_receita_oversample_factor": 2,
    }
    values.update(overrides)
    return WorkerConfig(**values)


def _company(cnpj: str, cnae: str = "6209100", cidade: str = "BRASILIA") -> dict[str, object]:
    return {
        "cnpj": cnpj,
        "razao_social": f"Empresa {cnpj}",
        "nome_fantasia": "Teste",
        "cnae_fiscal": cnae,
        "municipio": cidade,
        "uf": "DF",
        "porte": "ME",
        "data_inicio_atividade": "2026-01-01",
        "descricao_situacao_cadastral": "ATIVA",
        "descricao_identificador_matriz_filial": "MATRIZ",
        "capital_social": "10000,00",
        "codigo_municipio_ibge": "5300108" if cidade == "BRASILIA" else "2611606",
        "qsa": [{"nome_socio": "Nao deve sair"}],
        "cnpf": "00000000000",
    }


def test_provider_paginates_deduplicates_and_strips_sensitive_fields(tmp_path):
    calls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(str(request.url))
        cursor = request.url.params.get("cursor")
        if cursor == "next":
            payload = {"data": [_company("00000000000200"), _company("00000000000200")]}
        else:
            payload = {"data": [_company("00000000000110")], "cursor": "next"}
        return httpx.Response(200, json=payload)

    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(handler))
    result = asyncio.run(provider.search(CnpjFilters(segment="software", uf="DF", cnaes=("6209100",), quantity=2)))

    assert result.pages_read == 2
    assert result.records_seen == 3
    assert [record.cnpj for record in result.records] == ["00000000000110", "00000000000200"]
    assert "qsa" not in json.dumps([record.as_dict() for record in result.records], default=str).lower()
    assert len(calls) == 2


def test_provider_stops_on_repeated_cursor(tmp_path):
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"data": [_company("00000000000110")], "cursor": "same"})

    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(handler))
    result = asyncio.run(provider.search(CnpjFilters(segment="software", uf="DF", cnaes=("6209100",), quantity=10)))

    assert result.stopped_reason == "repeated_cursor"
    assert result.warnings


def test_provider_uses_sqlite_cache(tmp_path):
    calls = 0

    def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(200, json={"data": [_company("00000000000110")]})

    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(handler))
    filters = CnpjFilters(segment="software", uf="DF", cnaes=("6209100",), quantity=1)

    first = asyncio.run(provider.search(filters))
    second = asyncio.run(provider.search(filters))

    assert first.records_kept == 1
    assert second.records_kept == 1
    assert calls == 1
    assert first.extra_stats["provider_cache_misses"] == 1
    assert second.extra_stats["provider_cache_hits"] == 1


def test_provider_resolves_concessionaria_to_municipio_batch(tmp_path, monkeypatch):
    mapping_file = tmp_path / "cities.json"
    mapping_file.write_text(json.dumps({"neoenergia": ["Recife", "Olinda", "Jaboatao dos Guararapes"]}), encoding="utf-8")
    monkeypatch.setenv("RFB_CNPJ_CITY_MAPPING_FILE", str(mapping_file))
    seen_urls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen_urls.append(str(request.url))
        if "servicodados.ibge.gov.br" in str(request.url):
            return httpx.Response(
                200,
                    json=[
                        {"id": 2611606, "nome": "Recife", "microrregiao": {"mesorregiao": {"UF": {"sigla": "PE"}}}},
                        {"id": 2609600, "nome": "Olinda", "microrregiao": {"mesorregiao": {"UF": {"sigla": "PE"}}}},
                        {"id": 2607901, "nome": "Jaboatao dos Guararapes"},
                ],
            )
        company = _company("00000000000110", cidade="RECIFE")
        company["uf"] = "PE"
        return httpx.Response(200, json={"data": [company]})

    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(handler))
    result = asyncio.run(
        provider.search(CnpjFilters(segment="software", concessionaria="neoenergia", uf="PE", cnaes=("6209100",), quantity=1))
    )

    assert result.records_kept == 1
    minha_receita_urls = [url for url in seen_urls if "minhareceita.test" in url]
    assert "municipio=2611606" in minha_receita_urls[0]


def test_provider_uses_explicit_ibge_code_for_city_filter(tmp_path):
    seen_urls: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen_urls.append(str(request.url))
        return httpx.Response(200, json={"data": [_company("00000000000110")]})

    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(handler))
    result = asyncio.run(
        provider.search(
            CnpjFilters(
                segment="software",
                uf="DF",
                city="Brasilia",
                city_ibge_code="5300108",
                cnaes=("6209100",),
                quantity=1,
            )
        )
    )

    assert result.records_kept == 1
    assert "municipio=5300108" in seen_urls[0]


def test_provider_does_not_invent_missing_status_or_branch_and_preserves_decimal_capital(tmp_path):
    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(lambda _request: httpx.Response(200, json={})))

    record = provider.normalize(
        {
            "cnpj": "00.000.000/0001-00",
            "razao_social": "Empresa Sem Status",
            "cnae_fiscal": "6209100",
            "capital_social": "1.234,56",
            "correio_eletronico": "COMERCIAL@EXEMPLO.COM",
            "ddd_telefone_1": "(11) 99999-0000",
            "opcao_pelo_mei": "",
            "opcao_pelo_simples": "",
            "qsa": [{"nome_socio": "Nao deve sair"}],
        }
    )

    assert record is not None
    assert record.situacao_cadastral == "DESCONHECIDA"
    assert record.matriz_filial == "DESCONHECIDO"
    assert str(record.capital_social) == "1234.56"
    assert record.extra["email_comercial"] == "comercial@exemplo.com"
    assert record.extra["phone_1"] == "11999990000"
    assert record.extra["mei"] is None
    assert "qsa" not in json.dumps(record.as_dict(), default=str).lower()


def test_provider_cache_strips_sensitive_nested_payload(tmp_path):
    calls = 0

    def handler(_request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(200, json={"data": [_company("00000000000110")], "socios": [{"cpf": "123"}]})

    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(handler))
    asyncio.run(provider.search(CnpjFilters(segment="software", uf="DF", cnaes=("6209100",), quantity=1)))

    with provider.cache_path.open("rb") as handle:
        cached = handle.read().decode("utf-8", errors="ignore").lower()

    assert calls == 1
    assert "cpf" not in cached
    assert "socios" not in cached


def test_provider_normalizes_real_aliases_and_codes(tmp_path):
    provider = MinhaReceitaProvider(_config(tmp_path), transport=httpx.MockTransport(lambda _request: httpx.Response(200, json={})))

    record = provider.normalize(
        {
            "cnpj": "00.000.000/0001-91",
            "razao_social": "Empresa Alias",
            "cnae_principal": "62.09-1-00",
            "codigo_porte": "03",
            "codigo_situacao_cadastral": "02",
            "identificador_matriz_filial": "1",
            "capital_social": "1,234.56",
            "email": "VENDAS@EXEMPLO.COM",
            "telefone1": "(11) 98888-7777",
            "data_abertura": "20260131",
        }
    )

    assert record is not None
    assert record.cnpj == "00000000000191"
    assert record.cnae_principal == "6209100"
    assert record.porte == "ME"
    assert record.situacao_cadastral == "ATIVA"
    assert record.matriz_filial == "MATRIZ"
    assert record.capital_social == Decimal("1234.56")
    assert record.data_abertura == "2026-01-31"
    assert record.extra["email_comercial"] == "vendas@exemplo.com"
    assert record.extra["telefone_comercial"] == "11988887777"
