
import React, { useState, useRef, useMemo } from 'react';
import { 
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckBadgeIcon,
  UsersIcon,
  KeyIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  ListBulletIcon,
  ServerStackIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentPlusIcon,
  BriefcaseIcon,
  QueueListIcon,
  MagnifyingGlassIcon,
  ArrowRightEndOnRectangleIcon
} from '@heroicons/react/24/outline';
import { QCConfig, User, PlanMetadata, QCLogItem, PlanItem, FollowUpItem, LoginLog, ActivityLog } from '../types';
// Import shared ConfirmModal
import { ConfirmModal } from './OperationalViews';

// --- Recycle Bin View ---
export interface RecycleBinViewProps {
    deletedPlans: PlanItem[];
    deletedLogs: QCLogItem[];
    deletedUsers: User[];
    deletedFollowUps: FollowUpItem[];
    onRestorePlan: (id: number) => void;
    onPermanentDeletePlan: (id: number) => void;
    onRestoreLog: (id: string) => void;
    onPermanentDeleteLog: (id: string) => void;
    onRestoreUser: (id: number) => void;
    onPermanentDeleteUser: (id: number) => void;
    onRestoreFollowUp: (id: string) => void;
    onPermanentDeleteFollowUp: (id: string) => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
    deletedPlans, deletedLogs, deletedUsers, deletedFollowUps,
    onRestorePlan, onPermanentDeletePlan,
    onRestoreLog, onPermanentDeleteLog,
    onRestoreUser, onPermanentDeleteUser,
    onRestoreFollowUp, onPermanentDeleteFollowUp
}) => {
    const [activeTab, setActiveTab] = useState<'plans' | 'logs' | 'users' | 'followups'>('plans');
    
    // State for Custom Confirm Modals
    const [restoreModal, setRestoreModal] = useState<{ id: any, type: string } | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ id: any, type: string } | null>(null);

    const handleConfirmRestore = () => {
        if (!restoreModal) return;
        const { id, type } = restoreModal;
        if (type === 'plans') onRestorePlan(id);
        else if (type === 'logs') onRestoreLog(id);
        else if (type === 'users') onRestoreUser(id);
        else if (type === 'followups') onRestoreFollowUp(id);
        setRestoreModal(null);
    };

    const handleConfirmPermanentDelete = () => {
        if (!deleteModal) return;
        const { id, type } = deleteModal;
        if (type === 'plans') onPermanentDeletePlan(id);
        else if (type === 'logs') onPermanentDeleteLog(id);
        else if (type === 'users') onPermanentDeleteUser(id);
        else if (type === 'followups') onPermanentDeleteFollowUp(id);
        setDeleteModal(null);
    };

    const renderTable = (
        items: any[], 
        columns: { header: string, accessor: (item: any) => React.ReactNode }[],
        type: string
    ) => {
        if (items.length === 0) {
            return (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <TrashIcon className="w-10 h-10 text-slate-200" />
                    <p>سلة المهملات فارغة لهذا القسم.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-3">{col.header}</th>
                            ))}
                            <th className="px-4 py-3">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                {columns.map((col, idx) => (
                                    <td key={idx} className="px-4 py-3 text-slate-600 font-medium">
                                        {col.accessor(item)}
                                    </td>
                                ))}
                                <td className="px-4 py-3 flex items-center gap-2">
                                    <button 
                                        onClick={() => setRestoreModal({ id: item.id, type })}
                                        className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                        title="استعادة"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                        استعادة
                                    </button>
                                    <button 
                                        onClick={() => setDeleteModal({ id: item.id, type })}
                                        className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                        title="حذف نهائي"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        حذف نهائي
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="animate-fade-in space-y-6 font-sans">
            {/* Confirmation Modals */}
            <ConfirmModal 
                isOpen={!!restoreModal}
                title="تأكيد استعادة العنصر"
                message="هل أنت متأكد من رغبتك في استعادة هذا العنصر من سلة المهملات؟ سيتم نقله إلى القوائم النشطة."
                onConfirm={handleConfirmRestore}
                onCancel={() => setRestoreModal(null)}
            />
            <ConfirmModal 
                isOpen={!!deleteModal}
                title="تأكيد الحذف النهائي"
                message="تحذير: هذا الإجراء سيقوم بحذف العنصر نهائياً من قاعدة البيانات ولا يمكن التراجع عنه. هل أنت متأكد؟"
                onConfirm={handleConfirmPermanentDelete}
                onCancel={() => deleteModal && setDeleteModal(null)}
            />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <TrashIcon className="w-7 h-7 text-red-600" />
                    سلة المهملات
                </h2>
                <p className="text-slate-500 mt-1">إدارة العناصر المحذوفة، استعادتها أو حذفها نهائياً.</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                <button 
                    onClick={() => setActiveTab('plans')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'plans' ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                >
                    <CalendarDaysIcon className="w-4 h-4" />
                    الخطط ({deletedPlans.length})
                </button>
                <button 
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'logs' ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                >
                    <ClipboardDocumentListIcon className="w-4 h-4" />
                    التقارير ({deletedLogs.length})
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                >
                    <UsersIcon className="w-4 h-4" />
                    المستخدمين ({deletedUsers.length})
                </button>
                <button 
                    onClick={() => setActiveTab('followups')}
                    className={`px-4 py-2 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-all ${activeTab === 'followups' ? 'bg-white text-indigo-700 border border-slate-200 border-b-white translate-y-[1px]' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                >
                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    المتابعات ({deletedFollowUps.length})
                </button>
            </div>

            <div className="bg-white rounded-xl rounded-tl-none shadow-sm border border-slate-200 overflow-hidden p-1">
                {activeTab === 'plans' && renderTable(
                    deletedPlans,
                    [
                        { header: 'الهدف', accessor: (item) => item.targetName },
                        { header: 'السنة', accessor: (item) => item.year },
                        { header: 'النوع', accessor: (item) => item.targetType }
                    ],
                    'plans'
                )}
                
                {activeTab === 'logs' && renderTable(
                    deletedLogs,
                    [
                        { header: 'رقم التقرير', accessor: (item) => item.reportNumber },
                        { header: 'المهمة', accessor: (item) => item.missionName },
                        { header: 'سبب الحذف', accessor: (item) => <span className="text-red-600 font-bold" title={item.deletionReason}>{item.deletionReason || '-'}</span> },
                        { header: 'الحالة', accessor: (item) => item.status }
                    ],
                    'logs'
                )}

                {activeTab === 'users' && renderTable(
                    deletedUsers,
                    [
                        { header: 'الاسم', accessor: (item) => item.name },
                        { header: 'الدور', accessor: (item) => item.role },
                        { header: 'اسم المستخدم', accessor: (item) => item.username }
                    ],
                    'users'
                )}

                {activeTab === 'followups' && renderTable(
                    deletedFollowUps,
                    [
                        { header: 'رقم التقرير', accessor: (item) => item.reportNumber },
                        { header: 'الملاحظة', accessor: (item) => <span className="truncate max-w-[200px] block" title={item.findingText}>{item.findingText}</span> },
                        { header: 'النوع', accessor: (item) => item.findingType === 'NON_CONFORMANCE' ? 'عدم مطابقة' : 'فرصة تحسين' }
                    ],
                    'followups'
                )}
            </div>
        </div>
    );
};

// --- UserManagementView ---
export interface UserManagementViewProps {
  users: User[];
  setUsers: (users: User[]) => void;
  roles: string[]; // Added prop
  logActivity?: (action: string, target: string, details?: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ users, setUsers, roles, logActivity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({
        name: '', username: '', password: '', email: '', role: 'عضو ضمان جودة', status: 'active',
        permissions: { createPlan: false, approvePlan: false, startPlan: true, performReview: true, respondToFindings: false, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
    });

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({ ...user });
        } else {
            setEditingUser(null);
            setFormData({
                name: '', username: '', password: '', email: '', role: 'عضو ضمان جودة', status: 'active',
                permissions: { createPlan: false, approvePlan: false, startPlan: true, performReview: true, respondToFindings: false, reviewAndEscalate: false, sendToFollowUp: false, editReport: false, approveReport: false }
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
            if(logActivity) logActivity('تعديل مستخدم', formData.name || 'مخدم', 'تحديث البيانات');
        } else {
            const newUser = { ...formData, id: Date.now() } as User;
            setUsers([...users, newUser]);
            if(logActivity) logActivity('إنشاء مستخدم', newUser.name, `الدور: ${newUser.role}`);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: number) => {
        const user = users.find(u => u.id === id);
        setUsers(users.map(u => u.id === id ? { ...u, isDeleted: true } : u));
        if(logActivity) logActivity('حذف مستخدم', user?.name || id.toString(), 'نقل إلى سلة المهملات');
    };

    const getRoleBadgeClass = (role: string) => {
        switch(role) {
            case 'مدير النظام': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'مدير عام المديرية العامة للتخطيط والتطوير': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'رئيس قسم ضمان الجودة': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'وحدة رقابية': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-teal-50 text-teal-700 border-teal-200';
        }
    };

    return (
        <div className="animate-fade-in space-y-6 font-sans">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <UsersIcon className="w-7 h-7 text-indigo-600" />
                        إدارة المستخدمين والصلاحيات
                    </h2>
                    <p className="text-slate-500 mt-1">عرض وإدارة حسابات الوصول للنظام وتخصيص الصلاحيات</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                    <PlusIcon className="w-5 h-5" />
                    مستخدم جديد
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {users.map(user => (
                    <div key={user.id} className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
                        <div className={`absolute top-0 right-0 bottom-0 w-1 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-300'}`}></div>
                        
                        <div className="p-4 pr-5 flex flex-col gap-3 h-full justify-between">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-slate-50 p-1.5 rounded-full border border-slate-100 group-hover:bg-indigo-50 transition-colors shrink-0">
                                        <UserCircleIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold text-slate-800 break-words leading-tight" title={user.name}>{user.name}</h3>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <IdentificationIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                            <span className="text-[10px] text-slate-500 font-mono truncate">{user.username}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button 
                                        onClick={() => handleOpenModal(user)} 
                                        className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                                        title="تعديل"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => { if(confirm('حذف المستخدم؟')) handleDelete(user.id) }} 
                                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                        title="حذف"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-bold whitespace-normal text-center ${getRoleBadgeClass(user.role)}`}>
                                    {user.role}
                                </span>
                                <div className="flex gap-1">
                                    {user.permissions.performReview && <div className="w-5 h-5 bg-blue-50 text-blue-500 rounded flex items-center justify-center border border-blue-100" title="صلاحية التقييم"><CheckBadgeIcon className="w-3 h-3" /></div>}
                                    {user.permissions.approvePlan && <div className="w-5 h-5 bg-indigo-50 text-indigo-500 rounded flex items-center justify-center border border-indigo-100" title="صلاحية الاعتماد"><KeyIcon className="w-3 h-3" /></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => handleOpenModal()}
                    className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all min-h-[140px]"
                >
                    <div className="p-3 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xs">إضافة مستخدم</span>
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden animate-fade-in-up">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-white font-bold text-lg">{editingUser ? 'تعديل بيانات مستخدم' : 'إنشاء مستخدم جديد'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل للمستخدم</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="الاسم الثلاثي..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">اسم المستخدم (Login)</label>
                                    <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="username" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">كلمة المرور</label>
                                    <input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder={editingUser ? 'تعديل كلمة المرور...' : 'أدخل كلمة المرور'} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني المهني</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" placeholder="example@system.gov" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">الدور الوظيفي</label>
                                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-slate-700">
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">حالة الحساب</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})} className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-slate-700">
                                        <option value="active" className="text-green-600">نشط</option>
                                        <option value="inactive" className="text-red-600">غير نشط</option>
                                    </select>
                                </div>
                            </div>
                             <div className="pt-2 border-t border-slate-100">
                                <label className="block text-sm font-bold text-slate-700 mb-3">الصلاحيات والوصول</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'createPlan', label: 'إنشاء الخطة' },
                                        { id: 'approvePlan', label: 'اعتماد الخطة' },
                                        { id: 'startPlan', label: 'بدء المهام' },
                                        { id: 'performReview', label: 'إجراء التقييم' },
                                        { id: 'respondToFindings', label: 'الرد على الملاحظات' },
                                        { id: 'reviewAndEscalate', label: 'المراجعة والرفع للمستوى الأعلى' },
                                        { id: 'sendToFollowUp', label: 'ارسال إلى سجل المتابعة' },
                                        { id: 'editReport', label: 'تعديل التقرير' },
                                        { id: 'approveReport', label: 'اعتماد التقرير' }
                                    ].map(perm => (
                                        <label key={perm.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group">
                                            <input 
                                                type="checkbox" 
                                                checked={(formData.permissions as any)?.[perm.id]} 
                                                onChange={e => setFormData({...formData, permissions: {...formData.permissions!, [perm.id]: e.target.checked}})} 
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            /> 
                                            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition-colors">إلغاء</button>
                                <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all">حفظ البيانات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Settings View ---
export interface SettingsViewProps {
  missionConfig: QCConfig;
  setMissionConfig: (config: QCConfig) => void;
  leaderConfig: QCConfig;
  setLeaderConfig: (config: QCConfig) => void;
  memberConfig: QCConfig;
  setMemberConfig: (config: QCConfig) => void;
  programConfig: QCConfig; // New Prop
  setProgramConfig: (config: QCConfig) => void; // New Prop
  plans: PlanItem[];
  setPlans: (plans: PlanItem[]) => void;
  qcLogs: QCLogItem[];
  setQcLogs: (logs: QCLogItem[]) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  annualPlansMeta: Record<number, PlanMetadata>;
  setAnnualPlansMeta: (meta: Record<number, PlanMetadata>) => void;
  roles: string[];
  setRoles: (roles: string[]) => void;
  loginLogs?: LoginLog[]; // Optional legacy logs
  activityLogs: ActivityLog[]; // New Unified Logs
  logActivity?: (action: string, target: string, details?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  missionConfig, setMissionConfig,
  leaderConfig, setLeaderConfig,
  memberConfig, setMemberConfig,
  programConfig, setProgramConfig,
  plans, setPlans,
  qcLogs, setQcLogs,
  users, setUsers,
  annualPlansMeta, setAnnualPlansMeta,
  roles, setRoles,
  activityLogs,
  logActivity
}) => {
    // Separate state for Main Tab (Criteria vs Roles vs Data vs Logs)
    const [mainTab, setMainTab] = useState<'criteria' | 'roles' | 'data' | 'logs'>('criteria');
    const [criteriaTab, setCriteriaTab] = useState<'mission' | 'leader' | 'member' | 'program'>('mission');
    const [newRoleInput, setNewRoleInput] = useState('');
    const [logSearchQuery, setLogSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Role Management Handlers ---
    const handleAddRole = () => {
        if(newRoleInput.trim() && !roles.includes(newRoleInput.trim())) {
            setRoles([...roles, newRoleInput.trim()]);
            if(logActivity) logActivity('إضافة دور وظيفي', newRoleInput.trim());
            setNewRoleInput('');
        }
    };

    const handleDeleteRole = (roleToDelete: string) => {
        if(confirm(`هل أنت متأكد من حذف الدور "${roleToDelete}"؟`)) {
            setRoles(roles.filter(r => r !== roleToDelete));
            if(logActivity) logActivity('حذف دور وظيفي', roleToDelete);
        }
    };

    // --- System Logs Logic ---
    const filteredLogs = useMemo(() => {
        return activityLogs.filter(log => 
            log.userName.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
            log.target.toLowerCase().includes(logSearchQuery.toLowerCase())
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [activityLogs, logSearchQuery]);


    // --- Interactive Config Editor ---
    const renderConfigEditor = (config: QCConfig, setConfig: (c: QCConfig) => void) => {
        const handleStageNameChange = (idx: number, newName: string) => {
            const newConfig = [...config];
            newConfig[idx].name = newName;
            setConfig(newConfig);
        };

        const handleAddStage = () => {
            setConfig([...config, { name: 'عنوان مرحلة جديدة', criteria: ['معيار جديد'] }]);
        };

        const handleDeleteStage = (idx: number) => {
            if(confirm('هل أنت متأكد من حذف هذه المرحلة وكافة معاييرها؟')) {
                const newConfig = config.filter((_, i) => i !== idx);
                setConfig(newConfig);
            }
        };

        const handleCriterionChange = (stageIdx: number, criterionIdx: number, newText: string) => {
            const newConfig = [...config];
            newConfig[stageIdx].criteria[criterionIdx] = newText;
            setConfig(newConfig);
        };

        const handleAddCriterion = (stageIdx: number) => {
            const newConfig = [...config];
            newConfig[stageIdx].criteria.push('معيار تقييم جديد');
            setConfig(newConfig);
        };

        const handleDeleteCriterion = (stageIdx: number, criterionIdx: number) => {
            const newConfig = [...config];
            newConfig[stageIdx].criteria = newConfig[stageIdx].criteria.filter((_, i) => i !== criterionIdx);
            setConfig(newConfig);
        };

        return (
            <div className="space-y-8 animate-fade-in">
                {config.map((stage, sIdx) => (
                    <div key={sIdx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                            <span className="bg-indigo-100 text-indigo-700 font-bold w-8 h-8 flex items-center justify-center rounded-full text-sm">
                                {sIdx + 1}
                            </span>
                            <input 
                                type="text" 
                                value={stage.name}
                                onChange={(e) => handleStageNameChange(sIdx, e.target.value)}
                                className="flex-1 font-bold text-slate-800 text-lg border-b border-transparent focus:border-indigo-500 focus:outline-none bg-transparent"
                                placeholder="اسم المرحلة / المحور"
                            />
                            <button 
                                onClick={() => handleDeleteStage(sIdx)}
                                className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                                title="حذف المرحلة"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 pl-4 border-r-2 border-indigo-50">
                            {stage.criteria.map((criterion, cIdx) => (
                                <div key={cIdx} className="flex items-start gap-2 group/item">
                                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0"></div>
                                    <textarea 
                                        value={criterion}
                                        /* Fix: Use sIdx instead of undefined stageIdx */
                                        onChange={(e) => handleCriterionChange(sIdx, cIdx, e.target.value)}
                                        className="flex-1 text-sm text-slate-700 border border-transparent focus:border-indigo-200 focus:bg-indigo-50/30 rounded p-1.5 focus:outline-none resize-none overflow-hidden h-auto"
                                        rows={1}
                                        style={{ minHeight: '36px', height: 'auto' }}
                                        onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                                    />
                                    <button 
                                        /* Fix: Use sIdx instead of undefined stageIdx */
                                        onClick={() => handleDeleteCriterion(sIdx, cIdx)}
                                        className="text-slate-200 hover:text-red-400 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                        title="حذف المعيار"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => handleAddCriterion(sIdx)}
                                className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 px-2 py-1 rounded hover:bg-indigo-50 w-fit transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                                إضافة معيار فرعي
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={handleAddStage}
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all font-bold flex items-center justify-center gap-2"
                >
                    <DocumentPlusIcon className="w-6 h-6" />
                    إضافة مرحلة / محور جديد
                </button>
            </div>
        );
    };

    // --- Data Management Handlers ---
    const handleResetSystem = () => {
        if(confirm("تحذير: هذا الإجراء سيقوم بمسح جميع البيانات (الخطط، التقارير، المستخدمين) وإعادتها للوضع الافتراضي. هل أنت متأكد؟")) {
             if(logActivity) logActivity('إعادة ضبط النظام', 'النظام', 'مسح كافة البيانات');
             localStorage.clear();
             window.location.reload();
        }
    };

    const handleExportSystem = () => {
        const fullData = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            users,
            plans,
            qcLogs,
            annualPlansMeta,
            missionConfig,
            leaderConfig,
            memberConfig,
            programConfig,
            roles,
            activityLogs
        };
        
        const dataStr = JSON.stringify(fullData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `qc_system_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        if(logActivity) logActivity('تصدير بيانات', 'النظام', 'نسخة احتياطية كاملة');
    };

    const handleImportSystem = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                
                if (!importedData.users || !importedData.qcLogs) {
                    alert("خطأ: الملف المحدد لا يبدو كنسخة احتياطية صحيحة للنظام.");
                    return;
                }

                if (confirm(`تم قراءة الملف بنجاح (تاريخ التصدير: ${importedData.exportDate}).\nهل تريد استبدال البيانات الحالية بالبيانات المستوردة؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                    if(importedData.users) setUsers(importedData.users);
                    if(importedData.plans) setPlans(importedData.plans);
                    if(importedData.qcLogs) setQcLogs(importedData.qcLogs);
                    if(importedData.annualPlansMeta) setAnnualPlansMeta(importedData.annualPlansMeta);
                    if(importedData.missionConfig) setMissionConfig(importedData.missionConfig);
                    if(importedData.leaderConfig) setLeaderConfig(importedData.leaderConfig);
                    if(importedData.memberConfig) setMemberConfig(importedData.memberConfig);
                    if(importedData.programConfig) setProgramConfig(importedData.programConfig);
                    if(importedData.roles) setRoles(importedData.roles);
                    // Do not overwrite activityLogs, maybe append? or overwrite if complete restore.
                    // For now, let's keep current logs + import log
                    
                    if(logActivity) logActivity('استيراد بيانات', 'النظام', `استعادة من ${importedData.exportDate}`);
                    alert("تم استعادة البيانات بنجاح.");
                }
            } catch (error) {
                console.error(error);
                alert("حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف JSON صالح.");
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    // Helper for formatting date
    const formatDate = (dateStr: string) => {
        // Try to parse ISO string first for login logs
        if (dateStr.includes('T')) {
            return new Date(dateStr).toLocaleString('en-GB');
        }
        return dateStr; // Return as is for YYYY-MM-DD
    };

    return (
        <div className="animate-fade-in space-y-6 font-sans">
             {/* Combined Header and Main Tabs */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Cog6ToothIcon className="w-7 h-7 text-slate-600" />
                        إعدادات النظام
                    </h2>
                    <p className="text-slate-500 mt-1 text-sm">تخصيص معايير التقييم وإدارة بيانات النظام والأدوار الوظيفية.</p>
                </div>

                <div className="flex flex-wrap lg:flex-nowrap gap-2">
                    <button 
                        onClick={() => setMainTab('criteria')}
                        className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 transition-all shadow-sm text-xs ${
                            mainTab === 'criteria' 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <ListBulletIcon className="w-4 h-4 shrink-0" />
                        <span>معايير التقييم</span>
                    </button>
                    <button 
                        onClick={() => setMainTab('roles')}
                        className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 transition-all shadow-sm text-xs ${
                            mainTab === 'roles' 
                            ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <BriefcaseIcon className="w-4 h-4 shrink-0" />
                        <span>الأدوار الوظيفية</span>
                    </button>
                    <button 
                        onClick={() => setMainTab('data')}
                        className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 transition-all shadow-sm text-xs ${
                            mainTab === 'data' 
                            ? 'border-red-600 bg-red-50 text-red-700 font-bold' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <ServerStackIcon className="w-4 h-4 shrink-0" />
                        <span>إدارة البيانات</span>
                    </button>
                    <button 
                        onClick={() => setMainTab('logs')}
                        className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 transition-all shadow-sm text-xs ${
                            mainTab === 'logs' 
                            ? 'border-slate-600 bg-slate-100 text-slate-800 font-bold' 
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <QueueListIcon className="w-4 h-4 shrink-0" />
                        <span>سجلات النظام</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {mainTab === 'criteria' && (
                    <div className="animate-fade-in">
                        <div className="flex border-b border-slate-200 bg-slate-50/50">
                             <button 
                                onClick={() => setCriteriaTab('mission')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${criteriaTab === 'mission' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
                             >
                                معايير المهام الرقابية
                             </button>
                             <button 
                                onClick={() => setCriteriaTab('program')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${criteriaTab === 'program' ? 'border-cyan-600 text-cyan-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
                             >
                                معايير البرامج
                             </button>
                             <button 
                                onClick={() => setCriteriaTab('leader')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${criteriaTab === 'leader' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
                             >
                                معايير رئيس الفريق
                             </button>
                             <button 
                                onClick={() => setCriteriaTab('member')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${criteriaTab === 'member' ? 'border-teal-600 text-teal-600 bg-white' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
                             >
                                معايير عضو ضمان جودة
                             </button>
                        </div>
                        <div className="p-6 bg-slate-50/30">
                            {criteriaTab === 'mission' && renderConfigEditor(missionConfig, setMissionConfig)}
                            {criteriaTab === 'program' && renderConfigEditor(programConfig, setProgramConfig)}
                            {criteriaTab === 'leader' && renderConfigEditor(leaderConfig, setLeaderConfig)}
                            {criteriaTab === 'member' && renderConfigEditor(memberConfig, setMemberConfig)}
                        </div>
                    </div>
                )}

                {mainTab === 'roles' && (
                    <div className="p-8 animate-fade-in">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="flex gap-3 mb-6">
                                <input 
                                    type="text" 
                                    value={newRoleInput}
                                    onChange={(e) => setNewRoleInput(e.target.value)}
                                    placeholder="أدخل اسم الدور الوظيفي الجديد..."
                                    className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button 
                                    onClick={handleAddRole}
                                    className="bg-purple-600 text-white px-6 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    إضافة
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                <ul className="divide-y divide-slate-100">
                                    {roles.map((role, idx) => (
                                        <li key={idx} className="p-4 flex items-center justify-between hover:bg-white transition-colors group">
                                            <span className="font-bold text-slate-700">{role}</span>
                                            <button 
                                                onClick={() => handleDeleteRole(role)}
                                                className="text-slate-300 hover:text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                title="حذف الدور"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {roles.length === 0 && (
                                    <div className="p-8 text-center text-slate-400">لا توجد أدوار وظيفية معرفة.</div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                ملاحظة: حذف دور وظيفي لا يؤثر على المستخدمين الذين تم تعيينهم لهذا الدور مسبقاً، ولكن لن يظهر في قائمة الاختيار للمستخدمين الجدد.
                            </p>
                        </div>
                    </div>
                )}

                {mainTab === 'data' && (
                    <div className="p-8 animate-fade-in">
                        <div className="max-w-3xl mx-auto space-y-8">
                            
                            {/* Backup & Restore Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border border-indigo-100 rounded-xl p-6 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><ArrowDownTrayIcon className="w-6 h-6" /></div>
                                        <h4 className="font-bold text-indigo-900 text-lg">تصدير نسخة احتياطية</h4>
                                    </div>
                                    <p className="text-sm text-indigo-700/80 mb-6 min-h-[40px]">
                                        حفظ نسخة كاملة من بيانات النظام (المستخدمين، الخطط، التقارير والمرفقات) في ملف JSON.
                                    </p>
                                    <button 
                                        onClick={handleExportSystem}
                                        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                        تصدير البيانات
                                    </button>
                                </div>

                                <div className="border border-green-100 rounded-xl p-6 bg-green-50/50 hover:bg-green-50 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 rounded-lg text-green-600"><ArrowUpTrayIcon className="w-6 h-6" /></div>
                                        <h4 className="font-bold text-green-900 text-lg">استعادة نسخة سابقة</h4>
                                    </div>
                                    <p className="text-sm text-green-700/80 mb-6 min-h-[40px]">
                                        استرجاع البيانات من ملف احتياطي. سيتم استبدال البيانات الحالية بالبيانات الموجودة في الملف.
                                    </p>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleImportSystem}
                                        accept=".json"
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2"
                                    >
                                        <ArrowUpTrayIcon className="w-5 h-5" />
                                        استيراد ملف
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 my-4"></div>

                            {/* Danger Zone */}
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center gap-2 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-xs">
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                    منطقة الخطر
                                </div>
                            </div>

                            <div className="border border-red-200 rounded-xl p-6 bg-red-50 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-red-800 text-lg">إعادة ضبط المصنع (Reset)</h4>
                                    <p className="text-sm text-red-600 mt-1">سيتم مسح جميع المستخدمين، الخطط، والتقارير وإعادة النظام لحالته الأولية تماماً.</p>
                                </div>
                                <button 
                                    onClick={handleResetSystem}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 shadow-md flex items-center gap-2 shrink-0 w-full md:w-auto justify-center"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    تنفيذ المسح الكامل
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {mainTab === 'logs' && (
                    <div className="p-8 animate-fade-in">
                        <div className="max-w-5xl mx-auto space-y-6">
                            <div className="flex items-center gap-3 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={logSearchQuery}
                                    onChange={(e) => setLogSearchQuery(e.target.value)}
                                    placeholder="بحث في السجلات (اسم المستخدم، الحدث، المهمة)..."
                                    className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-700 placeholder-slate-400"
                                />
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                                        <tr>
                                            <th className="px-6 py-4">المستخدم</th>
                                            <th className="px-6 py-4">الحدث / الإجراء</th>
                                            <th className="px-6 py-4">الهدف / المهمة</th>
                                            <th className="px-6 py-4">التفاصيل</th>
                                            <th className="px-6 py-4">التاريخ والوقت</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <UserCircleIcon className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div>{log.userName}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">{log.userRole}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${
                                                        log.action.includes('حذف') ? 'bg-red-100 text-red-700' :
                                                        log.action.includes('إنشاء') || log.action.includes('إضافة') ? 'bg-green-100 text-green-700' :
                                                        log.action.includes('دخول') ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {log.action.includes('دخول') && <ArrowRightEndOnRectangleIcon className="w-3 h-3" />}
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-medium">{log.target}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">{log.details || '-'}</td>
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs" dir="ltr">{formatDate(log.timestamp)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    لا توجد سجلات مطابقة للبحث أو لا يوجد نشاط مسجل.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
