
-- 1) chat_messages: restrict reads to project members / admins / sender
DROP POLICY IF EXISTS "cm read" ON public.chat_messages;
CREATE POLICY "cm read members" ON public.chat_messages FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.chat_channels c
    WHERE c.id = chat_messages.channel_id
      AND (
        c.created_by = auth.uid()
        OR (c.project_id IS NOT NULL AND public.is_project_member(c.project_id, auth.uid()))
      )
  )
);

-- 2) chat_channels: restrict reads to members / admin / creator
DROP POLICY IF EXISTS "cc read auth" ON public.chat_channels;
CREATE POLICY "cc read members" ON public.chat_channels FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR created_by = auth.uid()
  OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
);

-- 3) project_members: only fellow members / admin / self
DROP POLICY IF EXISTS "pm read auth" ON public.project_members;
CREATE POLICY "pm read members" ON public.project_members FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR public.is_project_member(project_id, auth.uid())
);

-- 4) company_settings: only admins
DROP POLICY IF EXISTS "cs read" ON public.company_settings;
CREATE POLICY "cs read admin" ON public.company_settings FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5) tasks: allow assignees to update their own tasks (WITH CHECK)
DROP POLICY IF EXISTS "tasks access" ON public.tasks;
CREATE POLICY "tasks access" ON public.tasks FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR assignee_id = auth.uid()
  OR created_by = auth.uid()
  OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR assignee_id = auth.uid()
  OR created_by = auth.uid()
  OR (project_id IS NOT NULL AND public.is_project_member(project_id, auth.uid()))
);

-- 6) Lock down SECURITY DEFINER helpers from direct API execution.
-- They remain callable from inside RLS policies (the planner uses the function owner).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_project_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
