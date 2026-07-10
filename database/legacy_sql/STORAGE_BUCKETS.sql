-- ============================================================================
-- Studio22 — Supabase Storage Buckets & Policies
-- Run this in the Supabase SQL editor to create/update all storage buckets
-- used across the app for image, video, and file uploads.
-- Safe to re-run: uses ON CONFLICT / IF NOT EXISTS guards.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. avatars — Artist / ProjectOwner / User profile photos
--    Used by: Settings.jsx, ArtistProfilePage.jsx (profile_photo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 2. team-logos — Team entity logo uploads
--    Used by: TeamDashboardPage.jsx, TeamSettingsPage.jsx (team_logo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-logos', 'team-logos', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 3. backer-logos — Backer / investor organization logos
--    Used by: BackerProfilePage.jsx (logo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('backer-logos', 'backer-logos', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 4. project-images — Client project banner/cover images
--    Used by: SubmitProject flow, JobBoardPage.jsx generate-image (image_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 5. portfolio-media — Portfolio clip video + thumbnail uploads
--    Used by: ArtistProfilePage.jsx, TeamPortfolioPage.jsx (video_url, thumbnail_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 209715200, array['video/mp4','video/webm','video/quicktime','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 6. message-attachments — File/image attachments sent in chat
--    Used by: MessagesPage.jsx (Message.file_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('message-attachments', 'message-attachments', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 7. product-images — Shop product photos
--    Used by: AdminProductsPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 8. cms-assets — SEO/CMS OG images, navbar/footer logos
--    Used by: AdminSEOCMSPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-assets', 'cms-assets', true, 15728640, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 9. general-uploads — Fallback bucket for any other upload (docs, resumes)
--    Used by: generic UploadFile integration calls
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('general-uploads', 'general-uploads', true, 52428800, null)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ============================================================================
-- Storage Policies — allow authenticated users to upload, everyone to read
-- (public buckets), and owners to update/delete their own files.
-- ============================================================================

do $$
declare
  bucket_name text;
  buckets text[] := array['avatars','team-logos','backer-logos','project-images','portfolio-media','message-attachments','product-images','cms-assets','general-uploads'];
begin
  foreach bucket_name in array buckets loop

    execute format(
      'drop policy if exists "%1$s_public_read" on storage.objects;',
      bucket_name
    );
    execute format(
      'create policy "%1$s_public_read" on storage.objects for select using (bucket_id = %2$L);',
      bucket_name, bucket_name
    );

    execute format(
      'drop policy if exists "%1$s_auth_insert" on storage.objects;',
      bucket_name
    );
    execute format(
      'create policy "%1$s_auth_insert" on storage.objects for insert with check (bucket_id = %2$L and auth.role() = %3$L);',
      bucket_name, bucket_name, 'authenticated'
    );

    execute format(
      'drop policy if exists "%1$s_owner_update" on storage.objects;',
      bucket_name
    );
    execute format(
      'create policy "%1$s_owner_update" on storage.objects for update using (bucket_id = %2$L and auth.uid() = owner);',
      bucket_name, bucket_name
    );

    execute format(
      'drop policy if exists "%1$s_owner_delete" on storage.objects;',
      bucket_name
    );
    execute format(
      'create policy "%1$s_owner_delete" on storage.objects for delete using (bucket_id = %2$L and auth.uid() = owner);',
      bucket_name, bucket_name
    );

  end loop;
end $$;

-- ============================================================================
-- Done. All buckets used by image/video/file upload features across the app
-- (profiles, teams, backers, projects, portfolio clips, messages, shop
-- products, CMS assets, and generic uploads) are now provisioned.
-- ============================================================================