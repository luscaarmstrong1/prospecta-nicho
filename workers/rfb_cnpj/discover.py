from __future__ import annotations

MINIMUM_GROUPS = ("Empresas", "Estabelecimentos", "Simples", "Cnaes", "Municipios")


def expected_groups() -> tuple[str, ...]:
    return MINIMUM_GROUPS
