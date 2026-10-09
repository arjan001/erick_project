-- ============================================================================
-- SmartGigs Kenya — Supabase Storage Buckets & Policies
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
-- 2. artist-profiles — Artist profile photos
--    Used by: ArtistProfilePage.jsx (profile_photo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artist-profiles', 'artist-profiles', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 3. team-profiles — Team logos and member photos
--    Used by: TeamProfilePage.jsx, TeamMemberProfilePage.jsx (logo, profile_photo)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-profiles', 'team-profiles', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 4. team-logos — Team entity logo uploads (legacy, use team-profiles)
--    Used by: TeamDashboardPage.jsx, TeamSettingsPage.jsx (team_logo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-logos', 'team-logos', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 5. backer-profiles — Backer / investor organization logos
--    Used by: BackerProfilePage.jsx (logo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('backer-profiles', 'backer-profiles', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 6. backer-logos — Backer logos (legacy, use backer-profiles)
--    Used by: BackerProfilePage.jsx (logo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('backer-logos', 'backer-logos', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 7. client-profiles — Client/ProjectOwner profile photos
--    Used by: ClientProfilePage.jsx (profile_photo_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-profiles', 'client-profiles', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 8. project-images — Client project banner/cover images
--    Used by: SubmitProject flow, JobBoardPage.jsx generate-image (image_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 9. portfolio-clips — Portfolio clip video + thumbnail uploads
--    Used by: ArtistProfilePage.jsx, TeamPortfolioPage.jsx (video_url, thumbnail_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-clips', 'portfolio-clips', true, 209715200, array['video/mp4','video/webm','video/quicktime','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 10. portfolio-media — Portfolio media (legacy, use portfolio-clips)
--    Used by: ArtistProfilePage.jsx, TeamPortfolioPage.jsx (video_url, thumbnail_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 209715200, array['video/mp4','video/webm','video/quicktime','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 11. job-images — Job posting images
--    Used by: JobPostingModal.jsx (image_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('job-images', 'job-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 12. job-attachments — Job posting file attachments
--    Used by: ClientJobModal.jsx (attachments)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('job-attachments', 'job-attachments', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','application/pdf','video/mp4','video/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 13. message-attachments — File/image attachments sent in chat
--    Used by: MessagesPage.jsx (Message.file_url)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('message-attachments', 'message-attachments', true, 26214400, array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 14. product-images — Shop product photos
--    Used by: AdminProductsPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 15. shop-images — Shop and auction images
--    Used by: AdminShopAuctionsPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-images', 'shop-images', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 16. cms-assets — SEO/CMS OG images, navbar/footer logos
--    Used by: AdminSEOCMSPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cms-assets', 'cms-assets', true, 15728640, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 17. featured-content — Featured creatives and brands images
--    Used by: AdminFeaturedCreativesPage.jsx, AdminFeaturedBrandsPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('featured-content', 'featured-content', true, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 18. category-images — Content category images
--    Used by: AdminCategoriesPage.jsx
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('category-images', 'category-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- ---------------------------------------------------------------------------
-- 19. general-uploads — Fallback bucket for any other upload (docs, resumes)
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
  buckets text[] := array['avatars','artist-profiles','team-profiles','team-logos','backer-profiles','backer-logos','client-profiles','project-images','portfolio-clips','portfolio-media','job-images','job-attachments','message-attachments','product-images','shop-images','cms-assets','featured-content','category-images','general-uploads'];
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
-- (profiles, teams, backers, clients, projects, portfolio clips, jobs, messages,
-- shop products, CMS assets, featured content, categories, and generic uploads)
-- are now provisioned.
-- ============================================================================