
import React, { useState, useEffect } from 'react';
import { AuditType, ComplianceStatus, AuditAnalysisResult, AuditStageEvaluation, CriterionResult, QCConfig, User } from '../types';
import { UserGroupIcon, ClipboardDocumentListIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, BookmarkSquareIcon, ScaleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ConfirmModal } from './OperationalViews';

interface TeamLeaderFormProps {
  onSubmit: (data: AuditAnalysisResult) => void;
  onSaveDraft?: (data: AuditAnalysisResult) => void;
  config: QCConfig;
  initialLeaderName?: string;
  initialReviewerName?: string;
  initialEvaluationPeriod?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialStages?: AuditStageEvaluation[];
  reviewers: { id: number; name: string }[];
  currentUser?: User;
  availableUnits?: User[]; // New Prop
}

export const TeamLeaderForm: React.FC<TeamLeaderFormProps> = ({ onSubmit, onSaveDraft, config, initialLeaderName = '', initialReviewerName = '', initialEvaluationPeriod = '', initialStartDate = '', initialEndDate = '', initialStages, reviewers, currentUser, availableUnits = [] }) => {
  const [leaderName, setLeaderName] = useState(initialLeaderName);
  const [auditType, setAuditType] = useState<AuditType>(AuditType.FINANCIAL);
  const [summary, setSummary] = useState('');
  const [reviewerName, setReviewerName] = useState(initialReviewerName);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Date states
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Dropdown state
  const [activeUnitDropdown, setActiveUnitDropdown] = useState<string | null>(null);
  
  // Update state if props change
  useEffect(() => {
    if (initialLeaderName) setLeaderName(initialLeaderName);
    if (initialReviewerName) setReviewerName(initialReviewerName);
    if (initialStartDate) setStartDate(initialStartDate);
    if (initialEndDate) setEndDate(initialEndDate);
  }, [initialLeaderName, initialReviewerName, initialStartDate, initialEndDate]);

  const [stages, setStages] = useState<AuditStageEvaluation[]>(() => {
    if (initialStages && initialStages.length > 0) return initialStages;
    
    return config.map(configStage => ({
      elementName: configStage.name,
      status: ComplianceStatus.COMPLIANT,
      criteriaResults: configStage.criteria.map(text => ({
        text,
        status: ComplianceStatus.COMPLIANT,
        analysis: '',
        gaps: '',
        recommendation: '',
        governingStandard: '',
        responsibleUnits: ''
      })),
      analysis: '',
      gaps: '',
      recommendation: ''
    }));
  });

  useEffect(() => {
    if (initialStages && initialStages.length > 0) {
        setStages(initialStages);
    } else {
        setStages(prev => {
            // Reset/Update when config changes
            return config.map(configStage => ({
                elementName: configStage.name,
                status: ComplianceStatus.COMPLIANT,
                criteriaResults: configStage.criteria.map(text => ({
                    text,
                    status: ComplianceStatus.COMPLIANT,
                    analysis: '',
                    gaps: '',
                    recommendation: '',
                    governingStandard: '',
                    responsibleUnits: ''
                })),
                analysis: '',
                gaps: '',
                recommendation: ''
            }));
        });
    }
  }, [config, initialStages]);
  
  const [expandedStage, setExpandedStage] = useState<number | null>(0);

  const handleStageChange = (index: number, field: keyof AuditStageEvaluation, value: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], [field]: value };
    setStages(newStages);
  };

  const handleCriterionDetailChange = (stageIndex: number, criterionIndex: number, field: keyof CriterionResult, value: string) => {
    const newStages = [...stages];
    const newCriteria = [...newStages[stageIndex].criteriaResults];
    newCriteria[criterionIndex] = { ...newCriteria[criterionIndex], [field]: value };
    newStages[stageIndex].criteriaResults = newCriteria;
    setStages(newStages);
  };

  // Helper to handle Multi-Select changes
  const toggleResponsibleUnit = (stageIndex: number, criterionIndex: number, unitName: string) => {
      const currentUnitsString = stages[stageIndex].criteriaResults[criterionIndex].responsibleUnits || '';
      const currentUnits = currentUnitsString ? currentUnitsString.split(',').map(s => s.trim()) : [];
      
      let newUnits: string[];
      if (currentUnits.includes(unitName)) {
          newUnits = currentUnits.filter(u => u !== unitName);
      } else {
          newUnits = [...currentUnits, unitName];
      }
      
      handleCriterionDetailChange(stageIndex, criterionIndex, 'responsibleUnits', newUnits.join(', '));
  };

  const handleCriterionStatusChange = (stageIndex: number, criterionIndex: number, newStatus: ComplianceStatus) => {
    const newStages = [...stages];
    const newCriteria = [...newStages[stageIndex].criteriaResults];
    newCriteria[criterionIndex] = { ...newCriteria[criterionIndex], status: newStatus };
    newStages[stageIndex].criteriaResults = newCriteria;

    const hasNC = newCriteria.some(c => c.status === ComplianceStatus.NON_CONFORMANCE);
    const hasIO = newCriteria.some(c => c.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY);
    
    if (hasNC) {
      newStages[stageIndex].status = ComplianceStatus.NON_CONFORMANCE;
    } else if (hasIO) {
      newStages[stageIndex].status = ComplianceStatus.IMPROVEMENT_OPPORTUNITY;
    } else {
      newStages[stageIndex].status = ComplianceStatus.COMPLIANT;
    }

    setStages(newStages);
  };

  const getEvaluationData = (): AuditAnalysisResult => {
      const evaluationPeriodStr = startDate && endDate ? `من ${startDate} إلى ${endDate}` : initialEvaluationPeriod;
      
      let auditTypeLabel = '';
      switch(auditType) {
          case AuditType.FINANCIAL: auditTypeLabel = 'تدقيق مالي'; break;
          case AuditType.PERFORMANCE: auditTypeLabel = 'تدقيق الأداء'; break;
          case AuditType.COMPLIANCE: auditTypeLabel = 'تدقيق الالتزام'; break;
          case AuditType.PROFESSIONAL_REVIEW: auditTypeLabel = 'الأداء المهني'; break;
      }

      return {
          auditType: `${auditTypeLabel} ${evaluationPeriodStr ? `(${evaluationPeriodStr})` : ''} - رئيس الفريق: ${leaderName} ${reviewerName ? `(المقيم: ${reviewerName})` : ''}`,
          targetName: leaderName,
          targetType: 'TeamLeader',
          overallSummary: summary,
          stages
      };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderName) {
        alert("يرجى إدخال اسم رئيس الفريق قبل الإرسال.");
        return;
    }
    setIsConfirmOpen(true);
  };

  const handleFinalSubmit = () => {
    onSubmit(getEvaluationData());
    setIsConfirmOpen(false);
  };

  const handleSaveDraftClick = (e: React.FormEvent) => {
      e.preventDefault();
      if(onSaveDraft) {
          onSaveDraft(getEvaluationData());
      }
  };

  const toggleExpand = (index: number) => {
    setExpandedStage(expandedStage === index ? null : index);
  };

  const getSubmitLabel = () => {
      if (currentUser?.role === 'مدير النظام') return 'اعتماد تقرير تقييم رئيس الفريق';
      if (currentUser?.role === 'رئيس قسم') return 'اعتماد التعديلات ورفع للمدير';
      return 'ارسال التقرير للمراجعة';
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="تأكيد إرسال التقييم"
        message="هل أنت متأكد من رغبتك في إرسال تقرير تقييم رئيس الفريق للمراجعة؟ لن تتمكن من تعديل البيانات بعد الإرسال."
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* General Info Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">بيانات تقييم رئيس الفريق</h2>
            <p className="text-sm text-slate-500">تقييم الدور القيادي والفني وفق الملحق رقم (5)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">اسم رئيس الفريق</label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-bold"
                placeholder="الاسم الثلاثي..."
              />
            </div>
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">نوع المهمة / مراجعة الأعمال</label>
               <select 
                  value={auditType}
                  onChange={(e) => setAuditType(e.target.value as AuditType)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold"
               >
                 <option value={AuditType.FINANCIAL}>تدقيق مالي</option>
                 <option value={AuditType.PERFORMANCE}>تدقيق الأداء</option>
                 <option value={AuditType.COMPLIANCE}>تدقيق الالتزام</option>
                 <option value={AuditType.PROFESSIONAL_REVIEW}>الأداء المهني</option>
               </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">اسم المقيم</label>
                <select
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 bg-slate-50"
                >
                    <option value="">-- اختر اسم المقيم --</option>
                    {reviewers.map(reviewer => (
                        <option key={reviewer.id} value={reviewer.name}>{reviewer.name}</option>
                    ))}
                </select>
            </div>
            <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">الفترة المحددة للتقييم</label>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <label className="block text-xs text-slate-500 mb-1">تاريخ البدء</label>
                     <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                 </div>
                 <div>
                     <label className="block text-xs text-slate-500 mb-1">تاريخ الانتهاء</label>
                     <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                    />
                 </div>
             </div>
          </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">الرأي العام / ملخص تقييم الأداء</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full h-28 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800"
              placeholder="اكتب ملخصاً عاماً حول أداء رئيس الفريق، أبرز نقاط القوة، والجوانب التي تحتاج إلى تطوير..."
            />
          </div>
        </div>
      </div>

      {/* Stages Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
           <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600" />
           <h3 className="text-lg font-bold text-slate-800">عناصر التقييم (Checklist)</h3>
        </div>
        
        {stages.map((stage, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleExpand(index)}
              className={`w-full flex items-center justify-between p-4 transition-colors ${
                expandedStage === index ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                  {index + 1}
                </span>
                <span className="font-bold text-slate-800">{stage.elementName}</span>
                
                <span className={`text-xs px-2 py-1 rounded-full border ${
                    stage.status === ComplianceStatus.COMPLIANT ? 'bg-green-50 border-green-200 text-green-700' :
                    stage.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {stage.status === ComplianceStatus.COMPLIANT ? 'مستوفى' : 
                   stage.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY ? 'فرصة تحسين' : 'عدم مطابقة'}
                </span>
              </div>
              {expandedStage === index ? (
                <ChevronUpIcon className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedStage === index && (
              <div className="p-6 border-t border-slate-100 space-y-6 bg-white animate-fade-in">
                
                {/* Granular Criteria Evaluation */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                     <h4 className="font-bold text-sm text-slate-700">التحقق من العناصر الفرعية</h4>
                   </div>
                   <div className="divide-y divide-slate-100">
                     {stage.criteriaResults.map((criterion, cIndex) => (
                        <div key={cIndex} className="p-5 hover:bg-slate-50/50 transition-colors">
                           <p className="text-sm text-slate-800 font-bold mb-3">{criterion.text}</p>
                           <div className="flex flex-wrap gap-2 mb-4">
                             <button
                               onClick={() => handleCriterionStatusChange(index, cIndex, ComplianceStatus.COMPLIANT)}
                               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                 criterion.status === ComplianceStatus.COMPLIANT
                                 ? 'bg-green-100 text-green-800 border-green-300' : 'bg-white text-slate-500 border-slate-200 hover:border-green-200'
                               }`}
                             >
                               <CheckCircleIcon className="w-4 h-4" />
                               مستوفى
                             </button>
                             <button
                               onClick={() => handleCriterionStatusChange(index, cIndex, ComplianceStatus.IMPROVEMENT_OPPORTUNITY)}
                               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                 criterion.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY
                                 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200'
                               }`}
                             >
                               <LightBulbIcon className="w-4 h-4" />
                               فرصة تحسين
                             </button>
                             <button
                               onClick={() => handleCriterionStatusChange(index, cIndex, ComplianceStatus.NON_CONFORMANCE)}
                               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                 criterion.status === ComplianceStatus.NON_CONFORMANCE
                                 ? 'bg-red-100 text-red-800 border-red-300' : 'bg-white text-slate-500 border-slate-200 hover:border-red-200'
                               }`}
                             >
                               <XCircleIcon className="w-4 h-4" />
                               عدم مطابقة
                             </button>
                           </div>

                           {/* Detailed Inputs per Criterion */}
                           <div className="pl-2 border-r-2 border-slate-200 pr-4 space-y-3 bg-indigo-50/30 p-3 rounded-lg">
                              <div>
                                  <label className="block text-xs font-semibold text-slate-600 mb-1">التحليل / أدلة الإثبات</label>
                                  <textarea 
                                    value={criterion.analysis}
                                    onChange={(e) => handleCriterionDetailChange(index, cIndex, 'analysis', e.target.value)}
                                    placeholder="صف الأدلة الداعمة..."
                                    className="w-full p-2 text-xs border border-slate-300 rounded bg-white h-16 focus:ring-1 focus:ring-indigo-500 outline-none"
                                  />
                              </div>
                              
                              {/* Governing Standard and Gaps */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-amber-700 mb-1">الفجوات / الملاحظات</label>
                                    <textarea 
                                      value={criterion.gaps}
                                      onChange={(e) => handleCriterionDetailChange(index, cIndex, 'gaps', e.target.value)}
                                      placeholder="الملاحظات..."
                                      className="w-full p-2 text-xs border border-amber-200 rounded bg-white h-16 focus:ring-1 focus:ring-amber-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-indigo-700 mb-1 flex items-center gap-1">
                                        <ScaleIcon className="w-3 h-3" />
                                        المعيار المنظم
                                    </label>
                                    <textarea 
                                      value={criterion.governingStandard}
                                      onChange={(e) => handleCriterionDetailChange(index, cIndex, 'governingStandard', e.target.value)}
                                      placeholder="المادة القانونية أو المعيار..."
                                      className="w-full p-2 text-xs border border-indigo-200 rounded bg-white h-16 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                  </div>
                              </div>

                              {/* Recommendations and Responsible Units */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-semibold text-green-700 mb-1">التوصيات</label>
                                    <textarea 
                                      value={criterion.recommendation}
                                      onChange={(e) => handleCriterionDetailChange(index, cIndex, 'recommendation', e.target.value)}
                                      placeholder="الإجراء المقترح..."
                                      className="w-full p-2 text-xs border border-green-200 rounded bg-white h-16 focus:ring-1 focus:ring-green-500 outline-none"
                                    />
                                  </div>
                                  <div className="relative">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                        <UserGroupIcon className="w-3 h-3" />
                                        الوحدات المعنية بالتصويب
                                    </label>
                                    
                                    {/* Custom Multi-Select Trigger */}
                                    <div 
                                        className="w-full p-2 text-xs border border-slate-300 rounded bg-white min-h-[4rem] cursor-pointer flex flex-wrap gap-1 content-start"
                                        onClick={() => setActiveUnitDropdown(activeUnitDropdown === `${index}-${cIndex}` ? null : `${index}-${cIndex}`)}
                                    >
                                        {criterion.responsibleUnits ? (
                                            criterion.responsibleUnits.split(',').map((unit, uIdx) => (
                                                <span key={uIdx} className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    {unit.trim()}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleResponsibleUnit(index, cIndex, unit.trim()); }}
                                                        className="hover:text-red-500"
                                                    >
                                                        <XMarkIcon className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400">اختر الوحدات من القائمة...</span>
                                        )}
                                    </div>

                                    {/* Dropdown Menu */}
                                    {activeUnitDropdown === `${index}-${cIndex}` && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {availableUnits.map(unit => {
                                                const isSelected = criterion.responsibleUnits?.split(',').map(s => s.trim()).includes(unit.name);
                                                return (
                                                    <div 
                                                        key={unit.id}
                                                        onClick={() => toggleResponsibleUnit(index, cIndex, unit.name)}
                                                        className={`px-3 py-2 text-xs cursor-pointer flex items-center gap-2 hover:bg-slate-50 ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'}`}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                            {isSelected && <CheckCircleIcon className="w-3 h-3 text-white" />}
                                                        </div>
                                                        {unit.name}
                                                    </div>
                                                );
                                            })}
                                            {availableUnits.length === 0 && (
                                                <div className="p-3 text-center text-xs text-slate-400">لا توجد وحدات متاحة</div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Overlay to close dropdown */}
                                    {activeUnitDropdown === `${index}-${cIndex}` && (
                                        <div className="fixed inset-0 z-0 cursor-default" onClick={() => setActiveUnitDropdown(null)}></div>
                                    )}
                                  </div>
                              </div>
                           </div>

                        </div>
                     ))}
                   </div>
                </div>

                {/* Stage Level Comments */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-4">تعليقات عامة (اختياري)</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <textarea
                          value={stage.analysis}
                          onChange={(e) => handleStageChange(index, 'analysis', e.target.value)}
                          className="w-full h-20 p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                          placeholder="ملخص عام للمحور..."
                        />
                    </div>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 flex gap-3">
        {onSaveDraft && (
            <button
            onClick={handleSaveDraftClick}
            className="flex-1 bg-white border border-slate-300 text-slate-700 font-bold py-4 px-6 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
            <BookmarkSquareIcon className="w-6 h-6" />
            <span>حفظ مسودة</span>
            </button>
        )}
        <button
          onClick={handleSubmit}
          className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          <ClipboardDocumentListIcon className="w-6 h-6" />
          <span>{getSubmitLabel()}</span>
        </button>
      </div>
    </div>
  );
};
