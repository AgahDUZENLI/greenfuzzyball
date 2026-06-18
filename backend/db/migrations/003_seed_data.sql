-- ─── SEED DATA ───────────────────────────────────────────────────────────────
-- Creates a coach, students, drills, sessions and ratings for testing

-- ─── COACH ───────────────────────────────────────────────────────────────────

INSERT INTO users (user_id, name, email, hashed_password, role, phone, location) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Alex Rivera',
    'alex@coachpilot.com',
    '$2b$12$tiSbLOMHp9B.JLZ2i228AejAk1FOxeW1.B70VpDsXlBN24oV2y.uK',
    'coach',
    '+1 713 555 0101',
    'Houston, TX'
);

INSERT INTO coaches (user_id, notes) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    '10 years coaching experience. Specializes in juniors and competitive adults.'
);

-- ─── STUDENTS ────────────────────────────────────────────────────────────────

INSERT INTO users (user_id, name, email, role, phone) VALUES
('b0000000-0000-0000-0000-000000000001', 'Maria Chen',    'maria@email.com',   'student', '+1 713 555 0102'),
('b0000000-0000-0000-0000-000000000002', 'Leo Park',      'leo@email.com',     'student', '+1 713 555 0103'),
('b0000000-0000-0000-0000-000000000003', 'Ana Ruiz',      'ana@email.com',     'student', '+1 713 555 0104'),
('b0000000-0000-0000-0000-000000000004', 'Tom Walker',    'tom@email.com',     'student', '+1 713 555 0105'),
('b0000000-0000-0000-0000-000000000005', 'Priya Sharma',  'priya@email.com',   'student', '+1 713 555 0106'),
('b0000000-0000-0000-0000-000000000006', 'Sam Johnson',   'sam@email.com',     'student', NULL),
('b0000000-0000-0000-0000-000000000007', 'Emma Davis',    NULL,                'student', NULL),
('b0000000-0000-0000-0000-000000000008', 'Jake Wilson',   NULL,                'student', NULL);

INSERT INTO students (user_id, age_group, level, notes) VALUES
('b0000000-0000-0000-0000-000000000001', 'adults',   'advanced',     'Very consistent baseline player. Working on net game.'),
('b0000000-0000-0000-0000-000000000002', 'adults',   'intermediate', 'Strong forehand. Backhand needs work.'),
('b0000000-0000-0000-0000-000000000003', 'adults',   'intermediate', 'Good movement. Needs to work on serve consistency.'),
('b0000000-0000-0000-0000-000000000004', 'adults',   'beginner',     'New to tennis. Very eager to learn.'),
('b0000000-0000-0000-0000-000000000005', 'adults',   'advanced',     'Former college player returning to the game.'),
('b0000000-0000-0000-0000-000000000006', 'kids',     'beginner',     'Age 10. Great attitude and coordination.'),
('b0000000-0000-0000-0000-000000000007', 'kids',     'intermediate', 'Age 13. Competing in junior tournaments.'),
('b0000000-0000-0000-0000-000000000008', 'veterans', 'beginner',     'Age 65. Playing for fitness and fun.');

-- ─── LINK STUDENTS TO COACH ──────────────────────────────────────────────────

INSERT INTO coach_students (coach_id, student_id, started_at) VALUES
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-01-10'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', '2026-01-15'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', '2026-02-01'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', '2026-02-15'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', '2026-03-01'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', '2026-03-10'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', '2026-04-01'),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', '2026-04-15');

-- ─── DRILLS ──────────────────────────────────────────────────────────────────

INSERT INTO drills (drill_id, coach_id, name, description) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Flat Serve Reps',          '30 serves to deuce court, tracking consistency'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Toss Consistency',         'Catch-toss without hitting, 20 reps'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cross Court Forehand',     'Rally cross court from deuce side, 50 balls'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Inside Out Forehand',      'Run around backhand and hit inside out forehand'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Two Handed Backhand Drive','Drive backhand down the line, 40 balls'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Slice Backhand',           'Low slice backhand, stay low through contact'),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Reaction Volley',          'Rapid net feeds, quick hands reaction drill'),
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Half Volley Touch',        'Soft hands at the T, half volley placement'),
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Ladder Drill',             'Quick feet agility ladder, 3 rounds'),
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Spider Drill',             'Run to each corner of the court and back to center');

-- ─── LINK DRILLS TO CATEGORIES ───────────────────────────────────────────────

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000001', drill_category_id FROM drill_categories WHERE name = 'Serve' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000002', drill_category_id FROM drill_categories WHERE name = 'Serve' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000003', drill_category_id FROM drill_categories WHERE name = 'Forehand' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000004', drill_category_id FROM drill_categories WHERE name = 'Forehand' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000005', drill_category_id FROM drill_categories WHERE name = 'Backhand' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000006', drill_category_id FROM drill_categories WHERE name = 'Backhand' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000007', drill_category_id FROM drill_categories WHERE name = 'Volley' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000008', drill_category_id FROM drill_categories WHERE name = 'Volley' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000009', drill_category_id FROM drill_categories WHERE name = 'Footwork' AND coach_id IS NULL;

INSERT INTO drill_drill_categories (drill_id, drill_category_id)
SELECT 'c0000000-0000-0000-0000-000000000010', drill_category_id FROM drill_categories WHERE name = 'Footwork' AND coach_id IS NULL;

-- ─── SESSIONS ────────────────────────────────────────────────────────────────

INSERT INTO sessions (session_id, coach_id, date, type, notes, session_location) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-06-01', 'private', 'Good session. Maria improving on net.',          'Court 1'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2026-06-03', 'group',   'Group session adults. Focused on baseline.',      'Court 2'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2026-06-05', 'private', 'Tom first real session. Very enthusiastic.',      'Court 1'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-06-08', 'group',   'Kids session. Emma and Sam worked on footwork.',  'Court 3'),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-06-10', 'private', 'Priya serve session. Big improvement.',           'Court 1'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2026-06-12', 'group',   'Advanced group. Maria and Priya match play.',     'Court 2'),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-06-15', 'private', 'Leo backhand session. Slice looking better.',     'Court 1'),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '2026-06-17', 'group',   'Mixed group. Focused on volleys and net play.',   'Court 2'),
('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '2026-06-18', 'private', 'Jake veteran session. Fitness and consistency.',  'Court 3'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '2026-06-19', 'group',   'Junior group session. Tournament prep.',          'Court 1');

-- ─── SESSION STUDENTS ────────────────────────────────────────────────────────

-- Session 1 — Maria private
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');

-- Session 2 — Group adults (Leo, Ana, Maria)
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001');

-- Session 3 — Tom private
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004');

-- Session 4 — Kids group (Emma, Sam)
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000007');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006');

-- Session 5 — Priya private
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005');

-- Session 6 — Advanced group (Maria, Priya)
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005');

-- Session 7 — Leo private
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002');

-- Session 8 — Mixed group (Leo, Ana, Tom)
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004');

-- Session 9 — Jake private
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000008');

-- Session 10 — Junior group (Emma, Sam)
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000007');
INSERT INTO session_students VALUES ('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006');

-- ─── SESSION DRILLS ──────────────────────────────────────────────────────────

-- Session 1
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008');

-- Session 2
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005');

-- Session 3
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003');

-- Session 4
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000009');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000010');

-- Session 5
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002');

-- Session 6
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004');

-- Session 7
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006');

-- Session 8
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008');

-- Session 9
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000009');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000010');

-- Session 10
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003');
INSERT INTO session_drills VALUES ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000009');

-- ─── SESSION DRILL RATINGS ───────────────────────────────────────────────────

-- Session 1 — Maria (volley drills)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 8, 'Quick hands, good instincts'),
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 7, 'Half volley placement improving');

-- Session 2 — Group (Leo, Ana, Maria — forehand and backhand)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 7, 'Consistent but flat'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 6, 'Good effort, needs more topspin'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 9, 'Excellent cross court angles'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 5, 'Backhand still needs work'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 7, 'Two hander looking more solid'),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 8, 'Strong backhand wing');

-- Session 3 — Tom (serve and forehand)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 3, 'First time serving, expected'),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 4, 'Getting the concept, needs reps');

-- Session 4 — Kids (footwork)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000007', 8, 'Emma very quick feet'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000006', 6, 'Sam improving but loses focus'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000007', 7, 'Good court coverage'),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000006', 5, 'Needs to work on split step');

-- Session 5 — Priya (serve)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 9, 'Powerful flat serve, great improvement'),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 8, 'Toss very consistent now');

-- Session 6 — Advanced group (Maria, Priya — forehand)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 9, 'Best session yet'),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 8, 'Very aggressive forehand'),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 8, 'Inside out forehand looking great'),
('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 9, 'Dominating with inside out');

-- Session 7 — Leo (backhand)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 7, 'Big improvement from last time'),
('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 6, 'Slice getting better, stay lower');

-- Session 8 — Mixed group (volley)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 6, 'Getting more comfortable at net'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 7, 'Good reflexes'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 4, 'Still hesitant at net'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 6, 'Half volley needs more practice'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 7, 'Nice touch on half volleys'),
('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 3, 'Needs to watch the ball better');

-- Session 9 — Jake (footwork)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000008', 5, 'Good effort for his age'),
('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000008', 4, 'Spider drill tough but he tried hard');

-- Session 10 — Juniors (forehand and footwork)
INSERT INTO session_drill_ratings (session_id, drill_id, student_id, rating, notes) VALUES
('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007', 8, 'Emma tournament ready forehand'),
('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 6, 'Sam improving steadily'),
('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000007', 9, 'Emma fastest footwork drill time yet'),
('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000006', 7, 'Sam much better split step');