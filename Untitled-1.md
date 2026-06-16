نفّذ ميزة واحدة فقط بدقّة في src/routes/index.tsx و src/lib/data.functions.ts. أرني التغييرات قبل الموافقة:

الهدف: عند فتح أي مشروع، قسم لإدارة أعضائه مع صلاحيات لكل عضو داخل المشروع.

1) في src/lib/data.functions.ts:
   - عدّل addProjectMember ليقبل حقلاً اختيارياً perms (كائن Record<string, boolean>) ويخزّنه في عمود project_members.perms (موجود بالفعل، jsonb). 
   - أضف دالة خادم جديدة setProjectMemberPerms({ project_id, user_id, perms }) محمية بـ requireSupabaseAuth، تعمل update على project_members.perms للعضو المحدد.
   - تأكّد أن listProjectMembers يُرجع عمود perms أيضاً.

2) في src/routes/index.tsx، داخل صفحة المشروع المفتوح (ProjectDetail أو ما يقابلها):
   - أضف زر/قسم "أعضاء المشروع".
   - اعرض قائمة كل المستخدمين (عبر adminListUsers من @/lib/auth.functions باستخدام useServerFn) مع checkbox لإضافة/إزالة العضو من المشروع (باستدعاء addProjectMember / removeProjectMember).
   - لكل عضو مضاف، أظهر toggles لهذه الصلاحيات داخل المشروع: project_edit, files_view, files_edit, chat_view, tasks_edit. عند تغييرها استدعِ setProjectMemberPerms لحفظها.
   - حمّل أعضاء المشروع وصلاحياتهم عبر listProjectMembers عند فتح المشروع.

3) في واجهة الموظف (غير الأدمن): اقرأ صلاحياته داخل المشروع من project_members.perms (للمشروع الحالي والمستخدم الحالي) واستخدمها لتعطيل/تفعيل أزرار التعديل داخل المشروع.

لا تنفّذ أي شيء آخر غير هذه الميزة. حافظ على التنسيق ولا تكسر شيئاً.