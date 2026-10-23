-- Update message-attachments bucket to support audio, video, and larger files
-- Run this in Supabase SQL Editor

-- Update the message-attachments bucket to support audio and video with 20MB limit
update storage.buckets 
set 
  file_size_limit = 20971520, -- 20MB
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','application/pdf','audio/webm','audio/mp3','audio/wav','audio/mpeg','video/mp4','video/webm','video/quicktime']
where id = 'message-attachments';

-- Recreate policies for message-attachments bucket
drop policy if exists "message-attachments_public_read" on storage.objects;
create policy "message-attachments_public_read" on storage.objects for select using (bucket_id = 'message-attachments');

drop policy if exists "message-attachments_auth_insert" on storage.objects;
create policy "message-attachments_auth_insert" on storage.objects for insert with check (bucket_id = 'message-attachments' and auth.role() = 'authenticated');

drop policy if exists "message-attachments_owner_update" on storage.objects;
create policy "message-attachments_owner_update" on storage.objects for update using (bucket_id = 'message-attachments' and auth.uid() = owner);

drop policy if exists "message-attachments_owner_delete" on storage.objects;
create policy "message-attachments_owner_delete" on storage.objects for delete using (bucket_id = 'message-attachments' and auth.uid() = owner);
