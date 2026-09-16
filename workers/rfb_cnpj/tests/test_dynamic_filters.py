import json
from pathlib import Path

from workers.rfb_cnpj.filters import apply_filters
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def test_filters_resolve_segment_and_concessionaria_from_files(tmp_path: Path, monkeypatch):
    cnae_file = tmp_path / "cnaes.json"
    city_file = tmp_path / "cities.json"
    cnae_file.write_text(json.dumps({"servicos solares premium": ["4321500"]}), encoding="utf-8")
    city_file.write_text(json.dumps({"Distribuidora X": ["Campinas"]}), encoding="utf-8")
    monkeypatch.setenv("RFB_CNPJ_CNAE_MAPPING_FILE", str(cnae_file))
    monkeypatch.setenv("RFB_CNPJ_CITY_MAPPING_FILE", str(city_file))

    records = [
        CnpjRecord(cnpj="1", razao_social="Dentro", cnae_principal="4321500", municipio="Campinas", uf="SP", porte="ME", situacao_cadastral="ATIVA"),
        CnpjRecord(cnpj="2", razao_social="Fora", cnae_principal="7112000", municipio="Santos", uf="SP", porte="ME", situacao_cadastral="ATIVA"),
    ]

    selected = apply_filters(records, CnpjFilters(segment="Servicos solares premium", concessionaria="Distribuidora X"))

    assert [record.cnpj for record in selected] == ["1"]
