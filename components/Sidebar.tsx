
import React from 'react';
import { 
  CalendarDaysIcon, 
  ClipboardDocumentListIcon, 
  Cog6ToothIcon, 
  XMarkIcon, 
  ShieldCheckIcon, 
  UsersIcon, 
  ArrowLeftStartOnRectangleIcon,
  PresentationChartLineIcon, 
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onNavigate: (item: string) => void;
  currentUser?: User;
  users?: User[];
  onSwitchUser?: (user: User) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeItem, onNavigate, currentUser, onLogout }) => {
  
  // Determine menu visibility based on role
  const getMenuItems = () => {
    const items = [
      { 
        id: 'dashboard', 
        label: 'لوحة المؤشرات', 
        icon: PresentationChartLineIcon, 
        // Hide Dashboard for Control Units (Auditees)
        visible: currentUser?.role !== 'وحدة رقابية'
      },
      { 
        id: 'plan', 
        label: 'خطة المهام الرقابية', 
        icon: CalendarDaysIcon, 
        // Plan is visible to internal audit team (Admin, Head, Reviewer), not Control Units (Auditees)
        visible: currentUser?.role !== 'وحدة رقابية'
      },
      { 
        id: 'qc_log', 
        label: 'سجل مهام مراجعة الجودة', 
        icon: ClipboardDocumentListIcon, 
        visible: true 
      },
      // Follow Up Log - Visible to all now (For internal tracking and external response)
      { 
        id: 'follow_up', 
        label: 'سجل المتابعة', 
        icon: ClipboardDocumentCheckIcon, 
        visible: true
      },
      { 
        id: 'users', 
        label: 'إدارة المستخدمين', 
        icon: UsersIcon, 
        // Only Admin
        visible: currentUser?.role === 'مدير النظام'
      },
      { 
        id: 'settings', 
        label: 'الإعدادات', 
        icon: Cog6ToothIcon, 
        // Only Admin
        visible: currentUser?.role === 'مدير النظام'
      },
      { 
        id: 'recycle_bin', 
        label: 'سلة المهملات', 
        icon: TrashIcon, 
        // Visible to Admin for management
        visible: currentUser?.role === 'مدير النظام'
      },
    ];
    return items.filter(item => item.visible);
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-blue-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen shadow-xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Logo / Header */}
        <div className="p-6 border-b border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">نظام تقييم جودة العمليات الرقابية</h1>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-blue-300 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* User Profile Display */}
        {currentUser && (
            <div className="px-5 py-6 border-b border-blue-800 bg-blue-800/20">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-full border border-blue-600 flex-shrink-0">
                        <UserCircleIcon className="w-8 h-8 text-blue-100" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate" title={currentUser.name}>{currentUser.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${currentUser.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className="text-xs text-blue-200 font-medium truncate">{currentUser.role}</span>
                        </div>
                        <span className="text-[10px] text-blue-300 truncate mt-0.5 font-mono">{currentUser.username}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 sidebar-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-blue-300 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-bold text-sm truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        {onLogout && (
            <div className="px-3 pb-2">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-300 hover:bg-red-900/20 hover:text-red-200 border border-transparent hover:border-red-900/30"
                >
                    <ArrowLeftStartOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-bold text-sm truncate">تسجيل الخروج</span>
                </button>
            </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-blue-800 text-[10px] text-blue-400 text-center leading-relaxed">
          دائرة الجودة والتميز المؤسسي
        </div>
      </div>
    </>
  );
};
