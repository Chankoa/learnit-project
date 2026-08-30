alter table public.course_sources
  add column if not exists source_kind text,
  add column if not exists original_url text,
  add column if not exists extracted_content text,
  add column if not exists extraction_status text,
  add column if not exists extraction_error text;

update public.course_sources
set
  source_kind = coalesce(source_kind, 'file'),
  extraction_status = coalesce(extraction_status, 'ready')
where source_kind is null or extraction_status is null;

alter table public.course_sources
  alter column source_kind set default 'file',
  alter column source_kind set not null,
  alter column extraction_status set default 'pending',
  alter column extraction_status set not null,
  alter column file_name drop not null,
  alter column storage_bucket drop not null,
  alter column storage_path drop not null,
  alter column file_size drop not null;

alter table public.course_sources
  drop constraint if exists course_sources_source_kind_check,
  add constraint course_sources_source_kind_check
    check (source_kind in ('file', 'url', 'text')),
  drop constraint if exists course_sources_extraction_status_check,
  add constraint course_sources_extraction_status_check
    check (extraction_status in ('pending', 'ready', 'error')),
  drop constraint if exists course_sources_source_payload_check,
  add constraint course_sources_source_payload_check
    check (
      (source_kind = 'file' and file_name is not null and file_size is not null and storage_bucket is not null and storage_path is not null)
      or (source_kind = 'url' and original_url is not null)
      or (source_kind = 'text' and extracted_content is not null)
    ),
  drop constraint if exists course_sources_ready_content_check,
  add constraint course_sources_ready_content_check
    check (
      extraction_status <> 'ready'
      or source_kind = 'file'
      or nullif(btrim(extracted_content), '') is not null
    );

alter table public.course_sources
  drop constraint if exists course_sources_type_check,
  add constraint course_sources_type_check
    check (type in ('pdf', 'text', 'markdown', 'docx', 'web'));

create index if not exists course_sources_kind_idx
  on public.course_sources(teacher_id, source_kind, created_at desc);

comment on column public.course_sources.source_kind is
  'Physical source kind: file, url, or future inline text.';
comment on column public.course_sources.original_url is
  'Original teacher-provided URL. Redirect destinations may be recorded in metadata.';
comment on column public.course_sources.extracted_content is
  'Server-extracted text used as bounded Forge context; never implies RAG or citation support.';
comment on column public.course_sources.extraction_status is
  'pending, ready, or error. Only ready sources may enter Forge context.';
