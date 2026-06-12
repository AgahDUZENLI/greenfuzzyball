-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    phone VARCHAR,
    hashed_password VARCHAR,
    role VARCHAR NOT NULL CHECK (role IN ('coach', 'student')),
    location VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coaches (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    notes TEXT
);

CREATE TABLE students (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    age_group VARCHAR CHECK (age_group IN ('kids', 'adults', 'veterans')),
    level VARCHAR CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    notes TEXT
);

CREATE TABLE coach_students (
    coach_id UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    started_at TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (coach_id, student_id)
);

CREATE TABLE drill_categories (
    drill_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    UNIQUE (coach_id, name)
);

CREATE TABLE drills (
    drill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE drill_drill_categories (
    drill_id UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    drill_category_id UUID REFERENCES drill_categories(drill_category_id) ON DELETE CASCADE,
    PRIMARY KEY (drill_id, drill_category_id)
);

CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID REFERENCES coaches(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR CHECK (type IN ('private', 'group')),
    notes TEXT,
    session_location VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session_students (
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, student_id)
);

CREATE TABLE session_drills (
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    drill_id UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, drill_id)
);

CREATE TABLE session_drill_ratings (
    session_id UUID REFERENCES sessions(session_id) ON DELETE CASCADE,
    drill_id UUID REFERENCES drills(drill_id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (session_id, drill_id, student_id)
);