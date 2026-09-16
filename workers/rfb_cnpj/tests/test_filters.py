from workers.rfb_cnpj.filters import apply_filters
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def test_apply_filters_matches_by_uf_city_and_cnae_without_quantity_cutoff():
    records = [
        CnpjRecord(cnpj="1", razao_social="A", cnae_principal="4321500", municipio="Campinas", uf="SP", porte="ME", situacao_cadastral="ATIVA"),
        CnpjRecord(cnpj="2", razao_social="B", cnae_principal="4321500", municipio="Campinas", uf="SP", porte="ME", situacao_cadastral="ATIVA"),
        CnpjRecord(cnpj="3", razao_social="C", cnae_principal="4321500", municipio="Santos", uf="SP", porte="ME", situacao_cadastral="ATIVA"),
    ]

    selected = apply_filters(records, CnpjFilters(segment="Energia solar", uf="SP", city="Campinas", cnaes=("4321500",), quantity=1))

    assert [record.cnpj for record in selected] == ["1", "2"]


def test_apply_filters_can_match_secondary_cnae():
    records = [
        CnpjRecord(
            cnpj="1",
            razao_social="A",
            cnae_principal="6209100",
            municipio="Recife",
            uf="PE",
            porte="ME",
            situacao_cadastral="ATIVA",
            extra={"cnaes_secundarios": [{"codigo": "4321500"}]},
        )
    ]

    selected = apply_filters(records, CnpjFilters(segment="Energia solar", uf="PE", cnaes=("4321500",), include_secondary_cnaes=True))

    assert [record.cnpj for record in selected] == ["1"]
