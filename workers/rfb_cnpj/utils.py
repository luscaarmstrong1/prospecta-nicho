from __future__ import annotations


def clean_digits(value: str) -> str:
    return "".join(char for char in value if char.isdigit())
