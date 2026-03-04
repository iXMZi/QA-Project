
import React, { useState, useMemo } from 'react';
import { 
  CalendarDaysIcon, 
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  UserGroupIcon,
  UserIcon,
  DocumentMagnifyingGlassIcon,
  DocumentPlusIcon,
  ListBulletIcon,
  FlagIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArchiveBoxArrowDownIcon,
  InboxArrowDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  PlayCircleIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  LightBulbIcon,
  XCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  Bars3BottomRightIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { AuditType, AuditAnalysisResult, QCTargetType, User, PlanMetadata, QCLogItem, PlanItem, ReportStatus, FollowUpItem, ComplianceStatus } from '../types';

// --- Shared Helpers (Exported for use in ManagementViews if needed) ---
export const getTargetIcon = (type: string | QCTargetType) => {
    switch(type) {
        case 'Mission': return <DocumentMagnifyingGlassIcon className="w-5 h-5 text-blue-600" />;
        case 'TeamLeader': return <UserGroupIcon className="w-5 h-5 text-indigo-600" />;
        case 'TeamMember': return <UserIcon className="w-5 h-5 text-teal-600" />;
        case 'AuditProgram': return <DocumentTextIcon className="w-5 h-5 text-cyan-600" />;
        default: return <DocumentMagnifyingGlassIcon className="w-5 h-5 text-slate-500" />;
    }
};

export const getTargetLabel = (type: string | QCTargetType) => {
    switch(type) {
        case 'Mission': return 'مهمة رقابية';
        case 'TeamLeader': return 'رئيس فريق';
        case 'TeamMember': return 'عضو فريق';
        case 'AuditProgram': return 'برنامج رقابي';
        default: return type;
    }
};

// --- Confirmation Modal Component (Shared) ---
export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden scale-100">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{message}</p>
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={onCancel}
                            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md"
                        >
                            تأكيد
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Deletion Confirmation Modal with Reason ---
export interface DeletionConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

export const DeletionConfirmModal: React.FC<DeletionConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');
    
    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert('يرجى ذكر سبب الحذف للمتابعة.');
            return;
        }
        onConfirm(reason);
        setReason(''); // Reset
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-fade-in-up">
                <div className="p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrashIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
                    
                    <div className="space-y-2 mb-6">
                        <label className="block text-sm font-bold text-slate-700">سبب الحذف <span className="text-red-500">*</span></label>
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="يرجى توضيح سبب الحذف هنا..."
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm min-h-[100px] resize-none"
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={() => { setReason(''); onCancel(); }}
                            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button 
                            onClick={handleConfirm}
                            disabled={!reason.trim()}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                            تأكيد الحذف
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Follow Up Log View ---
export interface FollowUpLogViewProps {
    items: FollowUpItem[];
    currentUser: User;
    onViewReport: (reportId: string) => void;
    onDelete?: (id: string) => void;
}

export const FollowUpLogView: React.FC<FollowUpLogViewProps> = ({ items, currentUser, onViewReport, onDelete }) => {
    const myItems = currentUser.role === 'وحدة رقابية' 
        ? items.filter(item => item.controlUnitName === currentUser.name)
        : items; 

    return (
        <div className="animate-fade-in space-y-6 font-sans">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="w-7 h-7 text-indigo-600" />
                    سجل المتابعة (تتبع المعالجات)
                </h2>
                <p className="text-slate-500 mt-1">
                    {currentUser.role === 'وحدة رقابية' 
                        ? 'قائمة الملاحظات الواردة من دائرة الجودة التي تتطلب رداً وإجراءً تصحيحياً.'
                        : 'سجل عام لمتابعة حالات عدم المطابقة وفرص التحسين المفتوحة لدى الوحدات.'
                    }
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[1000px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم التقرير</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">اسم المهمة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الوحدة الرقابية المختصة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">نوع الملاحظة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 w-1/4">نص الملاحظة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myItems.length > 0 ? myItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500 font-bold">{item.reportNumber}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800 font-bold">{item.missionName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-1">
                                        <BuildingOffice2Icon className="w-4 h-4 text-slate-400" />
                                        {item.controlUnitName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.findingType === 'NON_CONFORMANCE' ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded w-fit whitespace-nowrap">
                                                <XCircleIcon className="w-4 h-4" />
                                                عدم مطابقة
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded w-fit whitespace-nowrap">
                                                <LightBulbIcon className="w-4 h-4" />
                                                فرصة تحسين
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800 line-clamp-2" title={item.findingText}>{item.findingText}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'Open' ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                                بانتظار الرد
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
                                                تم الرد / مغلق
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button 
                                            onClick={() => onViewReport(item.reportId)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 px-3 py-2 rounded-lg shadow-sm transition-all whitespace-nowrap"
                                        >
                                            <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                                            {currentUser.role === 'وحدة رقابية' ? 'تفعيل الرد' : 'عرض الردود'}
                                        </button>
                                        {onDelete && currentUser.role === 'مدير النظام' && (
                                            <button 
                                                onClick={() => { if(confirm('حذف هذه الملاحظة؟')) onDelete(item.id); }}
                                                className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                                                title="حذف الملاحظة"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                                        <div className="p-3 bg-slate-100 rounded-full">
                                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                                        </div>
                                        <p>سجل نظيف! لا توجد ملاحظات معلقة.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard View ---
export interface DashboardViewProps {
    plans: PlanItem[];
    qcLogs: QCLogItem[];
    users: User[];
    followUpItems: FollowUpItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ plans, qcLogs, users, followUpItems }) => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(new Date().getFullYear());
        plans.forEach(p => years.add(p.year));
        return Array.from(years).sort((a, b) => b - a);
    }, [plans]);

    const plannedItems = plans.filter(p => p.year === selectedYear);
    const yearLogs = qcLogs.filter(l => new Date(l.date).getFullYear() === selectedYear);
    
    // --- Execution Statistics ---
    const totalPlanned = plannedItems.length;
    
    const executedItemsList = plannedItems.filter(p => p.status !== 'مخطط' && p.status !== 'مؤجل');
    const totalExecuted = executedItemsList.length;

    const executedOriginal = executedItemsList.filter(p => !p.changeStatus || p.changeStatus === 'original').length;
    const executedAdded = executedItemsList.filter(p => p.changeStatus === 'added_post_approval').length;

    const executionRate = totalPlanned > 0 ? Math.round((totalExecuted / totalPlanned) * 100) : 0;

    const completedItems = yearLogs.filter(l => l.status === 'completed').length;
    
    // --- Findings Statistics (NC / IO) ---
    let totalNC = 0;
    let totalIO = 0;

    yearLogs.forEach(log => {
        if (log.status !== 'draft' && log.resultData && log.resultData.stages) {
             log.resultData.stages.forEach(stage => {
                stage.criteriaResults.forEach(c => {
                    if (c.status === ComplianceStatus.NON_CONFORMANCE) totalNC++;
                    if (c.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY) totalIO++;
                });
             });
        }
    });

    const totalFindings = totalNC + totalIO;

    // --- Resolution Statistics (from FollowUp Items) ---
    const yearLogIds = new Set(yearLogs.map(l => l.id));
    const relevantFollowUps = followUpItems.filter(item => yearLogIds.has(item.reportId));

    const resolvedFollowUps = relevantFollowUps.filter(i => i.status === 'Resolved').length;
    const totalSentFollowUps = relevantFollowUps.length;
    const resolutionRate = totalSentFollowUps > 0 ? Math.round((resolvedFollowUps / totalSentFollowUps) * 100) : 0;

    // Specific counts for Card 3
    const ncFollowUps = relevantFollowUps.filter(f => f.findingType === 'NON_CONFORMANCE');
    const resolvedNC = ncFollowUps.filter(f => f.status === 'Resolved').length;
    
    const ioFollowUps = relevantFollowUps.filter(f => f.findingType === 'IMPROVEMENT_OPPORTUNITY');
    const resolvedIO = ioFollowUps.filter(f => f.status === 'Resolved').length;


    // --- Other Stats ---
    const missionCount = plannedItems.filter(p => p.targetType === 'Mission').length;
    const leaderCount = plannedItems.filter(p => p.targetType === 'TeamLeader').length;
    const memberCount = plannedItems.filter(p => p.targetType === 'TeamMember').length;
    const programCount = plannedItems.filter(p => p.targetType === 'AuditProgram').length;

    const reviewers = users.filter(u => u.permissions.performReview);
    const reviewerStats = reviewers.map(r => {
        const assignedInYear = yearLogs.filter(l => l.reviewerId === r.id);
        const completed = assignedInYear.filter(l => l.status === 'completed').length;
        const pending = assignedInYear.filter(l => l.status !== 'completed' && l.status !== 'draft' && l.status !== 'assigned').length;
        return { name: r.name, completed, pending };
    });

    return (
        <div className="animate-fade-in space-y-6 font-sans">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ChartPieIcon className="w-7 h-7 text-blue-600" />
                        لوحة المؤشرات العامة
                    </h2>
                    <p className="text-slate-500 mt-1">قياس أداء الخطة السنوية وجودة العمليات الرقابية لعام {selectedYear}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <label className="text-sm font-bold text-slate-600">عرض بيانات سنة:</label>
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-white border border-slate-300 text-slate-800 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-1.5 outline-none font-bold cursor-pointer"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* General Metrics Grid - Removed "In Progress" Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold mb-1">إجمالي الخطة السنوية ({selectedYear})</p>
                            <h3 className="text-3xl font-extrabold text-slate-800">{totalPlanned}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CalendarDaysIcon className="w-6 h-6" /></div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex gap-2">
                        <span>مهمة: {missionCount}</span>
                        <span>|</span>
                        <span>أفراد: {leaderCount + memberCount}</span>
                        <span>|</span>
                        <span>برامج: {programCount}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold mb-1">نسبة بدء التنفيذ</p>
                            <h3 className="text-3xl font-extrabold text-slate-800">{executionRate}%</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><PlayCircleIcon className="w-6 h-6" /></div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${executionRate}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                         <span title="من أصل الخطة المعتمدة">الأصلية: <span className="font-bold text-slate-700">{executedOriginal}</span></span>
                         <span title="أضيفت بعد الاعتماد">إضافية: <span className="font-bold text-slate-700">{executedAdded}</span></span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-bold mb-1">تقارير منجزة (هذا العام)</p>
                            <h3 className="text-3xl font-extrabold text-green-700">{completedItems}</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckBadgeIcon className="w-6 h-6" /></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">تم الاعتماد النهائي في {selectedYear}</p>
                </div>
            </div>

            {/* Quality Findings & Compliance Section */}
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-8">
                <ScaleIcon className="w-5 h-5 text-purple-600" />
                مؤشرات جودة الأداء والامتثال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* البطاقة الأولى: إجمالي الملاحظات (NC & IO) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-40 hover:shadow-md transition-shadow border-r-4 border-r-indigo-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-black mb-1">إجمالي الملاحظات (NC & IO)</p>
                            <h3 className="text-3xl font-black text-slate-800">{totalFindings}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><DocumentMagnifyingGlassIcon className="w-6 h-6" /></div>
                    </div>
                    <div className="flex gap-4 pt-2 border-t border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold">عدم مطابقة</span>
                            <span className="text-sm font-black text-red-600">{totalNC}</span>
                        </div>
                        <div className="w-px bg-slate-100 h-8"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold">فرص تحسين</span>
                            <span className="text-sm font-black text-amber-600">{totalIO}</span>
                        </div>
                    </div>
                </div>

                {/* البطاقة الثانية: موقف حالات عدم المطابقة والفرص التحسينية */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-40 hover:shadow-md transition-shadow border-r-4 border-r-purple-500">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-xs font-black">موقف حالات (NC) و (IO)</p>
                        <ChartPieIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-[10px] mb-1 font-bold">
                                <span className="text-red-600">عدم مطابقة</span>
                                <span className="text-slate-600">{totalFindings > 0 ? Math.round((totalNC/totalFindings)*100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full rounded-full" style={{ width: `${totalFindings > 0 ? (totalNC/totalFindings)*100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] mb-1 font-bold">
                                <span className="text-amber-600">فرص تحسين</span>
                                <span className="text-slate-600">{totalFindings > 0 ? Math.round((totalIO/totalFindings)*100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalFindings > 0 ? (totalIO/totalFindings)*100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* البطاقة الثالثة: موقف معالجة الملاحظات لحالات عدم المطابقة والفرص التحسينية */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-40 hover:shadow-md transition-shadow border-r-4 border-r-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-slate-500 text-xs font-black">موقف معالجة (NC) و (IO)</p>
                        <ArrowTrendingUpIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                            <div className="text-[9px] text-blue-700 font-bold mb-1">معالجة (NC)</div>
                            <div className="text-xs font-black text-slate-800">{resolvedNC} <span className="text-[10px] text-slate-400 font-normal">من</span> {totalNC}</div>
                            <div className="w-full bg-white h-1 rounded-full mt-1">
                                <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${totalNC > 0 ? (resolvedNC/totalNC)*100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                            <div className="text-[9px] text-amber-700 font-bold mb-1">معالجة (IO)</div>
                            <div className="text-xs font-black text-slate-800">{resolvedIO} <span className="text-[10px] text-slate-400 font-normal">من</span> {totalIO}</div>
                            <div className="w-full bg-white h-1 rounded-full mt-1">
                                <div className="bg-amber-600 h-1 rounded-full" style={{ width: `${totalIO > 0 ? (resolvedIO/totalIO)*100 : 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* البطاقة الرابعة: موقف معالجة الملاحظات (كما هي - نسبة مئوية عامة) */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-40 hover:shadow-md transition-shadow border-r-4 border-r-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-xs font-black mb-1">موقف معالجة الملاحظات</p>
                            <h3 className="text-3xl font-black text-emerald-600">{resolutionRate}%</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircleIcon className="w-6 h-6" /></div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2">
                        <div className="bg-emerald-500 h-2 rounded-full shadow-sm" style={{ width: `${resolutionRate}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold italic">إجمالي المعالجات المعتمدة نهائياً</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-slate-500" />
                        توزيع الخطة حسب النوع ({selectedYear})
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-slate-700 flex items-center gap-2"><DocumentMagnifyingGlassIcon className="w-4 h-4 text-blue-600" /> مهام رقابية</span>
                                <span className="text-slate-600">{missionCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${totalPlanned ? (missionCount/totalPlanned)*100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-slate-700 flex items-center gap-2"><UserGroupIcon className="w-4 h-4 text-indigo-600" /> رؤساء فرق</span>
                                <span className="text-slate-600">{leaderCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${totalPlanned ? (leaderCount/totalPlanned)*100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-slate-700 flex items-center gap-2"><UserIcon className="w-4 h-4 text-teal-600" /> أعضاء فرق</span>
                                <span className="text-slate-600">{memberCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-teal-600 h-full rounded-full" style={{ width: `${totalPlanned ? (memberCount/totalPlanned)*100 : 0}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-slate-700 flex items-center gap-2"><DocumentTextIcon className="w-4 h-4 text-cyan-600" /> برامج رقابية</span>
                                <span className="text-slate-600">{programCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${totalPlanned ? (programCount/totalPlanned)*100 : 0}%` }}></div>
                            </div>
                        </div>
                        {totalPlanned === 0 && (
                            <p className="text-center text-xs text-slate-400 py-4">لا توجد خطة مدخلة لهذه السنة</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-slate-500" />
                        أداء فريق الجودة لعام {selectedYear}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                                <tr>
                                    <th className="px-4 py-3">المقيم</th>
                                    <th className="px-4 py-3">الأعمال المنجزة</th>
                                    <th className="px-4 py-3">قيد التنفيذ / المراجعة</th>
                                    <th className="px-4 py-3">نسبة الإنجاز</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reviewerStats.map((r, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 font-bold text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold">{r.completed}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold">{r.pending}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-green-600 h-1.5 rounded-full" 
                                                        style={{ width: `${(r.completed + r.pending) > 0 ? (r.completed / (r.completed + r.pending)) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-500">
                                                    {(r.completed + r.pending) > 0 ? Math.round((r.completed / (r.completed + r.pending)) * 100) : 0}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reviewerStats.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-4 text-slate-400">لا يوجد مقيمين نشطين</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Removed "Work in Progress" Table Section */}
        </div>
    );
};

// --- QC Log View ---
export interface QCLogViewProps {
    logs: QCLogItem[];
    onView: (data: AuditAnalysisResult) => void;
    onCreate: (type: 'mission' | 'team_leader' | 'team_member' | 'audit_program') => void;
    currentUser: User;
    onDeleteLog?: (id: string, reason: string) => void;
    onContinue?: (log: QCLogItem) => void; // Added property
}

export const QCLogView: React.FC<QCLogViewProps> = ({ logs, onView, onCreate, currentUser, onDeleteLog, onContinue }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'my_reports' | 'all'>('my_reports');
    const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

    const pendingLogs = logs.filter(log => {
        if (currentUser.role.includes('رئيس قسم') && (log.status === 'pending_head' || log.status === 'returned_to_head')) return true;
        if (currentUser.role === 'مدير النظام' && log.status === 'pending_director') return true;
        return false;
    });

    const myLogs = logs.filter(log => log.reviewerId === currentUser.id);

    const allLogs = logs.filter(log => {
        if (currentUser.role === 'مدير النظام') return true;
        return log.status === 'completed'; 
    });

    const entityLogs = logs.filter(log => {
        if (currentUser.role !== 'وحدة رقابية') return false;
        return log.resultData.targetName === currentUser.name || log.missionName.includes(currentUser.name);
    });

    React.useEffect(() => {
        if (pendingLogs.length > 0 && currentUser.role !== 'وحدة رقابية') {
            setActiveTab('pending');
        } else if (currentUser.role === 'مقيم جودة') {
            setActiveTab('my_reports');
        }
    }, [currentUser.role]);

    const getDisplayedLogs = () => {
        if (currentUser.role === 'وحدة رقابية') {
            return entityLogs;
        }
        switch (activeTab) {
            case 'pending': return pendingLogs;
            case 'my_reports': return myLogs;
            case 'all': return allLogs;
            default: return [];
        }
    };

    const getStatusBadge = (status: ReportStatus) => {
        switch(status) {
            case 'completed':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">معتمد نهائياً</span>;
            case 'pending_head':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">بانتظار رئيس القسم</span>;
            case 'returned_to_head':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">معاد لرئيس القسم</span>;
            case 'pending_director':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">بانتظار المدير</span>;
            case 'returned':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">معاد للتصحيح (للمقيم)</span>;
            case 'assigned':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700">مكلف - بانتظار البدء</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700">مسودة</span>;
        }
    };

    const handleConfirmDelete = (reason: string) => {
        if (deleteLogId && onDeleteLog) {
            onDeleteLog(deleteLogId, reason);
            setDeleteLogId(null);
        }
    };

    const displayedLogs = getDisplayedLogs();

    return (
        <div className="animate-fade-in space-y-6 font-sans">
             <DeletionConfirmModal 
                isOpen={!!deleteLogId}
                title="تأكيد حذف التقرير"
                message="سيتم نقل هذا التقرير إلى سلة المهملات. لا يمكن استعراضه من السجلات النشطة بعد الحذف."
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteLogId(null)}
            />

            {isSelectionModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden scale-100 animate-fade-in-up">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">اختر نوع التقييم</h3>
                            <button onClick={() => setIsSelectionModalOpen(false)} className="text-white/80 hover:text-white">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => { onCreate('mission'); setIsSelectionModalOpen(false); }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <DocumentMagnifyingGlassIcon className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">مهمة رقابية</span>
                            </button>

                            <button
                                onClick={() => { onCreate('team_leader'); setIsSelectionModalOpen(false); }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-50 transition-all group"
                            >
                                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <UserGroupIcon className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-indigo-700 text-sm">رئيس فريق</span>
                            </button>

                            <button
                                onClick={() => { onCreate('team_member'); setIsSelectionModalOpen(false); }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group"
                            >
                                <div className="p-3 bg-teal-100 rounded-full text-teal-600 mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-teal-700 text-sm">عضو فريق</span>
                            </button>

                            <button
                                onClick={() => { onCreate('audit_program'); setIsSelectionModalOpen(false); }}
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-100 hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
                            >
                                <div className="p-3 bg-cyan-100 rounded-full text-cyan-600 mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                    <DocumentTextIcon className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-cyan-700 text-sm">برنامج رقابي</span>
                            </button>
                        </div>
                        <div className="px-6 pb-4 flex justify-end">
                             <button onClick={() => setIsSelectionModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-7 h-7 text-indigo-600" />
                        سجل تقارير مراجعة الجودة
                        </h2>
                        <p className="text-slate-500 mt-1">
                           {currentUser.role === 'وحدة رقابية' 
                            ? 'عرض التقارير والتقييمات الخاصة بالوحدة الرقابية'
                            : 'إدارة ومتابعة تقارير الجودة ومراحل الاعتماد'
                           }
                        </p>
                    </div>
                    {currentUser.permissions.performReview && (
                        <button 
                            onClick={() => setIsSelectionModalOpen(true)}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                        >
                            <PlusIcon className="w-5 h-5" />
                            إجراء تقييم جديد
                        </button>
                    )}
                </div>
            </div>

            {currentUser.role !== 'وحدة رقابية' && (
                <div className="flex gap-2 border-b border-slate-200 pb-1">
                    {(currentUser.role.includes('رئيس قسم') || currentUser.role === 'مدير النظام') && (
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${
                                activeTab === 'pending'
                                ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]'
                                : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <InboxArrowDownIcon className="w-4 h-4" />
                            بانتظار موافقتي
                            {pendingLogs.length > 0 && (
                                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingLogs.length}</span>
                            )}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('my_reports')}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${
                            activeTab === 'my_reports'
                            ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]'
                            : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ListBulletIcon className="w-4 h-4" />
                        تقاريري
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${
                            activeTab === 'all'
                            ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]'
                            : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                        الأرشيف العام
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl rounded-tl-none shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">رقم التقرير</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الهدف / المهمة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">مجال التدقيق</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">تاريخ آخر إجراء</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">المقيم</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedLogs.length > 0 ? displayedLogs.map((log) => {
                                const isAssigned = log.status === 'assigned' && log.reviewerId === currentUser.id;
                                const isDraftOrReturned = (log.status === 'draft' || log.status === 'returned') && log.reviewerId === currentUser.id;
                                const isHeadReturn = log.status === 'returned_to_head' && currentUser.role.includes('رئيس قسم');

                                return (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500 font-semibold">{log.reportNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                {getTargetIcon(log.targetType)}
                                                <span className="text-sm font-bold text-slate-800">{log.missionName}</span>
                                            </div>
                                            {log.resultData.targetType === 'Mission' && log.resultData.targetName && (
                                                <span className="text-[10px] text-slate-400 mr-7 flex items-center gap-1">
                                                    <BuildingOffice2Icon className="w-3 h-3" />
                                                    {log.resultData.targetName}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{log.auditType}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{log.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{log.reviewerName || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            {getStatusBadge(log.status)}
                                            {(log.status === 'completed') && (
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {log.scoreClassification}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                if (onContinue && (isAssigned || isDraftOrReturned || isHeadReturn)) {
                                                    onContinue(log);
                                                } else {
                                                    onView(log.resultData);
                                                }
                                            }}
                                            className={`flex items-center gap-2 text-xs font-bold p-2 rounded-lg transition-colors
                                                ${(activeTab === 'pending' && log.status === 'pending_head') 
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                                                    : isAssigned
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md ring-2 ring-emerald-100'
                                                        : (isDraftOrReturned || isHeadReturn)
                                                            ? 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100'
                                                            : 'text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50'
                                                }`}
                                        >
                                            {(activeTab === 'pending' && log.status === 'pending_head') ? (
                                                <>
                                                    <CheckBadgeIcon className="w-4 h-4" />
                                                    مراجعة واعتماد
                                                </>
                                            ) : isAssigned ? (
                                                <>
                                                    <PlayCircleIcon className="w-4 h-4" />
                                                    بدء التقييم
                                                </>
                                            ) : (isDraftOrReturned || isHeadReturn) ? (
                                                <>
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                    {log.status === 'draft' ? 'استكمال' : 'تعديل / تصحيح'}
                                                </>
                                            ) : (
                                                <>
                                                    <EyeIcon className="w-4 h-4" />
                                                    عرض
                                                </>
                                            )}
                                        </button>
                                        {onDeleteLog && (currentUser.role === 'مدير النظام' || log.status === 'draft' || log.status === 'assigned') && (
                                            <button 
                                                onClick={() => setDeleteLogId(log.id)}
                                                className="text-slate-400 hover:text-red-600 p-2 transition-colors"
                                                title="حذف"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                                        <div className="p-3 bg-slate-100 rounded-full">
                                            <InboxArrowDownIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p>لا توجد تقارير في هذه القائمة.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- PlanView ---
export interface PlanViewProps {
  onStartQC?: (item: PlanItem, reviewer?: User, dates?: { start: string, end: string }) => void;
  users: User[];
  plans: PlanItem[];
  setPlans: (plans: PlanItem[]) => void;
  annualPlansMeta: Record<number, PlanMetadata>;
  setAnnualPlansMeta: (meta: Record<number, PlanMetadata>) => void;
  onDeletePlan?: (id: number) => void;
  logActivity?: (action: string, target: string, details?: string) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({ onStartQC, users = [], plans, setPlans, annualPlansMeta, setAnnualPlansMeta, onDeletePlan, logActivity }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null); 
  const [isCreatingNewYear, setIsCreatingNewYear] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlanItemForStart, setSelectedPlanItemForStart] = useState<PlanItem | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [evalStartDate, setEvalStartDate] = useState<string>('');
  const [evalEndDate, setEvalEndDate] = useState<string>('');
  const [isPlanMetaModalOpen, setIsPlanMetaModalOpen] = useState(false);

  const [planMetaForm, setPlanMetaForm] = useState<PlanMetadata>({
      year: 2024,
      title: '',
      description: '',
      objectives: ''
  });

  const [newPlan, setNewPlan] = useState<Partial<PlanItem>>({
    year: 2024,
    targetType: 'Mission',
    targetName: '',
    controlUnitName: '',
    auditType: AuditType.FINANCIAL,
    status: 'مخطط',
    justification: '',
    evaluationPeriod: ''
  });

  const filteredPlan = plans.filter(item => item.year === selectedYear);
  const currentPlanMeta = annualPlansMeta[selectedYear];
  const isPlanApproved = currentPlanMeta?.isApproved || false;

  const controlUnits = users.filter(u => u.role === 'وحدة رقابية');

  const initiateStart = (item: PlanItem) => {
      setSelectedPlanItemForStart(item);
      setSelectedReviewerId(''); 
      setEvalStartDate('');
      setEvalEndDate('');
      setIsAssignModalOpen(true);
  };

  const confirmStart = () => {
      if (selectedPlanItemForStart && onStartQC) {
          const reviewer = users.find(u => u.id.toString() === selectedReviewerId);
          onStartQC(selectedPlanItemForStart, reviewer, { start: evalStartDate, end: evalEndDate });
          setIsAssignModalOpen(false);
          setSelectedPlanItemForStart(null);
      }
  };

  const handleDeleteAnnualPlan = () => {
      const updatedMeta = { ...annualPlansMeta };
      delete updatedMeta[selectedYear];
      setAnnualPlansMeta(updatedMeta);
      setPlans(plans.filter(p => p.year !== selectedYear));
      if(logActivity) logActivity('حذف الخطة السنوية', `عام ${selectedYear}`, 'تم حذف الخطة السنوية بالكامل');
      setIsDeletePlanModalOpen(false);
      alert(`تم حذف الخطة السنوية لعام ${selectedYear} بنجاح.`);
  };

  const handleSavePlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.targetName || !newPlan.date) return;
    
    let currentChangeStatus = editingItem?.changeStatus || 'original';
    if (isPlanApproved) {
        if (editingItem) {
            currentChangeStatus = 'modified_post_approval';
        } else {
            currentChangeStatus = 'added_post_approval';
        }
    }

    if (editingItem) {
        setPlans(plans.map(p => p.id === editingItem.id ? { 
            ...p, 
            ...newPlan, 
            id: p.id,
            changeStatus: currentChangeStatus as any
        } as PlanItem : p));
        if(logActivity) logActivity('تعديل بند خطة', newPlan.targetName, 'تعديل بيانات المهمة');
    } else {
        const newItem: PlanItem = {
          id: Date.now(),
          targetType: newPlan.targetType as QCTargetType,
          targetName: newPlan.targetName!,
          controlUnitName: newPlan.controlUnitName || '',
          date: newPlan.date!,
          auditType: newPlan.auditType as AuditType,
          status: newPlan.status || 'مخطط',
          year: selectedYear, // Fixed to use selected year from view
          justification: newPlan.justification || '',
          evaluationPeriod: newPlan.evaluationPeriod || '',
          changeStatus: currentChangeStatus as any
        };
        setPlans([...plans, newItem]);
        if(logActivity) logActivity('إضافة بند خطة', newItem.targetName, `إضافة مهمة جديدة لعام ${newItem.year}`);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setNewPlan({ year: selectedYear, targetType: 'Mission', targetName: '', controlUnitName: '', auditType: AuditType.FINANCIAL, status: 'مخطط', justification: '', evaluationPeriod: '' });
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewPlan({ year: selectedYear, targetType: 'Mission', targetName: '', controlUnitName: '', auditType: AuditType.FINANCIAL, status: 'مخطط', justification: '', evaluationPeriod: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: PlanItem) => {
    setEditingItem(item);
    setNewPlan({ ...item });
    setIsModalOpen(true);
  };

  const confirmDeleteItem = () => {
      if(deleteId) {
          if (onDeletePlan) {
              onDeletePlan(deleteId);
          } else {
              setPlans(plans.map(p => p.id === deleteId ? { ...p, isDeleted: true } : p));
              if(logActivity) logActivity('حذف بند خطة', deleteId.toString(), 'نقل إلى سلة المهملات');
          }
          setDeleteId(null);
      }
  };

  const handleSavePlanMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (annualPlansMeta[planMetaForm.year] && isCreatingNewYear) {
         if (!confirm(`توجد بالفعل خطة لعام ${planMetaForm.year}. هل تريد استبدالها؟`)) {
             return;
         }
    }
    
    setAnnualPlansMeta({
        ...annualPlansMeta,
        [planMetaForm.year]: planMetaForm
    });
    if(logActivity) logActivity(isCreatingNewYear ? 'إنشاء خطة سنوية' : 'تحديث خطة سنوية', `عام ${planMetaForm.year}`);
    setSelectedYear(planMetaForm.year);
    setIsPlanMetaModalOpen(false);
    setIsCreatingNewYear(false);
  };

  const openEditPlanMetaModal = () => {
      setIsCreatingNewYear(false);
      setPlanMetaForm({
          year: selectedYear,
          title: currentPlanMeta?.title || '',
          description: currentPlanMeta?.description || '',
          objectives: currentPlanMeta?.objectives || ''
      });
      setIsPlanMetaModalOpen(true);
  };

  const openNewPlanModal = () => {
      setIsCreatingNewYear(true);
      setPlanMetaForm({
          year: selectedYear + 1,
          title: '',
          description: '',
          objectives: ''
      });
      setIsPlanMetaModalOpen(true);
  };

  const togglePlanApproval = () => {
    if (isPlanApproved) {
        if(confirm("هل أنت متأكد من إلغاء اعتماد الخطة؟ سيتم إيقاف إمكانية بدء المهام.")) {
             const updated = { ...annualPlansMeta, [selectedYear]: { ...currentPlanMeta, isApproved: false } };
             setAnnualPlansMeta(updated);
             if(logActivity) logActivity('إلغاء اعتماد خطة', `عام ${selectedYear}`);
        }
    } else {
        if(!currentPlanMeta) {
            alert("يرجى إنشاء استراتيجية الخطة السنوية أولاً (الأهداف والتفاصيل).");
            return;
        }
        const updated = { ...annualPlansMeta, [selectedYear]: { ...currentPlanMeta, isApproved: true } };
        setAnnualPlansMeta(updated);
        if(logActivity) logActivity('اعتماد خطة', `عام ${selectedYear}`);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 font-sans">
      <ConfirmModal 
        isOpen={!!deleteId}
        title="حذف بند من الخطة"
        message="هل أنت متأكد من رغبتك في حذف هذا البند؟ سيتم نقله إلى سلة المهملات."
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        isOpen={isDeletePlanModalOpen}
        title="حذف الخطة السنوية"
        message={`هل أنت متأكد من رغبتك في حذف الخطة السنوية لعام ${selectedYear} بالكامل؟ سيتم حذف جميع البنود والبيانات المرتبطة بها.`}
        onConfirm={handleDeleteAnnualPlan}
        onCancel={() => setIsDeletePlanModalOpen(false)}
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
        {isPlanApproved && (
            <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg shadow-sm z-10 flex items-center gap-1">
                <CheckBadgeIcon className="w-4 h-4" />
                خطة معتمدة
            </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarDaysIcon className="w-7 h-7 text-blue-600" />
              خطة مراجعة الجودة السنوية
            </h2>
            <div className="flex items-center gap-3 mt-2">
                 <p className="text-slate-500">
                    {currentPlanMeta 
                        ? currentPlanMeta.title
                        : `لم يتم إعداد خطة لسنة ${selectedYear}`
                    }
                </p>
                <div className="flex items-center gap-1">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-1 outline-none font-bold cursor-pointer"
                    >
                        {Object.keys(annualPlansMeta).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                         {!annualPlansMeta[selectedYear] && <option value={selectedYear}>{selectedYear}</option>}
                    </select>
                </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
              <button
                 onClick={openNewPlanModal}
                 className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
              >
                  <PlusIcon className="w-5 h-5" />
                  خطة سنوية جديدة
              </button>

              <button
                onClick={openEditPlanMetaModal}
                disabled={!currentPlanMeta}
                className={`border border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${currentPlanMeta ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                 <DocumentPlusIcon className="w-5 h-5" />
                 تعديل بيانات الخطة
              </button>

              {currentPlanMeta && (
                  <button
                      onClick={() => setIsDeletePlanModalOpen(true)}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                      <TrashIcon className="w-5 h-5" />
                      حذف
                  </button>
              )}

              <button 
                  disabled={!currentPlanMeta}
                  onClick={openAddModal}
                  className={`border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
                      currentPlanMeta 
                      ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
              >
                  <PlusIcon className="w-5 h-5" />
                  إضافة بند
              </button>

              {!isPlanApproved ? (
                  <button 
                      disabled={!currentPlanMeta}
                      onClick={togglePlanApproval}
                      className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm ${
                          currentPlanMeta 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                  >
                      <CheckBadgeIcon className="w-5 h-5" />
                      اعتماد
                  </button>
              ) : (
                  <button 
                    onClick={togglePlanApproval}
                    className="bg-slate-100 text-slate-500 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <LockClosedIcon className="w-4 h-4" />
                    إلغاء الاعتماد
                  </button>
              )}
          </div>
        </div>
        
        {currentPlanMeta && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <ListBulletIcon className="w-4 h-4 text-slate-500" />
                            وصف الخطة
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {currentPlanMeta.description || "لا يوجد وصف."}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <FlagIcon className="w-4 h-4 text-slate-500" />
                            الأهداف الاستراتيجية
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                            {currentPlanMeta.objectives || "لا توجد أهداف محددة."}
                        </p>
                    </div>
                </div>
            </div>
        )}

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredPlan.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">نوع الهدف</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">الاسم / الموضوع</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">التاريخ المخطط</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">فترة التقييم</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">مجال التدقيق</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">الحالة</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-800 font-semibold flex items-center gap-2">
                        {getTargetIcon(item.targetType)}
                        {getTargetLabel(item.targetType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-bold">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span>{item.targetName}</span>
                                {item.targetType === 'Mission' && item.controlUnitName && (
                                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                        <BuildingOffice2Icon className="w-3 h-3" />
                                        {item.controlUnitName}
                                    </span>
                                )}
                            </div>
                            {item.changeStatus === 'added_post_approval' && (
                                <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 w-fit">
                                    مضاف بعد الاعتماد
                                </span>
                            )}
                            {item.changeStatus === 'modified_post_approval' && (
                                <span className="inline-block mt-1 text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full border border-orange-200 w-fit">
                                    معدل بعد الاعتماد
                                </span>
                            )}
                        </div>
                        {item.justification && (
                            <div className="text-xs text-slate-500 font-normal mt-1 truncate max-w-[200px]" title={item.justification}>
                                {item.justification}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.evaluationPeriod}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.auditType === AuditType.FINANCIAL && 'تدقيق مالي'}
                      {item.auditType === AuditType.PERFORMANCE && 'تدقيق الأداء'}
                      {item.auditType === AuditType.COMPLIANCE && 'تدقيق الالتزام'}
                      {item.auditType === AuditType.PROFESSIONAL_REVIEW && 'الأداء المهني'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        item.status === 'قيد التنفيذ' ? 'bg-blue-100 text-blue-700' :
                        item.status === 'مخطط' ? 'bg-slate-100 text-slate-600' :
                        item.status === 'منجز' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex items-center gap-2">
                        <button 
                            onClick={() => openEditModal(item)}
                            className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="تعديل البند"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        
                        <button 
                            onClick={() => setDeleteId(item.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="حذف البند"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>

                        {onStartQC && (
                            <button 
                            disabled={!isPlanApproved || item.status === 'قيد التنفيذ' || item.status === 'منجز'}
                            onClick={() => initiateStart(item)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                                (isPlanApproved && item.status !== 'قيد التنفيذ' && item.status !== 'منجز')
                                ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 cursor-pointer' 
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                            }`}
                            title={
                                !isPlanApproved ? "يجب اعتماد الخطة أولاً" : 
                                item.status === 'قيد التنفيذ' ? "المهمة قيد التنفيذ حالياً" :
                                item.status === 'منجز' ? "تم إنجاز هذه المهمة" : "بدء التنفيذ"
                            }
                            >
                            <PlayCircleIcon className="w-4 h-4" />
                            بدء
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>لا توجد مهام مدرجة لهذه السنة.</p>
            {!currentPlanMeta && (
                <button onClick={openNewPlanModal} className="text-indigo-600 font-bold hover:underline mt-2">
                    ابدأ بإنشاء الخطة السنوية
                </button>
            )}
          </div>
        )}
      </div>

      {isPlanMetaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-fade-in-up">
              <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                 <h3 className="text-white font-bold text-lg">
                    {isCreatingNewYear ? 'إعداد خطة سنوية جديدة' : `تعديل بيانات الخطة (${selectedYear})`}
                 </h3>
                 <button onClick={() => setIsPlanMetaModalOpen(false)} className="text-white/80 hover:text-white">
                   <XMarkIcon className="w-6 h-6" />
                 </button>
              </div>
              <form onSubmit={handleSavePlanMeta} className="p-6 space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">السنة</label>
                      <input 
                        required
                        type="number" 
                        min="2020"
                        max="2030"
                        readOnly={!isCreatingNewYear}
                        value={planMetaForm.year}
                        onChange={e => setPlanMetaForm({...planMetaForm, year: parseInt(e.target.value)})}
                        className={`w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 ${!isCreatingNewYear ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">عنوان الخطة</label>
                      <input 
                        required
                        type="text" 
                        value={planMetaForm.title}
                        onChange={e => setPlanMetaForm({...planMetaForm, title: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="مثال: الخطة السنوية لضمان الجودة لعام 2026"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">وصف الخطة</label>
                      <textarea 
                        rows={3}
                        value={planMetaForm.description}
                        onChange={e => setPlanMetaForm({...planMetaForm, description: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="وصف مختصر للتوجه العام..."
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">الأهداف الاستراتيجية</label>
                      <textarea 
                        rows={4}
                        value={planMetaForm.objectives}
                        onChange={e => setPlanMetaForm({...planMetaForm, objectives: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="- الهدف الأول..."
                      />
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                     <button type="button" onClick={() => setIsPlanMetaModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">إلغاء</button>
                     <button type="submit" className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold shadow-md">
                        {isCreatingNewYear ? 'إنشاء الخطة' : 'حفظ التعديلات'}
                     </button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {isAssignModalOpen && selectedPlanItemForStart && (
         <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up border border-slate-200">
                <div className="bg-blue-900 px-6 py-5 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-blue-800 opacity-20 transform skew-x-12 translate-x-1/2"></div>
                    <h3 className="text-white font-extrabold text-lg relative z-10 flex items-center gap-2">
                        <PlayCircleIcon className="w-6 h-6" />
                        تخصيص المهمة
                    </h3>
                    <button onClick={() => setIsAssignModalOpen(false)} className="text-white/80 hover:text-white transition-colors relative z-10">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8">
                    <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-inner">
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">المهمة المحددة:</p>
                        <p className="font-extrabold text-slate-800 text-sm leading-relaxed">{selectedPlanItemForStart.targetName}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">تاريخ البدء</label>
                            <input 
                                type="date"
                                value={evalStartDate}
                                onChange={(e) => setEvalStartDate(e.target.value)}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm font-bold text-slate-700 transition-all bg-slate-50/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">تاريخ الانتهاء</label>
                            <input 
                                type="date"
                                value={evalEndDate}
                                onChange={(e) => setEvalEndDate(e.target.value)}
                                className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm font-bold text-slate-700 transition-all bg-slate-50/50"
                            />
                        </div>
                    </div>

                    <div className="mb-8 space-y-1.5">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-blue-600" />
                            تعيين القائم بالمراجعة (المقيم)
                        </label>
                        <select
                            value={selectedReviewerId}
                            onChange={(e) => setSelectedReviewerId(e.target.value)}
                            className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-white text-sm font-bold text-slate-800 transition-all"
                        >
                            <option value="">-- اختر المستخدم من القائمة --</option>
                            {users.filter(u => u.permissions.performReview && u.status === 'active' && !u.isDeleted).map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.role})
                                </option>
                            ))}
                        </select>
                        {users.filter(u => u.permissions.performReview && u.status === 'active' && !u.isDeleted).length === 0 && (
                            <p className="text-[10px] text-red-500 mt-2 font-bold flex items-center gap-1">
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                تنبيه: لا يوجد مراجعين نشطين متاحين حالياً.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-black text-sm transition-colors order-2 sm:order-1">إلغاء</button>
                        <button 
                            disabled={!selectedReviewerId}
                            onClick={confirmStart} 
                            className={`flex-1 px-4 py-3 text-white rounded-xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 order-1 sm:order-2 ${selectedReviewerId ? 'bg-blue-700 hover:bg-blue-800 transform hover:scale-[1.02] active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}
                        >
                            تأكيد
                        </button>
                    </div>
                </div>
            </div>
         </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
               <h3 className="text-white font-bold text-lg">
                   {editingItem ? 'تعديل بند في الخطة' : 'إضافة بند جديد للخطة'}
               </h3>
               <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                 <XMarkIcon className="w-6 h-6" />
               </button>
            </div>
            <form onSubmit={handleSavePlanItem} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
               <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">نوع المراجعة المستهدفة</label>
                   <div className="grid grid-cols-2 gap-2">
                       <button
                         type="button"
                         onClick={() => setNewPlan({...newPlan, targetType: 'Mission'})}
                         className={`p-2 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 ${newPlan.targetType === 'Mission' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                       >
                           <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                           مهمة رقابية
                       </button>
                       <button
                         type="button"
                         onClick={() => setNewPlan({...newPlan, targetType: 'AuditProgram'})}
                         className={`p-2 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 ${newPlan.targetType === 'AuditProgram' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'border-slate-200 text-slate-500'}`}
                       >
                           <DocumentTextIcon className="w-5 h-5" />
                           برنامج رقابي
                       </button>
                       <button
                         type="button"
                         onClick={() => setNewPlan({...newPlan, targetType: 'TeamLeader'})}
                         className={`p-2 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 ${newPlan.targetType === 'TeamLeader' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500'}`}
                       >
                           <UserGroupIcon className="w-5 h-5" />
                           رئيس فريق
                       </button>
                       <button
                         type="button"
                         onClick={() => setNewPlan({...newPlan, targetType: 'TeamMember'})}
                         className={`p-2 rounded-lg border text-sm font-bold flex flex-col items-center gap-1 ${newPlan.targetType === 'TeamMember' ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-200 text-slate-500'}`}
                       >
                           <UserIcon className="w-5 h-5" />
                           عضو فريق
                       </button>
                   </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">
                     {newPlan.targetType === 'Mission' ? 'الجهة / موضوع المهمة' : 
                      newPlan.targetType === 'AuditProgram' ? 'اسم البرنامج الرقابي' :
                      'اسم الموظف'}
                 </label>
                 <input 
                   required
                   type="text" 
                   value={newPlan.targetName}
                   onChange={e => setNewPlan({...newPlan, targetName: e.target.value})}
                   placeholder={newPlan.targetType === 'Mission' ? "مثال: توريد الأدوية..." : newPlan.targetType === 'AuditProgram' ? 'عنوان البرنامج...' : "مثال: محمد أحمد"}
                   className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>

               {newPlan.targetType === 'Mission' && (
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <BuildingOffice2Icon className="w-4 h-4 text-blue-600" />
                        الوحدة الرقابية المختصة
                    </label>
                    <select 
                       value={newPlan.controlUnitName || ''}
                       onChange={e => setNewPlan({...newPlan, controlUnitName: e.target.value})}
                       className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">-- اختر الوحدة من القائمة --</option>
                      {controlUnits.map(unit => (
                        <option key={unit.id} value={unit.name}>{unit.name}</option>
                      ))}
                    </select>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">التاريخ المخطط</label>
                    <input 
                      required
                      type="date" 
                      value={newPlan.date}
                      onChange={e => setNewPlan({...newPlan, date: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">فترة التقييم</label>
                    <input 
                      type="text" 
                      placeholder="مثال: Q1-2024"
                      value={newPlan.evaluationPeriod}
                      onChange={e => setNewPlan({...newPlan, evaluationPeriod: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                 </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">مجال التدقيق المرتبط</label>
                  <select
                    value={newPlan.auditType}
                    onChange={e => setNewPlan({...newPlan, auditType: e.target.value as AuditType})}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value={AuditType.FINANCIAL}>تدقيق مالي</option>
                    <option value={AuditType.PERFORMANCE}>تدقيق الأداء</option>
                    <option value={AuditType.COMPLIANCE}>تدقيق الالتزام</option>
                    <option value={AuditType.PROFESSIONAL_REVIEW}>الأداء المهني</option>
                  </select>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">مبررات الاختيار / ملاحظات</label>
                 <textarea 
                    rows={3}
                    placeholder="اشرح سبب اختيار هذه المهمة/الشخص..."
                    value={newPlan.justification}
                    onChange={e => setNewPlan({...newPlan, justification: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
               </div>

               <div className="pt-4 flex justify-end gap-3">
                 <button 
                   type="button" 
                   onClick={() => setIsModalOpen(false)}
                   className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold"
                 >
                   إلغاء
                 </button>
                 <button 
                   type="submit" 
                   className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md"
                 >
                   {editingItem ? 'حفظ التعديلات' : 'إضافة للخطة'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
