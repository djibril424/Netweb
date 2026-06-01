# Netweb
Social media platform 
NETWEB - Minimal Private Social Network
A minimalistic, secure, private social application combining microblogging feeds and direct messaging.
Database Initialization Schema
Execute this SQL schema within the Supabase SQL editor to initialize tables, relationships, and basic RLS.sql
-- Profiles Table
CREATE TABLE public.profiles (
id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
username text UNIQUE NOT NULL,
avatar_url text NOT NULL,
bio varchar(100) NOT NULL,
updated_at timestamp DEFAULT now()
);
-- Posts Table (Ephemeral)
CREATE TABLE public.posts (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
content varchar(140) NOT NULL,
created_at timestamp NOT NULL DEFAULT now()
);
-- Messages Table
CREATE TABLE public.messages (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
content text NOT NULL,
reply_context jsonb DEFAULT NULL,
created_at timestamp NOT NULL DEFAULT now()
);
-- Friend Requests Table
CREATE TABLE public.friend_requests (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
status text NOT NULL DEFAULT 'pending',
created_at timestamp NOT NULL DEFAULT now(),
CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);
-- Friendships Table
CREATE TABLE public.friendships (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
user_id_1 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
user_id_2 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
created_at timestamp NOT NULL DEFAULT now(),
CONSTRAINT unique_friendship UNIQUE (user_id_1, user_id_2),
CONSTRAINT sorted_users CHECK (user_id_1 < user_id_2)
);
-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
-- Enable Realtime for Messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
