import React, { useState, useEffect, useMemo } from 'react';
import { AuditAnalysisResult, ComplianceStatus, ApprovalAction, User, FollowUpItem, UnitResponse, ResponseInteraction, AuditStageEvaluation } from '../types';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon,
  LightBulbIcon,
  ChartBarIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PencilSquareIcon,
  ScaleIcon,
  UserGroupIcon,
  PaperClipIcon,
  CheckBadgeIcon,
  MegaphoneIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  NoSymbolIcon,
  ClockIcon,
  FunnelIcon,
  ListBulletIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  HeadingLevel, 
  AlignmentType,
  UnderlineType 
} from 'docx';
import { ConfirmModal } from './OperationalViews';

interface ResultsViewProps {
  result: AuditAnalysisResult;
  reportTitle?: string;
  onReset: () => void;
  // Workflow props
  currentUser?: User;
  status?: string;
  onApprove?: () => void;
  onReturn?: (note: string) => void;
  onEdit?: () => void;
  approvalHistory?: ApprovalAction[];
  onSaveEntityResponse?: (data: AuditAnalysisResult) => void; 
  onSendFindings?: () => void; 
  followUpItems?: FollowUpItem[];
  // New prop for reviewing unit responses
  onReviewUnitResponse?: (stageIndex: number, criterionIndex: number, unitName: string, action: 'approve' | 'return', note?: string) => void;
  // New prop to force filtered view
  initiallyShowFindingsOnly?: boolean;
}

const StatusBadge: React.FC<{ status: ComplianceStatus }> = ({ status }) => {
  switch (status) {
    case ComplianceStatus.COMPLIANT:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          <CheckCircleIcon className="w-4 h-4" />
          مستوفى
        </span>
      );
    case ComplianceStatus.IMPROVEMENT_OPPORTUNITY:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
          <LightBulbIcon className="w-4 h-4" />
          فرصة تحسين
        </span>
      );
    case ComplianceStatus.NON_CONFORMANCE:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <XCircleIcon className="w-4 h-4" />
          عدم مطابقة
        </span>
      );
    default:
      return null;
  }
};

export const ResultsView: React.FC<ResultsViewProps> = ({ 
    result, 
    reportTitle = "تقرير مراجعة الجودة", 
    onReset,
    currentUser,
    status,
    onApprove,
    onReturn,
    onEdit,
    approvalHistory = [],
    onSaveEntityResponse,
    onSendFindings,
    followUpItems = [],
    onReviewUnitResponse,
    initiallyShowFindingsOnly = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [editableResult, setEditableResult] = useState<AuditAnalysisResult>(result);
  
  // Workflow States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNote, setReturnNote] = useState('');
  const [showSendFindingsConfirm, setShowSendFindingsConfirm] = useState(false);

  // Unit Response Review Modal State
  const [responseReviewModal, setResponseReviewModal] = useState<{
      isOpen: boolean;
      stageIndex: number;
      criterionIndex: number;
      unitName: string;
  } | null>(null);
  const [responseReturnNote, setResponseReturnNote] = useState('');

  // Determine if viewer is Entity (Control Unit)
  const isEntityUser = currentUser?.role === 'وحدة رقابية';
  
  // Filter Findings Only State - Default to true if user is entity or forced by prop
  const [showOnlyFindings, setShowOnlyFindings] = useState(initiallyShowFindingsOnly || isEntityUser);

  // Sync state if prop changes
  useEffect(() => {
    if (initiallyShowFindingsOnly) {
      setShowOnlyFindings(true);
    }
  }, [initiallyShowFindingsOnly]);

  // Determine if viewer has edit permissions for QA reports
  const canUserEdit = !isEntityUser && currentUser?.permissions.editReport && status !== 'completed';

  // State to toggle history view
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // Delete File Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
      stageIndex: number;
      criterionIndex: number;
      unitName?: string; 
  } | null>(null);

  // Sync state if result prop changes
  useEffect(() => {
    setEditableResult(result);
  }, [result]);

  const canApprove = () => {
      if (!currentUser || !status) return false;
      // If user has direct approve permission, they can approve if report is in pending state
      if (currentUser.permissions.approveReport && (status === 'pending_head' || status === 'returned_to_head' || status === 'pending_director')) return true;
      // Legacy role-based check just in case, but preferred is direct permission
      if (currentUser.role.includes('رئيس قسم') && (status === 'pending_head' || status === 'returned_to_head')) return true;
      return false;
  };

  const isLockedForUnit = (unitName: string, response?: UnitResponse): boolean => {
      if (!isEntityUser) return true; 
      if (currentUser?.name !== unitName) return true; 
      
      if (!response || !response.status || response.status === 'pending') return false;
      if (response.status === 'returned') return false; 
      
      return true;
  };

  const handleUnitUpdate = (stageIndex: number, criterionIndex: number, unitName: string, field: keyof UnitResponse, value: string) => {
      const newStages = [...editableResult.stages];
      const criterion = newStages[stageIndex].criteriaResults[criterionIndex];
      
      if (!criterion.unitResponses) criterion.unitResponses = [];
      
      const existingResponseIndex = criterion.unitResponses.findIndex(r => r.unitName === unitName);
      let response = existingResponseIndex > -1 ? criterion.unitResponses[existingResponseIndex] : null;

      if (isLockedForUnit(unitName, response)) return;
      
      if (existingResponseIndex > -1) {
          criterion.unitResponses[existingResponseIndex] = {
              ...criterion.unitResponses[existingResponseIndex],
              [field]: value
          };
      } else {
          const newResponse: UnitResponse = {
              unitName: unitName,
              action: '',
              date: new Date().toISOString().split('T')[0],
              status: 'pending',
              history: []
          };
          // @ts-ignore
          newResponse[field] = value;
          criterion.unitResponses.push(newResponse);
      }
      
      setEditableResult({ ...editableResult, stages: newStages });
  };

  const handleUnitFileUpload = (stageIndex: number, criterionIndex: number, unitName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUnitUpdate(stageIndex, criterionIndex, unitName, 'evidence', base64String);
        handleUnitUpdate(stageIndex, criterionIndex, unitName, 'evidenceName', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDeleteFile = () => {
      if (deleteConfirmation) {
          const { stageIndex, criterionIndex, unitName } = deleteConfirmation;
          
          if (unitName) {
             const criterion = editableResult.stages[stageIndex].criteriaResults[criterionIndex];
             const response = criterion.unitResponses?.find(r => r.unitName === unitName);
             if (!isLockedForUnit(unitName, response)) {
                handleUnitUpdate(stageIndex, criterionIndex, unitName, 'evidence', '');
                handleUnitUpdate(stageIndex, criterionIndex, unitName, 'evidenceName', '');
             }
          } 
          
          setDeleteConfirmation(null);
      }
  };

  const handleRemoveFile = (stageIndex: number, criterionIndex: number, unitName?: string) => {
      setDeleteConfirmation({ stageIndex, criterionIndex, unitName });
  };

  const handleReviewResponse = (action: 'approve' | 'return') => {
      if (!responseReviewModal || !onReviewUnitResponse) return;
      const { stageIndex, criterionIndex, unitName } = responseReviewModal;
      onReviewUnitResponse(stageIndex, criterionIndex, unitName, action, action === 'return' ? responseReturnNote : undefined);
      setResponseReviewModal(null);
      setResponseReturnNote('');
  };

  const getResponsibleUnits = (unitString?: string): string[] => {
      if (!unitString) {
          return result.controlUnitName ? [result.controlUnitName] : [];
      }
      return unitString.split(',').map(u => u.trim()).filter(u => u.length > 0);
  };

  const getUnitResponse = (criterion: any, unitName: string) => {
      return criterion.unitResponses?.find((r: UnitResponse) => r.unitName === unitName);
  };

  const isFindingInFollowUp = (criterionText: string): boolean => {
    return followUpItems.some(item => item.findingText === criterionText);
  };

  // --- Filtering Logic ---
  const filteredStages = useMemo(() => {
    if (!showOnlyFindings) return editableResult.stages;

    return editableResult.stages.map(stage => {
      const filteredCriteria = stage.criteriaResults.filter(c => 
        c.status === ComplianceStatus.NON_CONFORMANCE || 
        c.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY
      );

      if (filteredCriteria.length === 0) return null;

      return {
        ...stage,
        criteriaResults: filteredCriteria
      };
    }).filter(stage => stage !== null) as any[];
  }, [editableResult.stages, showOnlyFindings]);

  // --- Summary Counts ---
  let ncCount = 0;
  let ioCount = 0;
  editableResult.stages.forEach(stage => {
    stage.criteriaResults.forEach(c => {
      if (c.status === ComplianceStatus.NON_CONFORMANCE) ncCount++;
      else if (c.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY) ioCount++;
    });
  });

  const penaltyScore = (ncCount * 2) + (ioCount * 1);

  let classification = { title: '', color: '', bg: '', border: '', description: '', hexColor: '' };
  if (penaltyScore <= 2) {
    classification = { title: 'عناية مهنية استثنائية', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'مهمة مثالية.', hexColor: '047857' };
  } else if (penaltyScore <= 6) {
    classification = { title: 'عناية مهنية فاعلة', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', description: 'قصور بسيط جداً.', hexColor: '1D4ED8' };
  } else if (penaltyScore <= 12) {
    classification = { title: 'عناية مهنية اعتيادية', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', description: 'جودة مقبولة.', hexColor: 'A16207' };
  } else if (penaltyScore <= 22) {
    classification = { title: 'عناية مهنية متوسطة', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', description: 'جودة تتطلب تحسيناً.', hexColor: 'C2410C' };
  } else {
    classification = { title: 'عناية مهنية دون المستوى', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', description: 'فشل جوهري.', hexColor: 'B91C1C' };
  }

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: reportTitle,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        bidirectional: true,
                    }),
                    new Paragraph({ text: `الهدف: ${editableResult.targetName}`, alignment: AlignmentType.CENTER, bidirectional: true }),
                    new Paragraph({ text: `التصنيف: ${classification.title}`, alignment: AlignmentType.CENTER, bidirectional: true }),
                    new Paragraph({ text: "\n", bidirectional: true }),
                    new Paragraph({ text: editableResult.overallSummary || "", bidirectional: true }),
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Report_${editableResult.targetName}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export Failed", error);
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20 font-sans text-right" dir="rtl">
      
      {/* Confirm Delete Modal */}
      {deleteConfirmation && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl max-sm w-full p-6 text-center animate-fade-in-up">
                  <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-800 mb-2">حذف الملف المرفق</h3>
                  <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من رغبتك في حذف هذا الملف؟</p>
                  <div className="flex gap-3 justify-center">
                      <button onClick={() => setDeleteConfirmation(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200">إلغاء</button>
                      <button onClick={confirmDeleteFile} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">حذف</button>
                  </div>
              </div>
          </div>
      )}

      {/* Confirmation Modal for Sending Findings */}
      <ConfirmModal 
        isOpen={showSendFindingsConfirm}
        title="تأكيد إرسال الملاحظات"
        message="هل أنت متأكد من رغبتك في إرسال جميع حالات عدم المطابقة وفرص التحسين المكتشفة فقط إلى سجل المتابعة؟ سيتم إخفاء بقية عناصر التقييم المستوفاة تلقائياً."
        onConfirm={() => {
          if(onSendFindings) onSendFindings();
          setShowSendFindingsConfirm(false);
          setShowOnlyFindings(true);
        }}
        onCancel={() => setShowSendFindingsConfirm(false)}
      />

      {/* Response Return Modal (For QA Reviewer) */}
      {responseReviewModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm text-right" dir="rtl">
              <div className="bg-white rounded-xl shadow-2xl max-md w-full p-6 animate-fade-in-up">
                  <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                      <ArrowUturnLeftIcon className="w-5 h-5" />
                      إعادة الرد للجهة ({responseReviewModal.unitName})
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 font-bold">يرجى ذكر سبب إعادة الرد لطلب تعديلات أو إيضاحات:</p>
                  <textarea 
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4 bg-slate-50 font-bold"
                      rows={4}
                      value={responseReturnNote}
                      onChange={(e) => setResponseReturnNote(e.target.value)}
                      placeholder="اكتب ملاحظاتك للجهة..."
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setResponseReviewModal(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">إلغاء</button>
                      <button 
                          onClick={() => handleReviewResponse('return')}
                          disabled={!responseReturnNote.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                          تأكيد الإعادة
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Workflow Return Report Modal */}
      {showReturnModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm text-right" dir="rtl">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                  <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                      <ArrowUturnLeftIcon className="w-5 h-5" />
                      إعادة التقرير للمراجعة
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 font-bold">يرجى ذكر أسباب إعادة التقرير والتعديلات المطلوبة:</p>
                  <textarea 
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none mb-4 font-bold bg-slate-50"
                      rows={4}
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder="اكتب ملاحظاتك هنا..."
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold">إلغاء</button>
                      <button 
                          onClick={() => {
                              if(onReturn) onReturn(returnNote);
                              setShowReturnModal(false);
                          }}
                          disabled={!returnNote.trim()}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                          تأكيد الإعادة
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Action Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-blue-900 px-6 py-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10 opacity-30 transform -skew-x-12 translate-x-1/4"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                          <ShieldCheckIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                          <h1 className="text-2xl font-extrabold text-white mb-1">{reportTitle}</h1>
                          <div className="flex items-center gap-2 text-blue-100/70 text-xs">
                              <span className="bg-white/10 px-2 py-0.5 rounded border border-white/10 font-bold">{editableResult.auditType}</span>
                              <span>|</span>
                              <span className="font-medium">{editableResult.targetName}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                      {/* Filter Toggle */}
                      <button 
                        onClick={() => setShowOnlyFindings(!showOnlyFindings)}
                        className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all border ${
                            showOnlyFindings 
                            ? 'bg-amber-600 text-white border-amber-700 shadow-lg shadow-amber-900/20' 
                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                        }`}
                        title={showOnlyFindings ? "عرض جميع بنود التقييم" : "عرض الملاحظات فقط"}
                      >
                        <FunnelIcon className="w-4 h-4" />
                        {showOnlyFindings ? 'عرض كافة العناصر' : 'عرض الملاحظات فقط'}
                      </button>

                      {status === 'completed' && !isEntityUser && onSendFindings && (ncCount > 0 || ioCount > 0) && (
                        <button 
                            onClick={() => setShowSendFindingsConfirm(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all"
                        >
                            <MegaphoneIcon className="w-4 h-4" />
                            إرسال الملاحظات للمتابعة
                        </button>
                      )}

                      {!isEntityUser && (
                        <button 
                            onClick={handleExportWord}
                            disabled={isExporting}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-all backdrop-blur-sm"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            {isExporting ? 'جاري التصدير...' : 'تصدير التقرير'}
                        </button>
                      )}

                      <button onClick={onReset} className="bg-white/5 hover:bg-red-600/20 text-white p-2 rounded-xl border border-white/10 transition-all group">
                          <XMarkIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">الحالة الحالية</p>
                      <span className={`px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm ${
                          status === 'completed' ? 'bg-green-600 text-white' :
                          status?.includes('pending') ? 'bg-blue-600 text-white' :
                          status === 'returned' ? 'bg-red-600 text-white' : 'bg-slate-600 text-white'
                      }`}>
                          {status === 'completed' ? 'معتمد نهائياً' : 
                           status === 'pending_head' ? 'قيد مراجعة رئيس القسم' :
                           status === 'pending_director' ? 'قيد مراجعة المدير' :
                           status === 'returned' ? 'معاد للمقيم' : 'مسودة'}
                      </span>
                  </div>
              </div>

              <div className="flex gap-2">
                {canApprove() && (
                    <>
                        <button onClick={() => setShowReturnModal(true)} className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-bold border border-red-200 hover:bg-red-100 transition-all flex items-center gap-2">
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                            إعادة للمقيم
                        </button>
                        <button onClick={onApprove} className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-green-700 shadow-md transition-all flex items-center gap-2">
                            <CheckBadgeIcon className="w-4 h-4" />
                            اعتماد التقرير
                        </button>
                    </>
                )}
                {onEdit && canUserEdit && (
                    <button onClick={onEdit} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2 transform hover:scale-[1.02] active:scale-95">
                        <PencilSquareIcon className="w-4 h-4" />
                        تعديل التقرير
                    </button>
                )}
              </div>
          </div>
      </div>

      {/* Main Content Filtering Feedback */}
      {showOnlyFindings && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center gap-4 animate-fade-in shadow-sm">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shadow-inner">
                  <FunnelIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                  <h4 className="text-amber-900 font-extrabold text-sm mb-1">وضع معالجة الملاحظات نشط</h4>
                  <p className="text-amber-800 text-xs font-medium leading-relaxed">
                      يتم حالياً عرض حالات عدم المطابقة وفرص التحسين فقط. تم إخفاء كافة بنود التقييم المستوفاة لتسهيل المتابعة واتخاذ الإجراءات التصحيحية.
                  </p>
              </div>
              <button 
                onClick={() => setShowOnlyFindings(false)}
                className="text-amber-700 hover:text-amber-900 text-xs font-bold underline px-3"
              >
                إلغاء التصفية
              </button>
          </div>
      )}

      {/* Information Cards */}
      {!showOnlyFindings && (
          <>
            <div className={`rounded-2xl shadow-md border ${classification.border} ${classification.bg} p-6 overflow-hidden relative`}>
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/20 -translate-x-8 -translate-y-8 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-3 mb-6">
                    <ChartBarIcon className={`w-7 h-7 ${classification.color}`} />
                    <h3 className={`text-xl font-extrabold ${classification.color}`}>نتيجة المفاضلة وتصنيف الجودة</h3>
                </div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/60 rounded-2xl p-5 border border-white/50 backdrop-blur-sm shadow-inner">
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-black text-slate-800">{penaltyScore}</span>
                            <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">نقاط جزاء</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold mb-4 flex items-center gap-1 uppercase">
                            <ScaleIcon className="w-3 h-3" />
                            مؤشر الجودة = (NC × 2) + (IO × 1)
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 font-black">
                                <XCircleIcon className="w-4 h-4" />
                                {ncCount} عدم مطابقة
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100 font-black">
                                <LightBulbIcon className="w-4 h-4" />
                                {ioCount} فرصة تحسين
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className={`text-3xl font-black mb-3 ${classification.color} drop-shadow-sm`}>
                            {classification.title}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white/30 p-3 rounded-xl border border-white/20">
                            {classification.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-right">
                <h3 className="text-sm font-black text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <ListBulletIcon className="w-5 h-5 text-blue-600" />
                    الملخص التنفيذي / الرأي العام:
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm font-medium bg-slate-50/50 p-4 rounded-xl italic">
                    {editableResult.overallSummary || "لا يوجد ملخص متاح لهذا التقرير."}
                </p>
            </div>
          </>
      )}

      {/* Detailed Results Loop */}
      <div className="grid grid-cols-1 gap-8">
        {filteredStages.length > 0 ? filteredStages.map((stage, stageIndex) => (
          <div key={stageIndex} className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 animate-fade-in">
            <div className="bg-blue-900 px-8 py-5 border-b border-blue-800 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white font-black text-lg border border-white/10 backdrop-blur-sm shadow-inner">
                  {stageIndex + 1}
                </span>
                <h3 className="font-black text-lg text-white">
                  {stage.elementName}
                </h3>
              </div>
              <StatusBadge status={stage.status as ComplianceStatus} />
            </div>
            <div className="p-8">
               {stage.analysis && !isEntityUser && !showOnlyFindings && (
                 <div className="mb-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-sm text-blue-900 font-medium italic flex items-start gap-3">
                   <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                   <div className="flex-1">
                      <strong className="block mb-1 not-italic font-black text-blue-800 uppercase text-[10px]">ملاحظات عامة على المحور:</strong>
                      {stage.analysis}
                   </div>
                 </div>
               )}

              <div className="space-y-8">
                {stage.criteriaResults.map((c: any, cIndex: number) => {
                  const isResponseRequired = c.status !== ComplianceStatus.COMPLIANT;
                  const targetUnits = getResponsibleUnits(c.responsibleUnits);
                  if (targetUnits.length === 0 && isEntityUser && currentUser?.name) {
                      targetUnits.push(currentUser.name);
                  }

                  return (
                  <div key={cIndex} className="bg-slate-50/30 rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group/criterion">
                    <div className="bg-white px-6 py-4 flex justify-between items-center gap-4 border-b border-slate-100 transition-colors">
                      <div className="flex-1">
                          <p className="text-sm font-black text-slate-800 leading-relaxed mb-1">{c.text}</p>
                          {isFindingInFollowUp(c.text) && (
                              <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                                      <MegaphoneIcon className="w-3 h-3" />
                                      مسجلة في سجل المتابعة
                                  </span>
                              </div>
                          )}
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
                        {/* Findings & Standard Info */}
                        <div className={`space-y-6 ${isEntityUser && !isResponseRequired ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
                            {c.analysis && (
                                <div className="space-y-1">
                                    <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <EyeIcon className="w-3.5 h-3.5" />
                                        التحليل وأدلة الإثبات
                                    </h5>
                                    <p className="text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-inner">{c.analysis}</p>
                                </div>
                            )}
                            {c.gaps && (
                                <div className="space-y-1">
                                    <h5 className="font-black text-[10px] text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                        أوجه القصور والملاحظات
                                    </h5>
                                    <p className="text-amber-900 font-extrabold leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100 shadow-inner">{c.gaps}</p>
                                </div>
                            )}
                            {c.governingStandard && (
                                <div className="space-y-1">
                                    <h5 className="font-black text-[10px] text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <ScaleIcon className="w-3.5 h-3.5" />
                                        المعيار المنظم (ISSAI)
                                    </h5>
                                    <p className="text-indigo-900 font-bold leading-relaxed bg-indigo-50 p-3 rounded-xl border border-indigo-100 shadow-inner italic">{c.governingStandard}</p>
                                </div>
                            )}
                            {c.recommendation && (
                                <div className="space-y-1">
                                    <h5 className="font-black text-[10px] text-green-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <LightBulbIcon className="w-3.5 h-3.5" />
                                        التوصيات المقترحة
                                    </h5>
                                    <p className="text-green-900 font-bold leading-relaxed bg-green-50 p-3 rounded-xl border border-green-100 shadow-inner">{c.recommendation}</p>
                                </div>
                            )}
                            {c.responsibleUnits && (
                                <div className="space-y-1">
                                    <h5 className="font-black text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <UserGroupIcon className="w-3.5 h-3.5" />
                                        الوحدات المعنية بالتصويب
                                    </h5>
                                    <p className="text-slate-600 font-black leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-inner text-xs">{c.responsibleUnits}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Interactive Response Section */}
                        {isResponseRequired && (
                            <div className="lg:col-span-2 space-y-6">
                                <h5 className="font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-600" />
                                    ردود الوحدات الرقابية وإجراءات المعالجة
                                </h5>
                                
                                <div className="space-y-6">
                                    {targetUnits.map((unitName, uIdx) => {
                                        const response = getUnitResponse(c, unitName);
                                        const isMyUnit = isEntityUser && currentUser?.name === unitName;
                                        const isLocked = isLockedForUnit(unitName, response);

                                        const getResponseStatusBadge = (status?: string) => {
                                            if (!status || status === 'pending') return <span className="bg-slate-100 text-slate-500 text-[10px] px-2.5 py-1 rounded-lg font-black border border-slate-200">بانتظار الإجراء</span>;
                                            if (status === 'submitted') return <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-black shadow-sm">قيد مراجعة الجودة</span>;
                                            if (status === 'returned') return <span className="bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-black shadow-sm">يتطلب تصحيح الرد</span>;
                                            if (status === 'approved') return <span className="bg-green-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-black shadow-sm flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> تم الاعتماد وإغلاق الحالة</span>;
                                        };

                                        if (isMyUnit) {
                                            return (
                                                <div key={uIdx} className={`p-6 rounded-2xl border-2 shadow-lg transition-all animate-fade-in ${response?.status === 'returned' ? 'bg-red-50 border-red-300 ring-4 ring-red-100/50' : 'bg-white border-purple-200'}`}>
                                                    <div className="flex items-center justify-between mb-5">
                                                        <div className="flex items-center gap-2 text-slate-800 font-black">
                                                            <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
                                                            <span>وحدة: {unitName}</span>
                                                        </div>
                                                        {getResponseStatusBadge(response?.status)}
                                                    </div>
                                                    
                                                    {response?.status === 'returned' && response.history && response.history.length > 0 && (
                                                        <div className="bg-red-600 text-white p-4 rounded-xl mb-6 shadow-md relative">
                                                            <div className="absolute top-0 right-0 w-8 h-8 bg-red-700/50 rounded-bl-2xl flex items-center justify-center">
                                                                <ExclamationTriangleIcon className="w-4 h-4" />
                                                            </div>
                                                            <div className="font-black text-xs mb-1">ملاحظة المراجع (سبب الإعادة):</div>
                                                            <p className="text-sm font-bold">{response.history[response.history.length - 1].note}</p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-5">
                                                        <div>
                                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">الإجراء التصحيحي المتخذ</label>
                                                            {isLocked ? (
                                                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold min-h-[5rem] whitespace-pre-wrap">{response?.action}</div>
                                                            ) : (
                                                                <textarea 
                                                                    value={response?.action || ''}
                                                                    onChange={(e) => handleUnitUpdate(stageIndex, cIndex, unitName, 'action', e.target.value)}
                                                                    placeholder="اشرح بالتفصيل الخطوات التي تم اتخاذها لمعالجة الملاحظة..."
                                                                    className="w-full p-4 text-sm border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none bg-slate-50 font-bold transition-all h-32"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">المؤيدات / المستندات الداعمة</label>
                                                                <div className="flex items-center gap-2">
                                                                    {response?.evidence ? (
                                                                        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200 flex-1 shadow-inner">
                                                                            <PaperClipIcon className="w-4 h-4 text-indigo-600" />
                                                                            <span className="text-xs text-indigo-900 font-black truncate max-w-[200px]">{response.evidenceName || 'ملف مرفق'}</span>
                                                                            {!isLocked && (
                                                                                <button 
                                                                                    onClick={() => handleRemoveFile(stageIndex, cIndex, unitName)}
                                                                                    className="text-red-500 hover:text-red-700 mr-auto p-1 hover:bg-white rounded-lg transition-colors"
                                                                                >
                                                                                    <TrashIcon className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ) : !isLocked ? (
                                                                        <div className="relative flex-1">
                                                                            <input 
                                                                                type="file"
                                                                                id={`file-${stageIndex}-${cIndex}-${uIdx}`}
                                                                                className="hidden"
                                                                                onChange={(e) => handleUnitFileUpload(stageIndex, cIndex, unitName, e)}
                                                                            />
                                                                            <label 
                                                                                htmlFor={`file-${stageIndex}-${cIndex}-${uIdx}`}
                                                                                className="flex items-center justify-center gap-3 w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 text-xs font-black cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all hover:text-purple-600"
                                                                            >
                                                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                                                إرفاق مستند المعالجة
                                                                            </label>
                                                                        </div>
                                                                    ) : <span className="text-xs text-slate-400 font-bold italic bg-slate-100 px-3 py-2 rounded-lg">لا توجد مرفقات</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            const toggleKey = `${stageIndex}-${cIndex}-${uIdx}`;
                                            return (
                                                <div key={uIdx} className={`p-6 rounded-2xl border-2 transition-all relative ${response ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 border-dashed opacity-70'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2 text-slate-700 font-black">
                                                            <BuildingOfficeIcon className="w-5 h-5 text-slate-400" />
                                                            <span>وحدة: {unitName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {response?.date && <span className="text-[10px] text-slate-400 font-mono font-black">{response.date}</span>}
                                                            {getResponseStatusBadge(response?.status)}
                                                        </div>
                                                    </div>
                                                    
                                                    {response ? (
                                                        <div className="space-y-4">
                                                            <div className="text-slate-800 font-bold text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">{response.action}</div>
                                                            
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                {response.evidence && (
                                                                    <a 
                                                                        href={response.evidence} 
                                                                        download={response.evidenceName || 'evidence'}
                                                                        className="inline-flex items-center gap-2 text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors shadow-sm"
                                                                    >
                                                                        <PaperClipIcon className="w-3.5 h-3.5" />
                                                                        تحميل المؤيد: {response.evidenceName || 'مرفق'}
                                                                    </a>
                                                                )}
                                                                
                                                                {response.history && response.history.length > 0 && (
                                                                    <button 
                                                                        onClick={() => setExpandedHistory(expandedHistory === toggleKey ? null : toggleKey)}
                                                                        className="text-[10px] font-black text-indigo-600 hover:indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 shadow-sm"
                                                                    >
                                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                                        سجل المداولات ({response.history.length})
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {expandedHistory === toggleKey && response.history && (
                                                                <div className="mt-4 bg-blue-900 rounded-2xl p-5 text-xs space-y-4 max-h-64 overflow-y-auto animate-fade-in custom-scrollbar shadow-inner">
                                                                    <h6 className="font-black text-white/50 text-[10px] uppercase tracking-widest border-b border-white/10 pb-2 mb-3">تفاصيل الإجراءات السابقة:</h6>
                                                                    {response.history.map((h, hIdx) => (
                                                                        <div key={hIdx} className={`p-4 rounded-xl border ${h.action === 'submit' ? 'bg-white/5 border-white/10 ml-6' : h.action === 'approve' ? 'bg-green-900/20 border-green-800/30' : 'bg-red-900/20 border-red-800/30 mr-6'}`}>
                                                                            <div className="flex justify-between items-center mb-2">
                                                                                <span className="font-black text-blue-300">{h.user}</span>
                                                                                <span className="text-[10px] text-white/40 font-mono">{h.date}</span>
                                                                            </div>
                                                                            <p className="text-white/80 font-bold leading-relaxed">{h.note}</p>
                                                                            <div className="mt-2 flex justify-end">
                                                                                {h.action === 'approve' && <span className="text-green-400 font-black text-[10px] flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> تم الاعتماد</span>}
                                                                                {h.action === 'return' && <span className="text-red-400 font-black text-[10px] flex items-center gap-1"><ArrowUturnLeftIcon className="w-3 h-3" /> تم الإعادة للتصحيح</span>}
                                                                                {h.action === 'submit' && <span className="text-blue-300 font-black text-[10px] flex items-center gap-1"><PaperAirplaneIcon className="w-3 h-3" /> تم الرد</span>}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Reviewer Action Buttons */}
                                                            {!isEntityUser && currentUser?.permissions.performReview && response.status === 'submitted' && (
                                                                <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100 justify-end">
                                                                    <button 
                                                                        onClick={() => setResponseReviewModal({
                                                                            isOpen: true,
                                                                            stageIndex: stageIndex,
                                                                            criterionIndex: cIndex,
                                                                            unitName: unitName
                                                                        })}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-200 text-red-600 text-xs font-black rounded-xl hover:bg-red-50 shadow-sm"
                                                                    >
                                                                        <ArrowUturnLeftIcon className="w-4 h-4" />
                                                                        إعادة للتصحيح
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => onReviewUnitResponse?.(stageIndex, cIndex, unitName, 'approve')}
                                                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 shadow-md shadow-green-900/20"
                                                                    >
                                                                        <CheckBadgeIcon className="w-4 h-4" />
                                                                        اعتماد وإغلاق الحالة
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-4 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                            <NoSymbolIcon className="w-6 h-6 mb-1 opacity-50" />
                                                            <p className="text-[10px] font-black italic">بانتظار رد الوحدة الرقابية المختصة...</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        )) : (
            <div className="bg-white p-20 rounded-3xl border-2 border-slate-100 text-center flex flex-col items-center gap-6 animate-fade-in shadow-xl">
                <div className="p-6 bg-green-50 rounded-3xl text-green-600 shadow-inner">
                    <CheckBadgeIcon className="w-16 h-16" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد ملاحظات معلقة!</h3>
                    <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                        رائع! كافة عناصر هذا التقييم مستوفاة ومطابقة للمعايير المهنية، أو تم اعتماد جميع المعالجات مسبقاً.
                    </p>
                </div>
                <button 
                    onClick={() => setShowOnlyFindings(false)}
                    className="mt-2 text-blue-600 font-black text-sm hover:bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 transition-all flex items-center gap-2"
                >
                    <EyeIcon className="w-5 h-5" />
                    عرض التقرير الكامل ببنوده المستوفاة
                </button>
            </div>
        )}
      </div>

      {/* Persistence for Entity View */}
      {isEntityUser && onSaveEntityResponse && (
          <div className="sticky bottom-4 z-40 flex justify-center pt-8">
              <button
                  onClick={() => onSaveEntityResponse(editableResult)}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-black py-4 px-12 rounded-2xl shadow-2xl transition-all transform hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 ring-4 ring-white shadow-purple-900/30"
              >
                  <PaperAirplaneIcon className="w-6 h-6 -rotate-45" />
                  حفظ وإرسال ردود الوحدة
              </button>
          </div>
      )}

      {/* History Track */}
      {!isEntityUser && !showOnlyFindings && approvalHistory.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 mt-12 shadow-inner">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
                  سجل حالة الاعتماد
              </h3>
              <div className="space-y-6">
                  {approvalHistory.map((action, idx) => (
                      <div key={idx} className="flex gap-5 relative">
                          {idx < approvalHistory.length - 1 && <div className="absolute top-10 right-[15px] w-0.5 h-full bg-slate-200"></div>}
                          
                          <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 shadow-sm
                              ${action.action === 'approve' ? 'bg-green-600 text-white' : 
                                action.action === 'return' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                              {action.action === 'approve' ? <CheckCircleIcon className="w-5 h-5" /> : 
                               action.action === 'return' ? <ArrowUturnLeftIcon className="w-5 h-5" /> : <PaperAirplaneIcon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                      <p className="font-black text-sm text-slate-800">{action.user}</p>
                                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border uppercase tracking-wider
                                          ${action.action === 'approve' ? 'bg-green-50 text-green-700 border-green-200' : 
                                            action.action === 'return' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                          {action.action === 'approve' ? 'تم الاعتماد' : action.action === 'return' ? 'تمت الإعادة' : 'تم الرفع'}
                                      </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono font-bold">{action.date}</span>
                              </div>
                              {action.note && <p className="text-xs text-slate-500 mt-2 font-bold italic leading-relaxed">"{action.note}"</p>}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Footer Return Button */}
      <div className="flex justify-center pt-10 pb-6">
        <button onClick={onReset} className="text-slate-500 hover:text-blue-600 font-black text-sm px-10 py-3 rounded-2xl hover:bg-white hover:shadow-md border border-transparent transition-all">إلغاء التقرير والعودة</button>
      </div>
    </div>
  );
};