-- =========================================================================
-- V2: Seed default Mon-Sun, 09:00–20:00 schedules for any active staff that
-- doesn't yet have a schedule.
--
-- Why: AdminStaffManagement.create() didn't seed schedules in the very first
-- production builds, so staff created via the admin UI ended up with an empty
-- staff_schedules row → every booking attempt failed
-- "OUTSIDE_WORKING_HOURS". Going forward the service code seeds schedules on
-- creation; this migration backfills the rows that pre-date that fix.
--
-- Idempotent guard: the WHERE NOT EXISTS skips staff who already have at
-- least one schedule, so reapplying produces no duplicates. Flyway also runs
-- this migration exactly once per deploy environment.
-- =========================================================================

INSERT INTO staff_schedules (
    created_at, updated_at, version,
    salon_id, staff_id,
    day_of_week, start_time, end_time
)
SELECT
    NOW(), NOW(), 0,
    s.salon_id, s.id,
    day, TIME '09:00', TIME '20:00'
FROM staff s
CROSS JOIN UNNEST(
    ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY']
) AS day
WHERE NOT EXISTS (
    SELECT 1 FROM staff_schedules sch WHERE sch.staff_id = s.id
);
