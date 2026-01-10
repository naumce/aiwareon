# Authentication Pattern

Pattern name: Anonymous-First Authentication

Rules:
- Every visitor gets a Supabase anonymous session
- Anonymous users have a real user_id
- Trial usage is tied to user_id, not localStorage
- Anonymous users can upgrade to full accounts
- User_id must never change during upgrade

Applies to:
- Landing page
- Fast try
- Studio
