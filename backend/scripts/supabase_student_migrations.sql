-- Run this in Supabase SQL Editor if automatic migrations time out.
-- Adds columns required for the Students Management module.

ALTER TABLE students ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name VARCHAR(150);
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_email VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS guardian_relationship VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(30);
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_date TIMESTAMP;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Promotion history (also created by SQLAlchemy create_all)
CREATE TABLE IF NOT EXISTS student_promotion_history (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_class_name VARCHAR(100),
    to_class_name VARCHAR(100) NOT NULL,
    promoted_by_user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    promoted_by_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_student_promotion_history_student_id ON student_promotion_history(student_id);
