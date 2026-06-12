# 4. Database Design

### ER Diagram

![[CoachPilot-ERD.png]]

### Overview
The database is built around a central `users` table that serves as the
single source of truth for all people in the system — both coaches and
students. Each user has a profile table (`coaches` or `students`) that
extends their base information depending on their role.

### Key Design Decisions

#### 1. Users as the foundation
All people in the system are users first. A coach and a student both
have a row in `users` containing shared fields like name, email, and
phone. Role-specific data lives in separate profile tables (`coaches`,
`students`) linked via a one-to-one relationship. This makes it easy
to add student login in a future phase without any schema changes.

#### 2. Many-to-many relationships via junction tables
Several entities have many-to-many relationships that are handled
cleanly with junction tables:

| Junction Table | Relationship |
|---|---|
| `coach_students` | A coach can have many students, a student can have many coaches |
| `drill_drill_categories` | A drill can belong to many categories, a category can have many drills |
| `session_students` | A session can have many students, a student can attend many sessions |
| `session_drills` | A session can have many drills, a drill can be used in many sessions |

#### 3. Sessions are decoupled from ratings
Student attendance (`session_students`) and drill performance
(`session_drill_ratings`) are stored separately. This means a coach
can record who attended a session without being required to rate every
student on every drill. Ratings are optional and can be added at any
time.

#### 4. Drill categories are global and custom
Drill categories come in two types controlled by the `coach_id` field:
- **Global categories** (`coach_id: null`) — preloaded by the system,
  visible to all coaches (e.g. Serve, Volley, Footwork)
- **Custom categories** (`coach_id: uuid`) — created by a specific
  coach, private to their account

#### 5. Composite primary keys on junction tables
All junction tables use composite primary keys instead of a separate
`id` column. For example `session_drill_ratings` uses
`(session_id, drill_id, student_id)` as its primary key, which
guarantees a student can only have one rating per drill per session
at the database level.

#### 6. Drill sharing via export
Coaches can share drills and sessions with other coaches via a
shareable link or text export. When imported, the app checks if the
category already exists in the receiving coach's account by name —
if it does the drill is placed under it, if not a new category is
created. This avoids duplicates and keeps each coach's library clean.

#### 7. UUID primary keys
All primary keys use UUIDs instead of auto-incrementing integers.
This improves security (IDs cannot be guessed), avoids conflicts when
scaling, and makes it easier to generate IDs on the client side for
future offline-first mobile support.

### Tables Summary

| Table | Description |
|---|---|
| `users` | All users — coaches and students |
| `coaches` | Coach profile extending users |
| `students` | Student profile extending users |
| `coach_students` | Many-to-many between coaches and students |
| `drill_categories` | Global and custom drill categories |
| `drills` | Drill library per coach |
| `drill_drill_categories` | Many-to-many between drills and categories |
| `sessions` | Coaching sessions |
| `session_students` | Students who attended a session |
| `session_drills` | Drills performed in a session |
| `session_drill_ratings` | Student ratings per drill per session |
