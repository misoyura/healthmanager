import React from 'react';
import {
  LayoutDashboard,
  Stethoscope,
  Pill,
  ReceiptText,
  Activity,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'visits' | 'meds' | 'finance' | 'vitals' | 'ai' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  seniorMode: boolean;
  activeMedicationCount?: number;
  unclaimedReceiptCount?: number;
  upcomingAppointmentCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  seniorMode,
  activeMedicationCount = 0,
  unclaimedReceiptCount = 0,
  upcomingAppointmentCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: '종합 현황',
      icon: <LayoutDashboard className={seniorMode ? 'w-6 h-6' : 'w-4 h-4'} />,
      badge: upcomingAppointmentCount > 0 ? upcomingAppointmentCount : undefined,
    },
    {
      id: 'visits',
      label: '진료·질병',
      icon: <Stethoscope className={seniorMode ? 'w-6 h-6' : 'w-4 h-4'} />,
    },
    {
      id: 'meds',
      label: '처방·복약',
      icon: <Pill className={seniorMode ? 'w-6 h-6' : 'w-4 h-4'} />,
      badge: activeMedicationCount > 0 ? activeMedicationCount : undefined,
    },
    {
      id: 'finance',
      label: '영수증·실손보험',
      icon: <ReceiptText className={seniorMode ? 'w-6 h-6' : 'w-4 h-4'} />,
      badge: unclaimedReceiptCount > 0 ? unclaimedReceiptCount : undefined,
    },
    {
      id: 'vitals',
      label: '건강측정·검진',
      icon: <Activity className={seniorMode ? 'w-6 h-6' : 'w-4 h-4'} />,
    },
    {
      id: 'ai',
      label: 'AI 건강 리포트',
      icon: <Sparkles className={seniorMode ? 'w-6 h-6 text-teal-600' : 'w-4 h-4 text-teal-600'} />,
    },
    {
      id: 'profile',
      label: '프로필·가족',
      icon: <UserCheck className={seniorMode ? 'w-6 h-6' : 'w-4 h-4'} />,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all ${
                  seniorMode
                    ? 'py-3 px-4 text-base sm:text-lg min-h-[52px]'
                    : 'py-2 px-3 text-xs sm:text-sm min-h-[40px]'
                } ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-teal-800' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
