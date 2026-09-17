import pytest

import workers.rfb_cnpj.queue as queue
from workers.rfb_cnpj.config import WorkerConfig


class ImmediateStop:
    def __init__(self) -> None:
        self.stopped = False

    def wait(self, _seconds: float) -> bool:
        return self.stopped

    def set(self) -> None:
        self.stopped = True


def test_heartbeat_guard_aborts_after_configured_consecutive_failures(monkeypatch):
    attempts = 0

    def fail_heartbeat(*_args, **_kwargs):
        nonlocal attempts
        attempts += 1
        raise RuntimeError("supabase indisponivel")

    monkeypatch.setattr(queue, "_heartbeat", fail_heartbeat)
    config = WorkerConfig(worker_heartbeat_max_failures=3)
    guard = queue.HeartbeatGuard(config, {"id": "job-1", "run_id": "run-1"})
    guard._stop = ImmediateStop()

    guard._run()

    assert attempts == 3
    with pytest.raises(queue.JobOwnershipLost, match="Heartbeat interrompido"):
        guard.check()


def test_heartbeat_guard_aborts_immediately_when_ownership_is_lost(monkeypatch):
    attempts = 0

    def lose_ownership(*_args, **_kwargs):
        nonlocal attempts
        attempts += 1
        raise queue.JobOwnershipLost("lease expirou")

    monkeypatch.setattr(queue, "_heartbeat", lose_ownership)
    guard = queue.HeartbeatGuard(WorkerConfig(worker_heartbeat_max_failures=3), {"id": "job-1", "run_id": "run-1"})
    guard._stop = ImmediateStop()

    guard._run()

    assert attempts == 1
    with pytest.raises(queue.JobOwnershipLost, match="lease expirou"):
        guard.check()
