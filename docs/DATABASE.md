# 🗄️ Database Schema & Backend

This document outlines the database structure and backend logic powered by **Supabase (PostgreSQL)** for the **Pure-Plan-Focus** project.

---

## 🏛️ Core Tables

The application uses several tables to manage a user's productivity and lifestyle data. All tables include `id` (UUID), `user_id` (UUID), `created_at` (TIMESTAMPTZ), and `updated_at` (TIMESTAMPTZ).

### 1. `profiles`
Stores extended user information, automatically created upon signup via a database trigger.
- `user_id` (UUID, Unique): Links to `auth.users`.
- `display_name` (TEXT)
- `avatar_url` (TEXT)

### 2. `tasks`
The central table for the Task Manager.
- `name` (TEXT)
- `category` (TEXT): Work, Life, Health, Personal, Home.
- `priority` (TEXT): High, Medium, Low.
- `due_date` (DATE)
- `completed` (BOOLEAN)

### 3. `habits`
Tracks daily recurring activities.
- `day` (TEXT): Monday, Tuesday, etc.
- `habit_name` (TEXT)
- `done` (BOOLEAN)

### 4. `meals`
Manages meal planning and nutrition tracking.
- `type` (TEXT): Breakfast, Lunch, Dinner, Snack.
- `day` (TEXT)
- `name` (TEXT)

### 5. `workouts` & `workout_templates`
Detailed fitness tracking.
- `workout_type` (TEXT): Strength, Cardio, Mobility, Recovery, Push, Pull, Legs.
- `intensity` (TEXT): Low, Moderate, High.
- `exercises` (JSONB): Structured list of exercises, sets, and reps.
- `calories` (INTEGER)

### 6. `finance_entries`
Simple income and expense tracking.
- `type` (TEXT): income, expense.
- `name` (TEXT)
- `amount` (NUMERIC 12,2)

---

## 🔐 Security & RLS

Every table in the `public` schema has **Row Level Security (RLS)** enabled. This ensures that users can only read, insert, update, or delete their own data.

### Standard RLS Policy
```sql
CREATE POLICY "Users manage own data" 
ON public.[table_name] 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
```

---

## ⚡ Automation & Triggers

### `updated_at` Refresh
All tables use a trigger to automatically update the `updated_at` column whenever a row is modified.
- **Function**: `public.update_updated_at_column()`
- **Trigger**: `update_[table_name]_updated_at`

### Profile Creation
New users are automatically onboarded with a default profile.
- **Function**: `public.handle_new_user()`
- **Trigger**: `on_auth_user_created` (linked to `auth.users`)

---

## 📜 Migration History

Migrations are managed via the Supabase CLI and stored in the `/supabase/migrations` directory.

1. **`[...]initial_schema`**: Sets up core tables (profiles, tasks, goals, habits, meals, shopping, finance).
2. **`[...]expand_workouts`**: Adds rich fields to workouts (type, intensity, exercises) and templates.
3. **`[...]expand_meals`**: (Assumed similar expansion for advanced meal planning).
