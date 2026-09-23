import React, { useState } from 'react';
import {
  User,
  Heart,
  Volume2,
  VolumeX,
  Type,
  Plus,
  Users,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { User as UserType } from '../types/health';

interface HeaderProps {
  currentUser: UserType;
  users: UserType[];
  onSelectUser: (userId: string) => void;
  onAddUser: () => void;
  seniorMode: boolean;
  onToggleSeniorMode: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
  onOpenSymptomConsult: () => void;
  onOpenOcr: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  onAddUser,
  seniorMode,
  onToggleSeniorMode,
  isSpeaking,
  onStopSpeaking,
  onExportData,
  onImportData,
  onResetData,
  onOpenSymptomConsult,
  onOpenOcr,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-extrabold tracking-tight text-slate-900 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                  AI 건강·의료 통합관리
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-teal-800 bg-teal-50 rounded-md border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  개인건강 안심보호
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                병원·약국·처방·영수증·실손보험 원스톱 관리 시스템
              </p>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Speaking status indicator */}
            {isSpeaking && (
              <button
                onClick={onStopSpeaking}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs sm:text-sm font-semibold animate-pulse hover:bg-rose-100 transition-colors"
                title="음성 읽어주기 중지"
              >
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">읽기 중지</span>
              </button>
            )}

            {/* Quick AI Tools Button */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={onOpenOcr}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-teal-600" />
                <span>영수증·처방전 스캔</span>
              </button>
              <button
                onClick={onOpenSymptomConsult}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI 증상상담</span>
              </button>
            </div>

            {/* Senior Mode Toggle Button */}
            <button
              onClick={onToggleSeniorMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg font-bold transition-all border ${
                seniorMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 text-sm sm:text-base'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 text-xs sm:text-sm'
              }`}
              title="글씨를 크게 키우고 어르신이 편안하게 볼 수 있는 화면으로 변경합니다"
            >
              <Type className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{seniorMode ? '큰글씨 모드 ON' : '큰글씨 모드'}</span>
            </button>

            {/* Family Member Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white border border-slate-200 hover:border-teal-500 rounded-lg shadow-sm text-xs sm:text-sm font-semibold text-slate-800 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{currentUser.familyRole}</div>
                </div>
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Family Dropdown */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-400">가족 구성원 전환</p>
                      <p className="text-xs text-slate-600">관리할 가족을 선택하세요</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {users.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            u.id === currentUser.id ? 'bg-teal-50/70 text-teal-900 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                              {u.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="text-sm">{u.name}</div>
                              <div className="text-xs text-slate-400 font-normal">
                                {u.familyRole} · {u.gender} · {u.birthDate.slice(0, 4)}년생
                              </div>
                            </div>
                          </div>
                          {u.id === currentUser.id && (
                            <span className="text-xs text-teal-600 font-semibold">선택됨</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onAddUser();
                        }}
                        className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>가족 구성원 추가</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings & Backup Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="데이터 관리 및 설정"
              >
                <Download className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20">
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onExportData();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>데이터 백업 (JSON)</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onImportData();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>데이터 복원 (JSON)</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onResetData();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-500" />
                      <span>초기 데이터로 초기화</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
