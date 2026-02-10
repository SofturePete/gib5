# Supabase Migrations

## How to Apply Migrations

### Option 1: Via Supabase Dashboard (Recommended for Production)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the contents of `20260210_fix_rls_policies.sql`
5. Paste and run the SQL

### Option 2: Via Supabase CLI (Local Development)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Initialize Supabase in your project (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Or apply a specific migration
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres" -f supabase/migrations/20260210_fix_rls_policies.sql
```

## Migration: 20260210_fix_rls_policies.sql

**Purpose:** Fix Row Level Security (RLS) policies to enable:
- User registration (insert policy)
- @-mention autocomplete (read all users)
- Viewing all high-fives for history/stats
- Multi-recipient high-fives

**Changes:**
- ✅ Users can insert during registration
- ✅ Authenticated users can read all users
- ✅ Authenticated users can read all high-fives
- ✅ Users can only update their own profile
- ✅ Users can only insert high-fives as sender

**Safe to run:** Yes, this migration drops and recreates policies safely.

## Testing After Migration

```sql
-- Test 1: Check if authenticated users can read all users
SELECT * FROM users;

-- Test 2: Check if authenticated users can read all high-fives
SELECT * FROM high_fives;

-- Test 3: Verify you can only update your own profile
UPDATE users SET name = 'Test' WHERE id = auth.uid();

-- Test 4: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'high_fives');
```
