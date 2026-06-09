
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ FOLDER GROUPS ============
CREATE TABLE public.folder_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folder_groups TO authenticated;
GRANT ALL ON public.folder_groups TO service_role;
ALTER TABLE public.folder_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fg read auth" ON public.folder_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "fg admin write" ON public.folder_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fg_updated BEFORE UPDATE ON public.folder_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROJECTS (table only, policies later) ============
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.folder_groups(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROJECT MEMBERS ============
CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm read auth" ON public.project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "pm admin write" ON public.project_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Now safe to define the membership helper
CREATE OR REPLACE FUNCTION public.is_project_member(_project uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.project_members WHERE project_id = _project AND user_id = _user)
$$;

-- Projects policies
CREATE POLICY "projects read" ON public.projects FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_project_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "projects insert" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "projects update" ON public.projects FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR created_by = auth.uid());
CREATE POLICY "projects delete" ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============ SUBFOLDERS ============
CREATE TABLE public.subfolders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  locked boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subfolders TO authenticated;
GRANT ALL ON public.subfolders TO service_role;
ALTER TABLE public.subfolders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sf access" ON public.subfolders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_project_member(project_id, auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_sf_updated BEFORE UPDATE ON public.subfolders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROJECT FILES ============
CREATE TABLE public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  subfolder_id uuid REFERENCES public.subfolders(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'text',
  content text,
  storage_path text,
  size_bytes bigint,
  mime_type text,
  allowed_download uuid[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_files TO authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf access" ON public.project_files FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_project_member(project_id, auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_project_member(project_id, auth.uid()));
CREATE TRIGGER trg_pf_updated BEFORE UPDATE ON public.project_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TASKS ============
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'normal',
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks access" ON public.tasks FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR assignee_id = auth.uid()
    OR created_by = auth.uid()
    OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
  )
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR created_by = auth.uid()
    OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
  );
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ CHAT ============
CREATE TABLE public.chat_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'group',
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_channels TO authenticated;
GRANT ALL ON public.chat_channels TO service_role;
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc read auth" ON public.chat_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "cc write" ON public.chat_channels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR created_by = auth.uid());

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text,
  attachment_path text,
  hidden_from_client boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm read" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "cm insert" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "cm update own" ON public.chat_messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (sender_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cm delete own" ON public.chat_messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============ CALENDAR ============
CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  meeting_url text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'public',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ce read" ON public.calendar_events FOR SELECT TO authenticated
  USING (visibility = 'public' OR created_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ce write" ON public.calendar_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR created_by = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR created_by = auth.uid());
CREATE TRIGGER trg_ce_updated BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NOTES ============
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes own" ON public.notes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_notes_updated BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FINANCE ============
CREATE TABLE public.finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'SAR',
  category text,
  note text,
  occurred_on date NOT NULL DEFAULT CURRENT_DATE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.finance_entries TO authenticated;
GRANT ALL ON public.finance_entries TO service_role;
ALTER TABLE public.finance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin admin" ON public.finance_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fin_updated BEFORE UPDATE ON public.finance_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  contact text,
  service text,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bk admin" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bk_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ACTIVITY LOG ============
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "al read" ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR user_id = auth.uid());
CREATE POLICY "al insert" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============ COMPANY SETTINGS ============
CREATE TABLE public.company_settings (
  id int PRIMARY KEY DEFAULT 1,
  name text NOT NULL DEFAULT 'يسير',
  logo_url text,
  primary_color text,
  contact_email text,
  contact_phone text,
  address text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_row CHECK (id = 1)
);
GRANT SELECT ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cs read" ON public.company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "cs admin write" ON public.company_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cs_updated BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.company_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
