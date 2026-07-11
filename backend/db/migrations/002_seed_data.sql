-- ─── GLOBAL DRILL CATEGORIES ─────────────────────────────────────────────────

INSERT INTO drill_categories (drill_category_id, coach_id, name) VALUES
    (gen_random_uuid(), NULL, 'Serve'),
    (gen_random_uuid(), NULL, 'Return'),
    (gen_random_uuid(), NULL, 'Forehand'),
    (gen_random_uuid(), NULL, 'Backhand'),
    (gen_random_uuid(), NULL, 'Volley'),
    (gen_random_uuid(), NULL, 'Overhead'),
    (gen_random_uuid(), NULL, 'Footwork'),
    (gen_random_uuid(), NULL, 'Movement'),
    (gen_random_uuid(), NULL, 'Drop Shot'),
    (gen_random_uuid(), NULL, 'Lob'),
    (gen_random_uuid(), NULL, 'Cross Court'),
    (gen_random_uuid(), NULL, 'Down the Line'),
    (gen_random_uuid(), NULL, 'Baseline Rally'),
    (gen_random_uuid(), NULL, 'Net Play'),
    (gen_random_uuid(), NULL, 'Match Play'),
    (gen_random_uuid(), NULL, 'Mental Training'),
    (gen_random_uuid(), NULL, 'Fitness'),
    (gen_random_uuid(), NULL, 'Warm Up'),
    (gen_random_uuid(), NULL, 'Cool Down'),
    (gen_random_uuid(), NULL, 'Agility');

-- ─── GLOBAL DRILLS ───────────────────────────────────────────────────────────

INSERT INTO drills (drill_id, coach_id, name, description) VALUES
('c0000000-0000-0000-0000-000000000001', NULL, 'Flat Serve Reps',           '30 serves to deuce court, tracking consistency'),
('c0000000-0000-0000-0000-000000000002', NULL, 'Toss Consistency',          'Catch-toss without hitting, 20 reps'),
('c0000000-0000-0000-0000-000000000003', NULL, 'Cross Court Forehand',      'Rally cross court from deuce side, 50 balls'),
('c0000000-0000-0000-0000-000000000004', NULL, 'Inside Out Forehand',       'Run around backhand and hit inside out forehand'),
('c0000000-0000-0000-0000-000000000005', NULL, 'Two Handed Backhand Drive', 'Drive backhand down the line, 40 balls'),
('c0000000-0000-0000-0000-000000000006', NULL, 'Slice Backhand',            'Low slice backhand, stay low through contact'),
('c0000000-0000-0000-0000-000000000007', NULL, 'Reaction Volley',           'Rapid net feeds, quick hands reaction drill'),
('c0000000-0000-0000-0000-000000000008', NULL, 'Half Volley Touch',         'Soft hands at the T, half volley placement'),
('c0000000-0000-0000-0000-000000000009', NULL, 'Ladder Drill',              'Quick feet agility ladder, 3 rounds'),
('c0000000-0000-0000-0000-000000000010', NULL, 'Spider Drill',              'Run to each corner of the court and back to center');

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

-- ─── COURTS ──────────────────────────────────────────────────────────────────

INSERT INTO courts (court_id, name, city, area) VALUES
('e0000000-0000-0000-0000-000000000001', 'Memorial Park Tennis Center', 'Houston', 'Memorial'),
('e0000000-0000-0000-0000-000000000002', 'Westside Tennis Club',        'Houston', 'Westside'),
('e0000000-0000-0000-0000-000000000003', 'River Oaks Country Club',     'Houston', 'River Oaks'),
('e0000000-0000-0000-0000-000000000004', 'Hermann Park Courts',         'Houston', 'Museum District'),
('e0000000-0000-0000-0000-000000000005', 'Fonde Recreation Center',     'Houston', 'Midtown');