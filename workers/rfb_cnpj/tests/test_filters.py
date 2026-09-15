from workers.rfb_cnpj.filters import apply_filters
from workers.rfb_cnpj.models import CnpjFilters, CnpjRecord


def test_apply_filters_limits_by_uf_city_cnae_and_quantity():
    records = [
        CnpjRecord(cnpj="1", razao_social="A", cnae_principal="4321500", municipio="Campinas", uf="SP", porte="ME"),
        CnpjRecord(cnpj="2", razao_social="B", cnae_principal="6920601", municipio="Campinas", uf="SP", porte="ME"),
        CnpjRecord(cnpj="3", razao_social="C", cnae_principal="4321500", municipio="Santos", uf="SP", porte="ME"),
    ]

    selected = apply_filters(records, CnpjFilters(segment="Energia solar", uf="SP", city="Campinas", cnaes=("4321500",), quantity=1))

    assert [record.cnpj for record in selected] == ["1"]
