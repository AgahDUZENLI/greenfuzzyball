-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
    user_id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                      VARCHAR NOT NULL,
    email                     VARCHAR UNIQUE,
    phone                     VARCHAR,
    hashed_password           VARCHAR,
    role                      VARCHAR NOT NULL CHECK (role IN ('coach', 'student', 'member')),
    location                  VARCHAR,
    age                       INTEGER,
    password_reset_token      VARCHAR,
    password_reset_expires_at TIMESTAMP,
    created_at                TIMESTAMP DEFAULT NOW()
);

-- ─── COACHES ─────────────────────────────────────────────────────────────────

CREATE TABLE coaches (
    user_id            UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    code               VARCHAR UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
    notes              TEXT,
    availability_start TIME DEFAULT '00:00',
    availability_end   TIME DEFAULT '23:59',
    session_duration   JSONB DEFAULT '[60, 90, 120]',
    coaching_days      JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]',
    notification_preferences JSONB DEFAULT '{"session_booked": true, "session_reminder": true, "weekly_summary": false}'
);

-- ─── MEMBERS ─────────────────────────────────────────────────────────────────

CREATE TABLE members (
    user_id    UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    is_student BOOLEAN DEFAULT false,  -- true if member also takes lessons
    notes      TEXT
);

-- ─── STUDENTS ────────────────────────────────────────────────────────────────

CREATE TABLE students (
    user_id   UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    level     VARCHAR CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    notes     TEXT
);

-- ─── COACH STUDENTS ──────────────────────────────────────────────────────────

CREATE TABLE coach_students (
    coach_id   UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    started_at TIMESTAMP,
    notes      TEXT,
    PRIMARY KEY (coach_id, student_id)
);

-- ─── MEMBER CHILDREN ─────────────────────────────────────────────────────────

CREATE TABLE member_children (
    member_id  UUID REFERENCES members(user_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, student_id)
);

-- ─── COACH JOIN REQUESTS ─────────────────────────────────────────────────────

CREATE TABLE coach_join_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id  UUID REFERENCES members(user_id) ON DELETE CASCADE,
    coach_id   UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    status     VARCHAR DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
    notes      TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─── SESSION REQUESTS ────────────────────────────────────────────────────────

CREATE TABLE session_requests (
    request_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id      UUID REFERENCES members(user_id) ON DELETE CASCADE,
    coach_id       UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    student_id     UUID REFERENCES students(user_id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    requested_time TIME,
    notes          TEXT,
    status         VARCHAR DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at     TIMESTAMP DEFAULT NOW()
);

-- ─── DRILL CATEGORIES ────────────────────────────────────────────────────────

CREATE TABLE drill_categories (
    drill_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id          UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    name              VARCHAR NOT NULL,
    UNIQUE (coach_id, name)
);

-- ─── DRILLS ──────────────────────────────────────────────────────────────────

CREATE TABLE drills (
    drill_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id    UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    name        VARCHAR NOT NULL,
    description TEXT,
    share_token VARCHAR UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─── COACH DRILLS ────────────────────────────────────────────────────────────

CREATE TABLE coach_drills (
    coach_id   UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    drill_id   UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    added_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (coach_id, drill_id)
);

-- ─── DRILL DRILL CATEGORIES ──────────────────────────────────────────────────

CREATE TABLE drill_drill_categories (
    drill_id          UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    drill_category_id UUID REFERENCES drill_categories(drill_category_id) ON DELETE CASCADE,
    PRIMARY KEY (drill_id, drill_category_id)
);

-- ─── COURTS ──────────────────────────────────────────────────────────────────

CREATE TABLE courts (
    court_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR NOT NULL,
    city      VARCHAR NOT NULL,
    area      VARCHAR
);

-- ─── COACH COURTS ────────────────────────────────────────────────────────────

CREATE TABLE coach_courts (
    coach_id  UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    court_id  UUID REFERENCES courts(court_id) ON DELETE CASCADE,
    PRIMARY KEY (coach_id, court_id)
);

-- ─── SESSIONS ────────────────────────────────────────────────────────────────

CREATE TABLE sessions (
    session_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id         UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    court_id         UUID REFERENCES courts(court_id) ON DELETE SET NULL,
    date             DATE NOT NULL,
    start_time       TIME,
    duration_minutes INTEGER,
    type             VARCHAR CHECK (type IN ('private', 'group')),
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT NOW()
);

-- ─── SESSION STUDENTS ────────────────────────────────────────────────────────

CREATE TABLE session_students (
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, student_id)
);

-- ─── SESSION DRILLS ──────────────────────────────────────────────────────────

CREATE TABLE session_drills (
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    drill_id   UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, drill_id)
);

-- ─── SESSION DRILL RATINGS ───────────────────────────────────────────────────

CREATE TABLE session_drill_ratings (
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    drill_id   UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    rating     SMALLINT CHECK (rating >= 1 AND rating <= 10),
    notes      TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (session_id, drill_id, student_id)
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_students_user_id      ON students(user_id);
CREATE INDEX idx_coaches_user_id       ON coaches(user_id);
CREATE INDEX idx_members_user_id       ON members(user_id);
CREATE INDEX idx_drills_coach_id       ON drills(coach_id);
CREATE INDEX idx_sessions_coach_id     ON sessions(coach_id);
CREATE INDEX idx_sessions_date         ON sessions(date);
CREATE INDEX idx_ratings_student_id    ON session_drill_ratings(student_id);
CREATE INDEX idx_ratings_drill_id      ON session_drill_ratings(drill_id);
CREATE INDEX idx_ratings_session_id    ON session_drill_ratings(session_id);
CREATE INDEX idx_coach_drills          ON coach_drills(coach_id);
CREATE INDEX idx_drills_share_token    ON drills(share_token);
CREATE INDEX idx_join_requests_coach   ON coach_join_requests(coach_id);
CREATE INDEX idx_join_requests_member  ON coach_join_requests(member_id);
CREATE INDEX idx_session_requests      ON session_requests(coach_id, member_id);