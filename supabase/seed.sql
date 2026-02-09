-- Seed data for testing
-- Note: In production, users will be created through Supabase Auth

-- Insert sample users
INSERT INTO users (id, email, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Johnson'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob Smith'),
  ('33333333-3333-3333-3333-333333333333', 'charlie@example.com', 'Charlie Davis'),
  ('44444444-4444-4444-4444-444444444444', 'diana@example.com', 'Diana Martinez'),
  ('55555555-5555-5555-5555-555555555555', 'evan@example.com', 'Evan Wilson')
ON CONFLICT (id) DO NOTHING;

-- Insert sample high-fives
INSERT INTO high_fives (from_user_id, to_user_id, message, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Great job on the presentation! 🎉', NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Thanks for helping me debug that issue! 🙏', NOW() - INTERVAL '2 days'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Amazing work on the new feature! ⭐', NOW() - INTERVAL '3 days'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Your code review was super helpful! 💪', NOW() - INTERVAL '4 days'),
  ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'Love your positive attitude! 🌟', NOW() - INTERVAL '5 days'),
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Excellent teamwork today! 🤝', NOW() - INTERVAL '6 days'),
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Thanks for the coffee chat! ☕', NOW() - INTERVAL '1 hour'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'You saved the day with that fix! 🚀', NOW() - INTERVAL '2 hours'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Great leadership on the project! 👏', NOW() - INTERVAL '3 hours'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Your documentation is fantastic! 📚', NOW() - INTERVAL '4 hours')
ON CONFLICT DO NOTHING;
