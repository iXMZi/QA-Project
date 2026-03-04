import { User, PlanItem, PlanMetadata, QCLogItem, QCConfig, AuditType, ReportStatus } from '../types';

export const DEFAULT_ROLES = [
    'مدير النظام',
    'مدير عام المديرية العامة للتخطيط والتطوير',
    'مدير دائرة الجودة والتميز المؤسسي',
    'رئيس قسم ضمان الجودة',
    'عضو ضمان جودة',
    'وحدة رقابية'
];

export const DEFAULT_USERS: User[] = [
    { 
        id: 1, 
        name: 'مدير الجودة', 
        username: 'admin',
        password: '123',
        email: 'admin@system.gov', 
        role: 'مدير النظام', 
        status: 'active',
        permissions: { createPlan: true, approvePlan: true, startPlan: true, performReview: true, respondToFindings: true, reviewAndEscalate: true, sendToFollowUp: true, editReport: true, approveReport: true }
    },
    {
        id: 5,
        name: 'مدير عام التخطيط والتطوير',
        username: 'dg_planning',
        password: '123',
        email: 'planning.dg@sai.gov.om',
        role: 'مدير عام المديرية العامة للتخطيط والتطوير',
        status: 'active',
        permissions: { createPlan: true, approvePlan: true, startPlan: false, performReview: false, respondToFindings: false, reviewAndEscalate: true, sendToFollowUp: true, editReport: true, approveReport: true }
    },
    {
        id: 4,
        name: 'مدير دائرة الجودة والتميز المؤسسي',
        username: 'director_quality',
        password: '123',
        email: 'quality.dir@sai.gov.om',
        role: 'مدير دائرة الجودة والتميز المؤسسي',
        status: 'active',
        permissions: { createPlan: true, approvePlan: true, startPlan: false, performReview: false, respondToFindings: false, reviewAndEscalate: true, sendToFollowUp: true, editReport: true, approveReport: true }
    },
    { 
        id: 2, 
        name: 'علي', 
        username: 'head',
        password: '123',
        email: 'head@system.gov', 
        role: 'رئيس قسم ضمان الجودة', 
        status: 'active',
        permissions: { createPlan: true, approvePlan: true, startPlan: false, performReview: false, respondToFindings: false, reviewAndEscalate: true, sendToFollowUp: true, editReport: true, approveReport: true }
    },
    { 
        id: 3, 
        name: 'سعود', 
        username: 'reviewer',
        password: '123',
        email: 'reviewer@system.gov', 
        role: 'عضو ضمان جودة', 
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: true, performReview: true, respondToFindings: false, reviewAndEscalate: false, sendToFollowUp: false, editReport: true, approveReport: false }
    },
    {
        id: 101,
        name: 'المديرية العامة للرقابة على وحدات الدفاع والأمن',
        username: 'defense',
        password: '123',
        email: 'defense@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 102,
        name: 'المديرية العامة للرقابة على الوحدات المالية والاقتصادية',
        username: 'financial',
        password: '123',
        email: 'financial@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 103,
        name: 'المديرية العامة للرقابة على الوحدات الخدمية',
        username: 'service',
        password: '123',
        email: 'service@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 104,
        name: 'المديرية العامة للرقابة المالية والإدارية بمحافظة ظفار',
        username: 'dhofar',
        password: '123',
        email: 'dhofar@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 105,
        name: 'المديرية العامة للرقابة المالية والإدارية بمحافظتي شمال الباطنة ومسندم',
        username: 'batinah_north',
        password: '123',
        email: 'batinah_north@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 106,
        name: 'المديرية العامة للرقابة على الهيئات وشركات الخدمات العامة',
        username: 'public_services',
        password: '123',
        email: 'public_services@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 107,
        name: 'المديرية العامة للرقابة على الاستثمارات والشركات',
        username: 'investments',
        password: '123',
        email: 'investments@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 108,
        name: 'المديرية العامة للرقابة على الطاقة والمعادن',
        username: 'energy',
        password: '123',
        email: 'energy@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 109,
        name: 'دائرة الرقابة المالية والإدارية في محافظتي الداخلية والوسطى',
        username: 'dakhiliyah',
        password: '123',
        email: 'dakhiliyah@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 110,
        name: 'دائرة الرقابة المالية والإدارية في محافظتي شمال وجنوب الشرقية',
        username: 'sharqiyah',
        password: '123',
        email: 'sharqiyah@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 111,
        name: 'دائرة الرقابة المالية والإدارية في محافظة جنوب الباطنة',
        username: 'batinah_south',
        password: '123',
        email: 'batinah_south@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 112,
        name: 'دائرة الرقابة المالية والإدارية بمحافظة الظاهرة',
        username: 'dhahirah',
        password: '123',
        email: 'dhahirah@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    },
    {
        id: 113,
        name: 'دائرة الرقابة المالية والإدارية بمحافظة البريمي',
        username: 'buraimi',
        password: '123',
        email: 'buraimi@sai.gov.om',
        role: 'وحدة رقابية',
        status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: false, performReview: false, respondToFindings: true, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    }
];

export const DEFAULT_PLANS: PlanItem[] = [
    { id: 1, targetType: 'Mission', targetName: "وزارة الصحة - توريد أدوية", date: "2024-03-15", auditType: AuditType.FINANCIAL, status: "مخطط", year: 2024, justification: "أهمية مادية عالية ومخاطر توريد.", evaluationPeriod: 'Q1-2024', changeStatus: 'original' },
    { id: 2, targetType: 'TeamLeader', targetName: "أحمد محمد (مدير تدقيق)", date: "2024-04-01", auditType: AuditType.PERFORMANCE, status: "مخطط", year: 2024, justification: "تقييم دوري لرؤساء الفرق.", evaluationPeriod: 'Q2-2024', changeStatus: 'original' },
    { id: 3, targetType: 'TeamMember', targetName: "سارة علي (مدقق مساعد)", date: "2024-05-10", auditType: AuditType.COMPLIANCE, status: "مؤجل", year: 2024, justification: "موظف جديد يحتاج للتوجيه.", evaluationPeriod: 'Q2-2024', changeStatus: 'original' },
    { id: 4, targetType: 'Mission', targetName: "الجامعة الوطنية - عقود الصيانة", date: "2024-06-20", auditType: AuditType.FINANCIAL, status: "مخطط", year: 2024, justification: "شكاوى متكررة حول العقود.", evaluationPeriod: 'Q2-2024', changeStatus: 'original' },
];

export const DEFAULT_ANNUAL_PLANS_META: Record<number, PlanMetadata> = {
    2024: {
      year: 2024,
      title: "الخطة السنوية لضمان الجودة لعام",
      description: "تهدف هذه الخطة إلى تعزيز الامتثال لمعايير الإنتوساي في كافة المهام الرقابية.",
      objectives: "- رفع كفاءة رؤساء الفرق في التخطيط.\n- التأكد من جودة أدلة الإثبات في الملفات المالية.\n- تقليل وقت إصدار التقارير.",
      isApproved: false
    }
};

export const DEFAULT_QC_LOGS: QCLogItem[] = [
      {
          id: '101',
          reportNumber: 'QC-2024-001',
          missionName: 'وزارة الصحة - توريد أدوية',
          targetType: 'Mission',
          auditType: 'تدقيق مالي',
          status: 'completed' as ReportStatus,
          date: '2024-03-25',
          scoreClassification: 'عناية مهنية فاعلة',
          reviewerId: 3, 
          reviewerName: 'على',
          resultData: {
              auditType: 'تدقيق مالي',
              targetName: 'وزارة الصحة - توريد أدوية',
              targetType: 'Mission',
              overallSummary: 'تمت المراجعة...',
              stages: []
          },
          approvalHistory: [
              { date: '2024-03-25', user: 'علي', role: 'رئيس قسم ضمان الجودة', action: 'submit' },
              { date: '2024-03-26', user: 'رئيس قسم ضمان الجودة', role: 'رئيس قسم ضمان الجودة', action: 'approve' },
              { date: '2024-03-27', user: 'مدير النظام', role: 'مدير النظام', action: 'approve' }
          ]
      }
];

export const DEFAULT_MISSION_CONFIG: QCConfig = [
  {
    name: "أولاً: تقييم مرحلة التخطيط وتحديد المخاطر",
    criteria: [
      "فهم الجهة وبيئة العمل: هل تم توثيق فهم شامل لنشاط الجهة، بيئتها التشغيلية، هيكلها القانوني، ونظام الرقابة الداخلية؟",
      "تقييم المخاطر وتحديد الاستجابة: هل تم تحديد مخاطر الأخطاء الجوهرية (بما فيها الاحتيال) وربطها بإجراءات استجابة فعالة؟",
      "تحديد الأهمية النسبية: هل تم تحديد مستوى الأهمية النسبية بشكل سليم واستخدامه in تصميم الإجراءات？",
      "إعداد برنامج الرقابة: هل تم إعداد البرنامج وتحديد الأهداف والنطاق والمعايير والمصادقة عليها؟"
    ]
  },
  {
    name: "ثانياً: تقييم مرحلة الإشراف والتوجيه",
    criteria: [
      "التوجيه والإرشاد والدعم: هل توجد أدلة على تقديم المشرف توجيهاً كافياً للفريق في جميع المراحل؟",
      "مراجعة العمل: هل تم مراجعة أوراق العمل والوثائق الرئيسية من قبل المشرف في الوقت المناسب وتقييم الأحكام المهنية؟",
      "إدارة الفريق وتوزيع المهام: هل تم توزيع المهام بناءً على الكفاءات وعقد اجتماعات دورية لمناقشة التقدم؟"
    ]
  },
  {
    name: "ثالثاً: تقييم مرحلة التنفيذ وأدلة الإثبات",
    criteria: [
      "كفاية وملاءمة الأدلة: هل الأدلة كافية ومناسبة لدعم النتائج؟ وهل هي متنوعة وموثوقة؟",
      "تطبيق الإجراءات الرقابية: هل تم تنفيذ إجراءات البرنامج وتطبيق أساليب العينات بشكل منهجي؟",
      "تقييم التقديرات/النماذج: هل تم تقييم التقديرات المحاسبية أو النماذج التحليلية لضمان سلامتها؟",
      "الاستجابة للانحرافات: هل تم التحقيق في الانحرافات وتقييم أثر البيانات الخاطئة غير المصححة؟",
      "الشك والحكم المهني: هل تم توثيق كيفية تطبيق الشك والحكم المهني في القرارات الهامة؟"
    ]
  },
  {
    name: "رابعاً: تقييم مرحلة التوثيق",
    criteria: [
      "اكتمال الملف وتنظيمه: هل الملف مكتمل من التخطيط للتقرير، ومنظم ومفهرس بشكل يربط الإجراءات بالأدلة؟",
      "جودة ورقة العمل: هل توضح الورقة الغرض، الإجراء، النتائج، والاستنتاج بوضوح؟",
      "التوقيع والمراجعة: هل تم توقيع الأوراق من المعد والمراجع والمشرف في الوقت المناسب؟",
      "ربط الأدلة بالنتائج: هل يمكن لمراجع خارجي فهم العمل والتحقق من أن النتائج مدعومة بالأدلة؟"
    ]
  },
  {
    name: "خامساً: تقييم مرحلة التقرير والتواصل",
    criteria: [
      "محتوى التقرير والاستنتاجات: هل التقرير واضح ومتوازن؟ وهل الاستنتاجات مبنية منطقياً على أدلة الملف؟",
      "جودة التوصيات: هل التوصيات عملية وتعالج الأسباب الجذرية للملاحظات؟",
      "التواصل والردود: هل تم منح الجهة فرصة للرد، وهل تم تضمين وتقييم ردها في التقرير؟",
      "إجراءات الشكلية والتوقيت: هل صدر التقرير وفق الإجراءات الشكلية وفي الوقت المناسب؟"
    ]
  },
  {
    name: "سادساً: تقييم مرحلة المتابعة والتحقق",
    criteria: [
      "خطة العمل التصحيحية: هل أعدت الجهة خطة واضحة بمسؤوليات وجداول زمنية لمعالجة التوصيات?",
      "متابعة تنفيذ التوصيات: هل تم التحقق بشكل فعال وموثق من أن الإجراءات التصحيحية عالجت القصور؟"
    ]
  }
];

export const DEFAULT_LEADER_CONFIG: QCConfig = [
  {
    name: "أولاً: التخطيط وتصميم الاستجابة",
    criteria: [
      "مراجعة وإقرار فهم الجهة: هل راجع رئيس الفريق وأقرّ توثيق فهم الفريق لطبيعة الجهة، بيئتها التشغيلية، ونظام رقابتها الداخلية؟",
      "الإشراف على تقييم المخاطر: هل تأكد من أن عملية تحديد المخاطر (بما فيها الاحتيال) شاملة ومبررة؟",
      "إقرار الأهمية النسبية: هل راجع وأقر مستوى الأهمية النسبية وأساس الحساب？",
      "اعتماد خطة الرقابة وبرنامج العمل: هل اعتمد الخطة وتأكد من استجابتها للمخاطر？",
      "تخطيط الموارد وتوزيع المهام: هل وضع خطة واقعية ووزع المهام حسب الكفاءات؟"
    ]
  },
  {
    name: "ثانياً: التنفيذ وضبط الجودة",
    criteria: [
      "المراجعة والإشراف المستمر: هل أجرى مراجعات فنية دورية لأوراق العمل مع توثيق الملاحظات？",
      "ضمان كفاية الأدلة: هل وجه لضمان أدلة كافية ومناسبة لدعم النتائج？",
      "حل القضايا الفنية والتشاور: هل تدخل لحل الصعوبات الفنية وتوثيق الاستشارات? ",
      "تطبيق الحكم المهني: هل أشرف على تطبيق الحكم المهني في القرارات الجوهرية؟",
      "إدارة التواصل مع الجهة: هل أدار قنوات الاتصال مع الجهة باحترافية أثناء التنفيذ？"
    ]
  },
  {
    name: "ثالثاً: التقرير والتواصل",
    criteria: [
      "مراجعة وإقرار مسودة التقرير: هل تأكد من أن الاستنتاجات مدعومة بالأدلة والصياغة موضوعية؟",
      "صياغة التوصيات وجودتها: هل تأكد من أن التوصيات عملية وتعالج الأسباب الجذرية？",
      "قيادة اجتماع مناقشة التقرير: هل قاد المناقشة مع الجهة بفعالية وعرض النتائج باحترافية？",
      "تقييم ردود الجهة: هل قيم الردود بموضوعية واتخذ قرارات التعديل المناسبة؟"
    ]
  },
  {
    name: "رابعاً: الإشراف وإدارة الأداء",
    criteria: [
      "التوجيه والتدريب أثناء العمل: هل ساهم في تطوير مهارات الفريق الفنية？",
      "إدارة الوقت والموارد: هل أدار الجدول الزمني لضمان الالتزام بالمواعيد؟",
      "إدارة ديناميكيات الفريق: هل خلق بيئة إيجابية وتعامل مع الخلافات بحكمة? ",
      "تقييم أداء الأعضاء: هل شارك في تقييم الفريق بموضوعية ومهنية؟"
    ]
  },
  {
    name: "خامساً: التوثيق وإغلاق المهمة",
    criteria: [
      "التوثيق والأرشفة: هل تم تنظيم وأرشفة ملفات المهمة بشكل صحيح؟",
      "الدروس المستفادة: هل تم استخلاص الدروس المستفادة ومشاركتها مع الفريق? "
    ]
  }
];

export const DEFAULT_MEMBER_CONFIG: QCConfig = [
  {
    name: "أولاً: الالتزام المهني والسلوكي",
    criteria: [
      "الالتزام بقواعد السلوك المهني: هل التزم بالنزاهة والموضوعية والسرية？",
      "الالتزام بساعات العمل والحضور: هل كان منضبطاً في المواعيد؟"
    ]
  },
  {
    name: "ثانياً: الجودة الفنية للأعمال",
    criteria: [
      "فهم المهمة والبرنامج: هل أظهر فهماً جيداً لأهداف الإجراءات المسندة إليه؟",
      "جودة أوراق العمل: هل أوراق العمل معدة بدقة، موثقة، وتدعم النتائج? ",
      "كفاية أدلة الإثبات: هل جمع أدلة كافية ومناسبة؟"
    ]
  },
  {
    name: "ثالثاً: التواصل والعمل الجماعي",
    criteria: [
      "التواصل مع المشرف: هل أبلغ المشرف بالتقدم والمشاكل في الوقت المناسب؟",
      "التعاون مع الفريق: هل تعاون بفعالية مع زملائه؟"
    ]
  }
];

export const DEFAULT_PROGRAM_CONFIG: QCConfig = [
  {
    name: "أولاً: ووضوح الأهداف والنطاق",
    criteria: [
      "وضوح الأهداف: هل أهداف البرنامج محددة بوضوح وقابلة للقياس？",
      "تحديد النطاق: هل تم تحديد النطاق الزمني والمكاني والموضوعي بشكل دقيق؟"
    ]
  },
  {
    name: "ثانياً: تغطية المخاطر",
    criteria: [
      "ربط المخاطر بالإجراءات: هل تغطي إجراءات الفحص كافة المخاطر الجوهرية المحددة؟",
      "تحديث التقييم: هل تم تحديث البرنامج بناءً على فهم جديد للمخاطر؟"
    ]
  },
  {
    name: "ثالثاً: كفاية الإجراءات والموارد",
    criteria: [
      "تفصيل الإجراءات: هل خطوات العمل مفصلة بما يكفي لتوجيه فريق العمل？",
      "توزيع الموارد: هل الموارد البشرية والزمنية المقدرة تتناسب مع حجم العمل؟"
    ]
  }
];
