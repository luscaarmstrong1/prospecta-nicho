from pathlib import Path


def test_queue_hardening_migration_uses_atomic_claim_rpc():
    sql = Path("supabase/migrations/20260916103000_harden_rfb_worker_queue.sql").read_text(encoding="utf-8").lower()

    assert "claim_next_rfb_job" in sql
    assert "for update skip locked" in sql
    assert "lease_expires_at" in sql
    assert "next_retry_at" in sql
    assert "checksum_sha256" in sql
