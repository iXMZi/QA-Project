import React, { useState, useEffect, useMemo } from 'react';
import { AuditForm } from './components/AuditForm';
import { TeamLeaderForm } from './components/TeamLeaderForm';
import { TeamMemberForm } from './components/TeamMemberForm';
import { AuditProgramForm } from './components/AuditProgramForm';
import { ResultsView } from './components/ResultsView';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
// Updated imports to point to specific view files instead of the barrel file
import { PlanView, DashboardView, QCLogView, FollowUpLogView } from './components/OperationalViews';
import { SettingsView, UserManagementView, RecycleBinView } from './components/ManagementViews';
import { AuditAnalysisResult, AuditType, AuditStageEvaluation, QCConfig, ComplianceStatus, User, QCLogItem, ReportStatus, ApprovalAction, PlanItem, PlanMetadata, FollowUpItem, UnitResponse, ResponseInteraction, ActivityLog } from './types';
import { DocumentMagnifyingGlassIcon, UserGroupIcon, UserIcon, Bars3Icon, ArrowLeftIcon, ChatBubbleLeftRightIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { 
    DEFAULT_ROLES, 
    DEFAULT_USERS, 
    DEFAULT_PLANS, 
    DEFAULT_ANNUAL_PLANS_META, 
    DEFAULT_QC_LOGS, 
    DEFAULT_MISSION_CONFIG, 
    DEFAULT_LEADER_CONFIG, 
    DEFAULT_MEMBER_CONFIG, 
    DEFAULT_PROGRAM_CONFIG 
} from './src/constants';

// Helper for session storage initialization (Client-Side Only)
function getSessionState<T>(key: string, defaultValue: T): T {
    try {
        const saved = sessionStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error(`Error loading ${key} from sessionStorage`, e);
    }
    return defaultValue;
}

const App: React.FC = () => {
  // --- State Initialization ---
  
  // Session State (Per Tab/User)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSessionState('app_current_user', null));
  const [currentView, setCurrentView] = useState(() => getSessionState('app_current_view', 'dashboard'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Shared Data State (Fetched from Server)
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [plans, setPlans] = useState<PlanItem[]>(DEFAULT_PLANS);
  const [annualPlansMeta, setAnnualPlansMeta] = useState<Record<number, PlanMetadata>>(DEFAULT_ANNUAL_PLANS_META);
  const [qcLogs, setQcLogs] = useState<QCLogItem[]>(DEFAULT_QC_LOGS);
  const [followUpItems, setFollowUpItems] = useState<FollowUpItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Config State
  const [missionConfig, setMissionConfig] = useState<QCConfig>(DEFAULT_MISSION_CONFIG);
  const [leaderConfig, setLeaderConfig] = useState<QCConfig>(DEFAULT_LEADER_CONFIG);
  const [memberConfig, setMemberConfig] = useState<QCConfig>(DEFAULT_MEMBER_CONFIG);
  const [programConfig, setProgramConfig] = useState<QCConfig>(DEFAULT_PROGRAM_CONFIG);

  // --- API Interaction ---

  // 1. Fetch Initial Data
  useEffect(() => {
      const fetchData = async () => {
          try {
              const response = await fetch('/api/data');
              if (response.ok) {
                  const data = await response.json();
                  if (data.app_roles) setRoles(data.app_roles);
                  if (data.app_users) setUsers(data.app_users);
                  if (data.app_plans) setPlans(data.app_plans);
                  if (data.app_plans_meta) setAnnualPlansMeta(data.app_plans_meta);
                  if (data.app_qc_logs) setQcLogs(data.app_qc_logs);
                  if (data.app_followup_items) setFollowUpItems(data.app_followup_items);
                  if (data.app_activity_logs) setActivityLogs(data.app_activity_logs);
                  if (data.app_config_mission) setMissionConfig(data.app_config_mission);
                  if (data.app_config_leader) setLeaderConfig(data.app_config_leader);
                  if (data.app_config_member) setMemberConfig(data.app_config_member);
                  if (data.app_config_program) setProgramConfig(data.app_config_program);
              }
          } catch (error) {
              console.error("Failed to fetch initial data:", error);
          }
      };
      fetchData();
  }, []);

  // 2. Persist Changes to Server
  const saveData = async (key: string, value: any) => {
      try {
          await fetch(`/api/data/${key}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value })
          });
      } catch (error) {
          console.error(`Failed to save ${key}:`, error);
      }
  };

  // --- Persistence Effects (Trigger API Save) ---
  // We use a ref to skip the initial render save to avoid overwriting server data with defaults before fetch completes
  const isMounted = React.useRef(false);

  useEffect(() => {
      if (isMounted.current) saveData('app_roles', roles);
  }, [roles]);

  useEffect(() => {
      if (isMounted.current) saveData('app_users', users);
  }, [users]);

  useEffect(() => {
      if (isMounted.current) saveData('app_plans', plans);
  }, [plans]);

  useEffect(() => {
      if (isMounted.current) saveData('app_plans_meta', annualPlansMeta);
  }, [annualPlansMeta]);

  useEffect(() => {
      if (isMounted.current) saveData('app_qc_logs', qcLogs);
  }, [qcLogs]);

  useEffect(() => {
      if (isMounted.current) saveData('app_followup_items', followUpItems);
  }, [followUpItems]);

  useEffect(() => {
      if (isMounted.current) saveData('app_activity_logs', activityLogs);
  }, [activityLogs]);

  useEffect(() => {
      if (isMounted.current) saveData('app_config_mission', missionConfig);
  }, [missionConfig]);

  useEffect(() => {
      if (isMounted.current) saveData('app_config_leader', leaderConfig);
  }, [leaderConfig]);

  useEffect(() => {
      if (isMounted.current) saveData('app_config_member', memberConfig);
  }, [memberConfig]);

  useEffect(() => {
      if (isMounted.current) saveData('app_config_program', programConfig);
  }, [programConfig]);

  // Set mounted flag after first render
  useEffect(() => {
      isMounted.current = true;
  }, []);

  // Session Persistence (Client Side Only)
  useEffect(() => { 
      if (currentUser) sessionStorage.setItem('app_current_user', JSON.stringify(currentUser)); 
      else sessionStorage.removeItem('app_current_user');
  }, [currentUser]);
  
  useEffect(() => { sessionStorage.setItem('app_current_view', JSON.stringify(currentView)); }, [currentView]);

  // Temporary State for Navigation/Forms
  const [selectedResult, setSelectedResult] = useState<AuditAnalysisResult | null>(null);
  const [activeFormType, setActiveFormType] = useState<'mission' | 'team_leader' | 'team_member' | 'audit_program' | null>(null);
  const [formInitialData, setFormInitialData] = useState<any>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null); // Track if we are editing an existing log
  const [forceFindingsOnly, setForceFindingsOnly] = useState(false); // Flag to show only findings in ResultsView

  // --- Logger Helper ---
  const logActivity = (action: string, target: string, details: string = '') => {
      // If no current user, we can't log who did it properly, but we can try from target if it's login
      const userId = currentUser ? currentUser.id : 0;
      const userName = currentUser ? currentUser.name : 'System';
      const userRole = currentUser ? currentUser.role : 'System';

      const newLog: ActivityLog = {
          id: Date.now().toString() + Math.random().toString().slice(2, 5),
          userId,
          userName,
          userRole,
          action,
          target,
          details,
          timestamp: new Date().toISOString()
      };
      setActivityLogs(prev => [newLog, ...prev]);
  };

  // Handlers
  const handleLogin = (user: User) => {
    // Manually log login since currentUser is not set yet in the helper scope
    const newLog: ActivityLog = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'تسجيل دخول',
        target: 'النظام',
        timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);

    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logActivity('تسجيل خروج', 'النظام');
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleStartQC = (planItem: PlanItem, reviewer?: User, dates?: {start: string, end: string}) => {
     // Prepare form based on plan item
     let type: 'mission' | 'team_leader' | 'team_member' | 'audit_program' = 'mission';
     if (planItem.targetType === 'TeamLeader') type = 'team_leader';
     if (planItem.targetType === 'TeamMember') type = 'team_member';
     if (planItem.targetType === 'AuditProgram') type = 'audit_program';

     setEditingLogId(null);
     setFormInitialData({
         targetName: planItem.targetName,
         controlUnitName: planItem.controlUnitName,
         auditType: planItem.auditType,
         evaluationPeriod: planItem.evaluationPeriod,
         startDate: dates?.start,
         endDate: dates?.end,
         reviewerName: reviewer?.name
     });
     setActiveFormType(type);
     
     // Update Plan Item Status
     const updatedPlans = plans.map(p => p.id === planItem.id ? { ...p, status: 'قيد التنفيذ' } : p);
     setPlans(updatedPlans);
     
     // Create a log entry 'assigned' - CRITICAL: Save dates here
     const newLog: QCLogItem = {
         id: Date.now().toString(),
         reportNumber: `QC-${new Date().getFullYear()}-${qcLogs.length + 101}`,
         missionName: planItem.targetName,
         targetType: planItem.targetType,
         auditType: planItem.auditType === AuditType.FINANCIAL ? 'تدقيق مالي' : 'تدقيق أداء', // Simplify
         controlUnitName: planItem.controlUnitName,
         status: 'assigned',
         date: new Date().toISOString().split('T')[0],
         scoreClassification: 'N/A',
         reviewerId: reviewer?.id || 0,
         reviewerName: reviewer?.name || '',
         resultData: {
             auditType: '',
             targetName: planItem.targetName,
             targetType: planItem.targetType,
             controlUnitName: planItem.controlUnitName,
             overallSummary: '',
             stages: [],
             // PERSIST DATES FROM ALLOCATION POPUP
             startDate: dates?.start,
             endDate: dates?.end,
             evaluationPeriod: planItem.evaluationPeriod,
             auditTypeEnum: planItem.auditType
         }
     };
     setQcLogs([newLog, ...qcLogs]);
     
     logActivity('تخصيص وبدء المهمة', planItem.targetName, `تم تخصيص المراجع: ${reviewer?.name}. الفترة: من ${dates?.start} إلى ${dates?.end}`);
  };

  const handleContinueQC = (log: QCLogItem) => {
      let formType: 'mission' | 'team_leader' | 'team_member' | 'audit_program' = 'mission';
      if (log.targetType === 'TeamLeader') formType = 'team_leader';
      else if (log.targetType === 'TeamMember') formType = 'team_member';
      else if (log.targetType === 'AuditProgram') formType = 'audit_program';

      setEditingLogId(log.id); // Track the ID so we can replace/update it later
      setFormInitialData({
          // Use rawTargetName if available to avoid appending unit name repeatedly
          targetName: log.resultData.rawTargetName || log.resultData.targetName,
          controlUnitName: log.controlUnitName,
          // Map stored string back to Enum if possible, prefer stored enum
          auditType: log.resultData.auditTypeEnum || Object.values(AuditType).find(t => log.resultData.auditType.includes(t)) || AuditType.FINANCIAL,
          
          evaluationPeriod: log.resultData.evaluationPeriod,
          startDate: log.resultData.startDate, // Pull persisted start date
          endDate: log.resultData.endDate,     // Pull persisted end date
          
          reviewerName: log.reviewerName,
          summary: log.resultData.overallSummary,
          stages: log.resultData.stages
      });
      setActiveFormType(formType);
      setCurrentView('perform_audit');
  };

  const handleSubmitAudit = (data: AuditAnalysisResult) => {
      const newLog: QCLogItem = {
          id: Date.now().toString(),
          reportNumber: editingLogId ? (qcLogs.find(l => l.id === editingLogId)?.reportNumber || `QC-${new Date().getFullYear()}-${qcLogs.length + 101}`) : `QC-${new Date().getFullYear()}-${qcLogs.length + 101}`,
          missionName: data.targetName || 'مهمة',
          targetType: data.targetType || 'Mission',
          auditType: data.auditType.split(' ')[0], 
          controlUnitName: data.controlUnitName,
          status: currentUser?.role === 'عضو ضمان جودة' ? 'pending_head' : 'completed',
          date: new Date().toISOString().split('T')[0],
          scoreClassification: 'تم التقييم', 
          reviewerId: currentUser?.id || 0,
          reviewerName: currentUser?.name || '',
          resultData: data,
          approvalHistory: [
              { date: new Date().toISOString().split('T')[0], user: currentUser?.name || '', role: currentUser?.role || '', action: 'submit' }
          ]
      };
      
      if (editingLogId) {
          // If we were editing a draft/returned item, replace it (or mark old as deleted and add new)
          // Here we filter out the old one and add the new one to the top
          const filteredLogs = qcLogs.filter(l => l.id !== editingLogId);
          setQcLogs([newLog, ...filteredLogs]);
          setEditingLogId(null);
      } else {
          setQcLogs([newLog, ...qcLogs]); // Prepend
      }
      
      logActivity('إرسال تقرير', data.targetName || 'تقرير', 'تم إرسال التقرير للمراجعة/الاعتماد');
      setActiveFormType(null);
      setFormInitialData(null);
      setCurrentView('qc_log');
  };

  const handleSaveDraft = (data: AuditAnalysisResult) => {
      const newLog: QCLogItem = {
          id: editingLogId || Date.now().toString(), // Keep ID if editing
          reportNumber: editingLogId ? (qcLogs.find(l => l.id === editingLogId)?.reportNumber || `DRAFT-${Date.now()}`) : `DRAFT-${Date.now()}`,
          missionName: data.targetName || 'مسودة',
          targetType: data.targetType || 'Mission',
          auditType: 'مسودة',
          controlUnitName: data.controlUnitName,
          status: 'draft',
          date: new Date().toISOString().split('T')[0],
          scoreClassification: 'مسودة',
          reviewerId: currentUser?.id || 0,
          reviewerName: currentUser?.name || '',
          resultData: data
      };

      if (editingLogId) {
          const filteredLogs = qcLogs.filter(l => l.id !== editingLogId);
          setQcLogs([newLog, ...filteredLogs]);
      } else {
          setQcLogs([newLog, ...qcLogs]);
      }
      
      logActivity('حفظ مسودة', data.targetName || 'مسودة');
      alert('تم حفظ المسودة بنجاح');
      setActiveFormType(null);
      setEditingLogId(null);
      setCurrentView('qc_log');
  };
  
  const handleViewResult = (result: AuditAnalysisResult, findingsOnly: boolean = false) => {
      setSelectedResult(result);
      setForceFindingsOnly(findingsOnly);
      setCurrentView('view_result');
  };

  const handleSendFindingsToUnit = () => {
      if (!selectedResult) return;
      const currentLog = qcLogs.find(l => l.resultData === selectedResult);
      if (!currentLog) return;

      const newFindings: FollowUpItem[] = [];
      
      selectedResult.stages.forEach(stage => {
          stage.criteriaResults.forEach(criterion => {
              // ONLY send findings that are NON_CONFORMANCE or IMPROVEMENT_OPPORTUNITY
              if (criterion.status === ComplianceStatus.NON_CONFORMANCE || criterion.status === ComplianceStatus.IMPROVEMENT_OPPORTUNITY) {
                  
                  // 1. Determine Target Units (Parse comma-separated string)
                  let targetUnits: string[] = [];
                  
                  if (criterion.responsibleUnits && criterion.responsibleUnits.trim().length > 0) {
                      targetUnits = criterion.responsibleUnits.split(',').map(u => u.trim()).filter(u => u.length > 0);
                  } 
                  
                  // If no specific units listed in the criteria, fall back to the main mission unit
                  if (targetUnits.length === 0 && currentLog.controlUnitName) {
                      targetUnits.push(currentLog.controlUnitName);
                  }

                  // 2. Create FollowUpItem for EACH target unit
                  targetUnits.forEach(unitName => {
                      // Check if already sent to THIS specific unit
                      const exists = followUpItems.some(item => 
                          item.reportId === currentLog.id && 
                          item.findingText === criterion.text &&
                          item.controlUnitName === unitName 
                      );

                      if (!exists) {
                          newFindings.push({
                              id: Date.now() + Math.random().toString(),
                              reportId: currentLog.id,
                              reportNumber: currentLog.reportNumber,
                              missionName: currentLog.missionName, 
                              controlUnitName: unitName, // Assign to specific unit
                              findingType: criterion.status === ComplianceStatus.NON_CONFORMANCE ? 'NON_CONFORMANCE' : 'IMPROVEMENT_OPPORTUNITY',
                              findingText: criterion.text,
                              recommendation: criterion.recommendation,
                              status: 'Open',
                              sentDate: new Date().toISOString().split('T')[0]
                          });
                      }
                  });
              }
          });
      });

      if (newFindings.length > 0) {
          setFollowUpItems([...followUpItems, ...newFindings]);
          const uniqueUnits = Array.from(new Set(newFindings.map(f => f.controlUnitName))).join('، ');
          logActivity('إرسال ملاحظات', currentLog.reportNumber, `تم إرسال ${newFindings.length} ملاحظة إلى ${uniqueUnits}`);
          
          // Navigate to Follow-up Registry after successful send
          setCurrentView('follow_up');
      } else {
          alert('جميع الحالات في هذا التقرير تم إرسالها مسبقاً أو لا توجد حالات تستدعي الإرسال.');
      }
  };

  // --- Deletion & Restore Handlers with Logging ---
  const softDeleteLog = (id: string, reason: string) => {
      const log = qcLogs.find(l => l.id === id);
      setQcLogs(prev => prev.map(item => item.id === id ? {...item, isDeleted: true, deletionReason: reason} : item));
      logActivity('حذف تقرير', log?.reportNumber || id, `السبب: ${reason}`);
  };
  
  const softDeletePlan = (id: number) => {
      // For now PlanItem deletion doesn't strictly require reason input in UI but could be added similarly
      const plan = plans.find(p => p.id === id);
      setPlans(prev => prev.map(item => item.id === id ? {...item, isDeleted: true} : item));
      logActivity('حذف بند خطة', plan?.targetName || id.toString(), 'نقل إلى سلة المهملات');
  };

  const softDeleteUser = (id: number) => {
      const user = users.find(u => u.id === id);
      setUsers(prev => prev.map(item => item.id === id ? {...item, isDeleted: true} : item));
      logActivity('حذف مستخدم', user?.name || id.toString(), 'نقل إلى سلة المهملات');
  };

  const softDeleteFollowUp = (id: string) => {
      const item = followUpItems.find(f => f.id === id);
      setFollowUpItems(prev => prev.map(item => item.id === id ? {...item, isDeleted: true} : item));
      logActivity('حذف متابعة', item?.findingText.substring(0, 30) + '...', 'نقل إلى سلة المهملات');
  };

  const restoreLog = (id: string) => {
      setQcLogs(prev => prev.map(item => item.id === id ? {...item, isDeleted: false, deletionReason: undefined} : item));
      logActivity('استعادة تقرير', id, 'استعادة من سلة المهملات');
  };

  const restorePlan = (id: number) => {
      setPlans(prev => prev.map(item => item.id === id ? {...item, isDeleted: false} : item));
      logActivity('استعادة بند خطة', id.toString(), 'استعادة من سلة المهملات');
  };

  const restoreUser = (id: number) => {
      setUsers(prev => prev.map(item => item.id === id ? {...item, isDeleted: false} : item));
      logActivity('استعادة مستخدم', id.toString(), 'استعادة من سلة المهملات');
  };

  const restoreFollowUp = (id: string) => {
      setFollowUpItems(prev => prev.map(item => item.id === id ? {...item, isDeleted: false} : item));
      logActivity('استعادة متابعة', id, 'استعادة من سلة المهملات');
  };

  const permanentDeleteLog = (id: string) => {
      setQcLogs(prev => prev.filter(item => item.id !== id));
      logActivity('حذف نهائي للتقرير', id);
  };

  const permanentDeletePlan = (id: number) => {
      setPlans(prev => prev.filter(item => item.id !== id));
      logActivity('حذف نهائي لبند خطة', id.toString());
  };

  const permanentDeleteUser = (id: number) => {
      setUsers(prev => prev.filter(item => item.id !== id));
      logActivity('حذف نهائي لمستخدم', id.toString());
  };

  const permanentDeleteFollowUp = (id: string) => {
      setFollowUpItems(prev => prev.filter(item => item.id !== id));
      logActivity('حذف نهائي لمتابعة', id);
  };

  // Filtered Data for Views
  const activePlans = plans.filter(p => !p.isDeleted);
  const activeLogs = qcLogs.filter(l => !l.isDeleted);
  const activeUsers = users.filter(u => !u.isDeleted);
  const activeFollowUps = followUpItems.filter(f => !f.isDeleted);

  const deletedPlans = plans.filter(p => p.isDeleted);
  const deletedLogs = qcLogs.filter(l => l.isDeleted);
  const deletedUsers = users.filter(u => u.isDeleted);
  const deletedFollowUps = followUpItems.filter(f => f.isDeleted);

  // Render Content Switch
  const renderContent = () => {
      if (currentView === 'dashboard') return <DashboardView plans={activePlans} qcLogs={activeLogs} users={activeUsers} followUpItems={activeFollowUps} />;
      if (currentView === 'plan') return <PlanView 
          onStartQC={handleStartQC} 
          users={activeUsers} 
          plans={activePlans} 
          setPlans={setPlans} 
          annualPlansMeta={annualPlansMeta} 
          setAnnualPlansMeta={setAnnualPlansMeta} 
          onDeletePlan={softDeletePlan}
          logActivity={logActivity}
      />;
      if (currentView === 'qc_log') return <QCLogView logs={activeLogs} onView={(data) => handleViewResult(data, false)} onCreate={(type) => { setActiveFormType(type); setFormInitialData(null); setEditingLogId(null); setCurrentView('perform_audit'); }} onContinue={handleContinueQC} currentUser={currentUser!} onDeleteLog={softDeleteLog} />;
      if (currentView === 'follow_up') return <FollowUpLogView items={activeFollowUps} currentUser={currentUser!} onViewReport={(reportId) => {
          const log = activeLogs.find(l => l.id === reportId);
          // Set forceFindingsOnly to true when opening from follow up log
          if(log) handleViewResult(log.resultData, true);
      }} onDelete={softDeleteFollowUp} />;
      if (currentView === 'users') return <UserManagementView 
          users={activeUsers} 
          setUsers={setUsers} 
          roles={roles} 
          logActivity={logActivity} 
      />;
      if (currentView === 'recycle_bin') return <RecycleBinView 
          deletedPlans={deletedPlans} deletedLogs={deletedLogs} deletedUsers={deletedUsers} deletedFollowUps={deletedFollowUps}
          onRestorePlan={restorePlan} onPermanentDeletePlan={permanentDeletePlan}
          onRestoreLog={restoreLog} onPermanentDeleteLog={permanentDeleteLog}
          onRestoreUser={restoreUser} onPermanentDeleteUser={permanentDeleteUser}
          onRestoreFollowUp={restoreFollowUp} onPermanentDeleteFollowUp={permanentDeleteFollowUp}
      />;
      if (currentView === 'settings') return <SettingsView 
          missionConfig={missionConfig} setMissionConfig={setMissionConfig}
          leaderConfig={leaderConfig} setLeaderConfig={setLeaderConfig}
          /* Fix: Pass the setter function instead of the value */
          memberConfig={memberConfig} setMemberConfig={setMemberConfig}
          programConfig={programConfig} setProgramConfig={setProgramConfig}
          plans={plans} setPlans={setPlans}
          qcLogs={qcLogs} setQcLogs={setQcLogs}
          users={users} setUsers={setUsers}
          annualPlansMeta={annualPlansMeta} setAnnualPlansMeta={setAnnualPlansMeta}
          roles={roles} setRoles={setRoles}
          activityLogs={activityLogs} // Pass Activity Logs
          logActivity={logActivity} // Pass Logger
      />;
      
      if (currentView === 'perform_audit') {
          if (activeFormType === 'mission') return <AuditForm 
              onSubmit={handleSubmitAudit} 
              onSaveDraft={handleSaveDraft} 
              config={missionConfig} 
              reviewers={activeUsers.filter(u => u.permissions.performReview)} 
              currentUser={currentUser!}
              initialTargetName={formInitialData?.targetName}
              initialControlUnitName={formInitialData?.controlUnitName}
              initialAuditType={formInitialData?.auditType}
              initialEvaluationPeriod={formInitialData?.evaluationPeriod}
              initialStartDate={formInitialData?.startDate}
              initialEndDate={formInitialData?.endDate}
              initialReviewerName={formInitialData?.reviewerName}
              initialSummary={formInitialData?.summary} // Pass summary
              initialStages={formInitialData?.stages} // Pass stages for continuing work
              availableUnits={activeUsers.filter(u => u.role === 'وحدة رقابية')}
          />;
          if (activeFormType === 'team_leader') return <TeamLeaderForm 
              onSubmit={handleSubmitAudit} 
              onSaveDraft={handleSaveDraft} 
              config={leaderConfig} 
              reviewers={activeUsers.filter(u => u.permissions.performReview)} 
              currentUser={currentUser!}
              initialLeaderName={formInitialData?.targetName}
              initialEvaluationPeriod={formInitialData?.evaluationPeriod}
              initialStartDate={formInitialData?.startDate}
              initialEndDate={formInitialData?.endDate}
              initialReviewerName={formInitialData?.reviewerName}
              initialStages={formInitialData?.stages}
              availableUnits={activeUsers.filter(u => u.role === 'وحدة رقابية')}
          />;
          if (activeFormType === 'team_member') return <TeamMemberForm 
              onSubmit={handleSubmitAudit} 
              onSaveDraft={handleSaveDraft} 
              config={memberConfig} 
              reviewers={activeUsers.filter(u => u.permissions.performReview)} 
              currentUser={currentUser!}
              initialMemberName={formInitialData?.targetName}
              initialEvaluationPeriod={formInitialData?.evaluationPeriod}
              initialStartDate={formInitialData?.startDate}
              initialEndDate={formInitialData?.endDate}
              initialReviewerName={formInitialData?.reviewerName}
              initialStages={formInitialData?.stages}
              availableUnits={activeUsers.filter(u => u.role === 'وحدة رقابية')}
          />;
          if (activeFormType === 'audit_program') return <AuditProgramForm 
              onSubmit={handleSubmitAudit} 
              onSaveDraft={handleSaveDraft} 
              config={programConfig} 
              reviewers={activeUsers.filter(u => u.permissions.performReview)} 
              currentUser={currentUser!}
              initialProgramName={formInitialData?.targetName}
              initialEvaluationPeriod={formInitialData?.evaluationPeriod}
              initialStartDate={formInitialData?.startDate}
              initialEndDate={formInitialData?.endDate}
              initialReviewerName={formInitialData?.reviewerName}
              initialStages={formInitialData?.stages}
              availableUnits={activeUsers.filter(u => u.role === 'وحدة رقابية')}
          />;
      }

      if (currentView === 'view_result' && selectedResult) return <ResultsView 
          result={selectedResult} 
          onReset={() => { setForceFindingsOnly(false); setCurrentView('qc_log'); }} 
          currentUser={currentUser!}
          status={activeLogs.find(l => l.resultData === selectedResult)?.status}
          onSendFindings={handleSendFindingsToUnit}
          followUpItems={activeFollowUps}
          initiallyShowFindingsOnly={forceFindingsOnly}
          onApprove={() => {
              const logIndex = qcLogs.findIndex(l => l.resultData === selectedResult);
              if (logIndex > -1) {
                  const newLogs = [...qcLogs];
                  const log = newLogs[logIndex];
                  
                  let newStatus: ReportStatus = log.status;
                  if (currentUser?.role.includes('رئيس قسم')) newStatus = 'pending_director';
                  if (currentUser?.permissions.approveReport) newStatus = 'completed';

                  // Immutable update
                  newLogs[logIndex] = {
                      ...log,
                      status: newStatus,
                      approvalHistory: [
                          ...(log.approvalHistory || []),
                          {
                              date: new Date().toISOString().split('T')[0],
                              user: currentUser?.name || '',
                              role: currentUser?.role || '',
                              action: 'approve'
                          }
                      ]
                  };
                  setQcLogs(newLogs);
                  logActivity('اعتماد تقرير', log.reportNumber, `تم تغيير الحالة إلى ${newStatus}`);
                  alert('تم الاعتماد بنجاح');
                  setCurrentView('qc_log');
              }
          }}
          onReturn={(note) => {
               const logIndex = qcLogs.findIndex(l => l.resultData === selectedResult);
              if (logIndex > -1) {
                  const newLogs = [...qcLogs];
                  const log = newLogs[logIndex];
                  
                  let newStatus: ReportStatus = log.status;
                  if (currentUser?.role.includes('رئيس قسم')) newStatus = 'returned';
                  if (currentUser?.permissions.approveReport) newStatus = 'returned_to_head';

                  // Immutable update
                  newLogs[logIndex] = {
                      ...log,
                      status: newStatus,
                      approvalHistory: [
                          ...(log.approvalHistory || []),
                          {
                              date: new Date().toISOString().split('T')[0],
                              user: currentUser?.name || '',
                              role: currentUser?.role || '',
                              action: 'return',
                              note: note
                          }
                      ]
                  };
                  setQcLogs(newLogs);
                  logActivity('إعادة تقرير', log.reportNumber, `تم إعادة التقرير مع ملاحظات`);
                  alert('تم إعادة التقرير بنجاح');
                  setCurrentView('qc_log');
              }
          }}
          approvalHistory={activeLogs.find(l => l.resultData === selectedResult)?.approvalHistory}
          onEdit={() => {
              const currentLog = activeLogs.find(l => l.resultData === selectedResult);
              if (currentLog && currentUser?.permissions.editReport) {
                  handleContinueQC(currentLog);
              } else {
                  alert("ليس لديك صلاحية تعديل هذا التقرير أو التقرير في حالة لا تسمح بالتعديل.");
              }
          }}
          onSaveEntityResponse={(updatedResult) => {
              const logIndex = qcLogs.findIndex(l => l.resultData === selectedResult);
              if (logIndex > -1) {
                  const newLogs = [...qcLogs];
                  const currentLog = newLogs[logIndex];
                  
                  // Logic to update UnitResponses statuses to 'submitted' AND add to history
                  const updatedStages = updatedResult.stages.map(stage => ({
                      ...stage,
                      criteriaResults: stage.criteriaResults.map(criterion => ({
                          ...criterion,
                          unitResponses: criterion.unitResponses?.map(response => {
                              if (response.unitName === currentUser?.name && response.status !== 'approved' && response.status !== 'submitted') {
                                  // Create history entry
                                  const newHistoryItem: ResponseInteraction = {
                                      id: Date.now().toString(),
                                      date: new Date().toISOString().split('T')[0],
                                      user: currentUser?.name || 'مستخدم',
                                      role: currentUser?.role || 'وحدة رقابية',
                                      action: 'submit',
                                      note: response.action,
                                      evidence: response.evidence,
                                      evidenceName: response.evidenceName
                                  };

                                  return { 
                                      ...response, 
                                      status: 'submitted' as const,
                                      history: [...(response.history || []), newHistoryItem]
                                  };
                              }
                              return response;
                          })
                      }))
                  }));

                  const finalResult = { ...updatedResult, stages: updatedStages };

                  // Immutable update of the log with new result data and history
                  newLogs[logIndex] = {
                      ...currentLog,
                      resultData: finalResult,
                      approvalHistory: [
                          ...(currentLog.approvalHistory || []),
                          {
                              date: new Date().toISOString().split('T')[0],
                              user: currentUser?.name || '',
                              role: currentUser?.role || '',
                              action: 'submit', 
                              note: 'تم إرسال ردود الجهة للمراجعة'
                          }
                      ]
                  };
                  setQcLogs(newLogs);
                  setSelectedResult(finalResult);
                  logActivity('إرسال رد وحدة', currentLog.reportNumber, 'تم إرسال الردود للمراجعة');
                  alert('تم إرسال الردود للمراجعة بنجاح.');
              }
          }}
          onReviewUnitResponse={(stageIndex, criterionIndex, unitName, action, note) => {
              const logIndex = qcLogs.findIndex(l => l.resultData === selectedResult);
              if (logIndex > -1) {
                  const newLogs = [...qcLogs];
                  const currentLog = newLogs[logIndex];
                  
                  // Clone structure down to the specific unit response
                  const newStages = [...currentLog.resultData.stages];
                  const criterion = newStages[stageIndex].criteriaResults[criterionIndex];
                  
                  if (!criterion.unitResponses) return;
                  
                  const responseIndex = criterion.unitResponses.findIndex(r => r.unitName === unitName);
                  if (responseIndex === -1) return;

                  const newResponses = [...criterion.unitResponses];
                  const currentResponse = newResponses[responseIndex];

                  // Create history entry for reviewer action
                  const newHistoryItem: ResponseInteraction = {
                      id: Date.now().toString(),
                      date: new Date().toISOString().split('T')[0],
                      user: currentUser?.name || 'مراجع',
                      role: currentUser?.role || 'جودة',
                      action: action,
                      note: note || ''
                  };

                  // Update Status based on action
                  const newStatus = action === 'approve' ? 'approved' : 'returned';
                  
                  newResponses[responseIndex] = {
                      ...currentResponse,
                      status: newStatus as any,
                      // Fixed: Removed reviewerNote as it does not exist on UnitResponse type
                      history: [...(currentResponse.history || []), newHistoryItem]
                  };

                  criterion.unitResponses = newResponses;
                  
                  // Update log
                  newLogs[logIndex] = {
                      ...currentLog,
                      resultData: {
                          ...currentLog.resultData,
                          stages: newStages
                      }
                  };
                  setQcLogs(newLogs);
                  setSelectedResult(newLogs[logIndex].resultData);
                  logActivity('مراجعة رد وحدة', currentLog.reportNumber, `تم ${action === 'approve' ? 'اعتماد' : 'إعادة'} الرد للوحدة ${unitName}`);

                  // Update Follow Up Items Status Logic
                  if (action === 'approve') {
                      // Only mark FollowUpItem as 'Resolved' if ALL unit responses for this finding are 'approved'
                      // or simply resolve specific to this unit.
                      // Logic: Find FollowUpItem for this report + finding + unit
                      const updatedFollowUps = followUpItems.map(item => {
                          if (item.reportId === currentLog.id && 
                              item.findingText === criterion.text &&
                              item.controlUnitName === unitName) {
                               return { ...item, status: 'Resolved' as const };
                          }
                          return item;
                      });
                      setFollowUpItems(updatedFollowUps);
                  } else if (action === 'return') {
                      // Ensure it's Open
                       const updatedFollowUps = followUpItems.map(item => {
                          if (item.reportId === currentLog.id && 
                              item.findingText === criterion.text &&
                              item.controlUnitName === unitName) {
                               return { ...item, status: 'Open' as const };
                          }
                          return item;
                      });
                      setFollowUpItems(updatedFollowUps);
                  }
              }
          }}
      />;

      return <DashboardView plans={activePlans} qcLogs={activeLogs} users={activeUsers} followUpItems={activeFollowUps} />;
  };

  if (!currentUser) {
      return <LoginView users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans">
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          activeItem={currentView} 
          onNavigate={setCurrentView}
          currentUser={currentUser}
          onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center lg:hidden z-30">
             <div className="flex items-center gap-2">
                 <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                 <span className="font-bold text-slate-800">نظام تقييم جودة العمليات الرقابية</span>
             </div>
             <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
                 <Bars3Icon className="w-6 h-6" />
             </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;