## الهدف
ربط المشاريع بالموظفين وبيانات العقد، وربط المهام بكل مشروع داخل جدول كامل مع عدّاد تنازلي ومرفق التقرير النهائي.

## التعديلات على واجهة "إنشاء مشروع جديد"
أضيف للخطوة الثانية الحقول التالية (بالإضافة لتاريخ البداية/النهاية والأعضاء الموجودين):
- قيمة العقد (رقم)
- الدفعات (قائمة: المبلغ + التاريخ + الحالة مدفوع/مستحق)
- المسؤول من الشركة (اسم + رقم جوال)
- الموظف المُكلَّف (Select من قائمة الموظفين)

## نموذج البيانات (state داخل index.tsx)
```ts
type Payment = { amount: number; date: string; paid: boolean };
type ContractInfo = {
  startDate: string; endDate: string; value: number;
  payments: Payment[];
  responsibleName: string; responsiblePhone: string;
  assignee: string; // الموظف المسؤول
};
type TaskStatus = "جاري العمل" | "تم" | "معلق" | "جديد";
type TaskRow = {
  id: string; name: string; platform: string; beneficiary: string;
  documentNo: string; doneDate: string; endDate: string;
  startDate: string; status: TaskStatus; priority: "عالي"|"متوسط"|"منخفض"|"لاشيء";
  attachment?: { name: string; dataUrl: string }; // التقرير النهائي
};
type ProjectMeta = { contract: ContractInfo; tasks: TaskRow[] };
const [projectMeta, setProjectMeta] = useState<Record<string, ProjectMeta>>({});
```

## واجهة المشروع (عند فتح أي مشروع)
يظهر شريط معلومات العقد أعلى الصفحة:
- بداية/نهاية العقد، قيمة العقد، عدد الدفعات (المدفوع/الإجمالي)
- المسؤول واسم الجوال (قابل للنقر للاتصال)
- الموظف المُكلَّف

## جدول المهام
أعمدة: اسم المهمة | اسم المنصة | اسم المستفيد | رقم المستند | تاريخ الإنجاز | تاريخ الانتهاء | الحالة | بداية ونهاية (مع عدّاد تنازلي مباشر) | الأهمية | المرفق (التقرير النهائي – رفع/تنزيل)

- العدّاد التنازلي: مكوّن `Countdown` يحدّث كل ثانية ويعرض الأيام/الساعات المتبقية للنهاية، ويتحوّل للأحمر عند < 24h ويعرض "متأخر" عند الانتهاء.
- زر "+ مهمة" يفتح فورم لإضافة صف.
- خلية المرفق: input file مخفي + زر رفع + اسم الملف بعد الرفع.

## الصلاحيات
- الادمن (`isAdmin = true`): يفتح كل المشاريع، يوزّعها على الموظفين، يعدّل/يحذف أي مهمة أو ملف.
- الموظف: يرى فقط المشاريع التي assignee = اسمه، ويُعدّل حالة مهامه ويرفع التقرير فقط.

## الملفات المتأثرة
- `src/routes/index.tsx` فقط (إضافة state + مكوّن `Countdown` + Modal بيانات العقد + جدول المهام التفاعلي + حقول الفورم الجديدة).

لا تغيير لمنطق backend (كل شيء client state حالياً، مطابق للنمط الحالي في الملف).
