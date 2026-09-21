import os
from pathlib import Path
import sys

import pytest

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

_original_mkdir = Path.mkdir


def _mkdir_with_windows_sandbox_permissions(self, mode=0o777, parents=False, exist_ok=False):
    return _original_mkdir(self, 0o777, parents=parents, exist_ok=exist_ok)


Path.mkdir = _mkdir_with_windows_sandbox_permissions
runtime_temp = ROOT_DIR / f"pytest-runtime-{os.getpid()}"

sys.exit(
    pytest.main(
        [
            "-p",
            "no:cacheprovider",
            f"--basetemp={runtime_temp}",
            "tests/test_rfb_privacy.py",
            "workers/rfb_cnpj/tests",
        ]
    )
)
