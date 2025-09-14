CREATE TABLE  posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  post_content TEXT NOT NULL,
  post_created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  post_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()

);

ALTER TABLE posts ADD COLUMN avatar_url TEXT;