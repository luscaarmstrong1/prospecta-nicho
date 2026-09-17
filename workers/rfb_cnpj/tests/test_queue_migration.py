from pathlib import Path


def test_queue_hardening_migration_uses_atomic_claim_rpc():
    sql = Path("supabase/migrations/20260916103000_harden_rfb_worker_queue.sql").read_text(encoding="utf-8").lower()

    assert "claim_next_rfb_job" in sql
    assert "for update skip locked" in sql
    assert "lease_expires_at" in sql
    assert "next_retry_at" in sql
    assert "checksum_sha256" in sql


def test_finalization_migration_fences_ownership_and_is_idempotent():
    sql = Path("supabase/migrations/20260917090000_finalize_rfb_worker_integrity.sql").read_text(encoding="utf-8").lower()

    assert "heartbeat_rfb_job" in sql
    assert "transition_rfb_job" in sql
    assert "finalize_local_rfb_job" in sql
    assert "and run_id = p_run_id" in sql
    assert "and worker_id = p_worker_id" in sql
    assert "and lease_expires_at > now()" in sql
    assert "on conflict (job_id, run_id)" in sql
    assert "export_id = export_row.id" in sql
    assert "checksum_sha256" in sql
    assert "worker_id = null" in sql
    assert "run_id = null" in sql
    assert "grant execute on function public.finalize_local_rfb_job" in sql
    assert "to service_role" in sql
