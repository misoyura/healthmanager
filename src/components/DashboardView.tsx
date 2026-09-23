import React from 'react';
import {
  Stethoscope,
  Calendar,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Volume2,
  Sparkles,
  Receipt,
  Building2,
  Activity,
  Plus,
} from 'lucide-react';
import {
  UnifiedMedicalRecord,
  MedicationReminder,
  Appointment,
  AIHealthAnalysis,
  User,
} from '../types/health';
import { AIService } from '../services/aiService';

interface DashboardViewProps {
  currentUser: User;
  records: UnifiedMedicalRecord[];
  reminders: MedicationReminder[];
  appointments: Appointment[];
  latestAIReport?: AIHealthAnalysis;
  seniorMode: boolean;
  onSelectRecord: (record: UnifiedMedicalRecord) => void;
  onToggleReminder: (reminderId: string, current: boolean) => void;
  onOpenClaimWizard: (record?: UnifiedMedicalRecord) => void;
  onOpenOcr: () => void;
  onOpenSymptomConsult: () => void;
  onOpenAddRecord: (type: 'visit' | 'vital' | 'symptom' | 'appointment') => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  records,
  reminders,
  appointments,
  latestAIReport,
  seniorMode,
  onSelectRecord,
  onToggleReminder,
  onOpenClaimWizard,
  onOpenOcr,
  onOpenSymptomConsult,
  onOpenAddRecord,
  onNavigateTab,
}) => {
  // Aggregate stats
  const totalVisits = records.length;
  const totalCopaySpent = records.reduce((sum, r) => {
    return sum + (r.hospitalReceipt?.patientCopay || r.visit.costCopay || 0) + (r.pharmacyReceipt?.patientCopay || 0);
  }, 0);

  const totalReimbursed = records.reduce((sum, r) => {
    return sum + (r.insuranceClaim?.paidAmount || 0);
  }, 0);

  const pendingClaims = records.filter(r => r.insuranceClaim && r.insuranceClaim.status !== '지급완료').length;
  const unclaimedVisits = records.filter(r => !r.insuranceClaim && ((r.hospitalReceipt?.patientCopay || r.visit.costCopay) > 0)).length;

  const todayRemindersTaken = reminders.filter(r => r.isTakenToday).length;
  const nextAppointment = appointments
    .filter(a => a.status === '예약확정' && new Date(a.date) >= new Date(new Date().toISOString().split('T')[0]))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome & Senior Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
              {currentUser.familyRole} 맞춤 케어
            </span>
            <span className="text-xs text-teal-200">
              오늘도 건강하고 평안한 하루 되세요
            </span>
          </div>
          <h2 className={`font-black tracking-tight ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {currentUser.name} 님의 건강·의료 종합 브리핑
          </h2>
          <p className={`text-teal-100/90 font-medium ${seniorMode ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`}>
            병원 진료, 처방약, 영수증, 실손보험 청구까지 한곳에서 안전하고 쉽게 관리하세요.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenOcr}
              className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-teal-600" />
              <span>영수증·처방전 사진 분석</span>
            </button>
            <button
              onClick={onOpenSymptomConsult}
              className="px-4 py-2 bg-teal-600/80 hover:bg-teal-600 text-white rounded-xl font-bold text-xs sm:text-sm border border-teal-500/50 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>AI 증상 상담</span>
            </button>
            <button
              onClick={() => onOpenAddRecord('visit')}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>진료 직접 기록</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Core Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Medical Expenses */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">총 본인부담 의료비</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className={`font-black text-slate-900 ${seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
            {totalCopaySpent.toLocaleString()}원
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            진료 {totalVisits}건 누적 본인부담
          </p>
        </div>

        {/* 2. Insurance Reimbursement */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">실손보험 환급액</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className={`font-black text-emerald-600 ${seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
            {totalReimbursed.toLocaleString()}원
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {pendingClaims > 0 ? `${pendingClaims}건 심사진행중` : '지급 완료'}
          </p>
        </div>

        {/* 3. Today's Medication */}
        <div
          onClick={() => onNavigateTab('meds')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">오늘의 복약</span>
            <Pill className="w-4 h-4 text-amber-500" />
          </div>
          <p className={`font-black text-slate-900 ${seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
            {todayRemindersTaken} / {reminders.length} 회 완료
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            {reminders.length - todayRemindersTaken > 0
              ? `${reminders.length - todayRemindersTaken}개 약 복용 필요`
              : '오늘 복약 완료!'}
          </p>
        </div>

        {/* 4. Next Appointment */}
        <div
          onClick={() => onNavigateTab('visits')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-500">다음 병원 외래</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          {nextAppointment ? (
            <>
              <p className={`font-black text-indigo-700 truncate ${seniorMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                {nextAppointment.date.slice(5)} {nextAppointment.time}
              </p>
              <p className="text-[11px] text-slate-500 truncate mt-1">
                {nextAppointment.hospital} ({nextAppointment.department})
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-slate-400 text-sm mt-1">예약 없음</p>
              <p className="text-[11px] text-slate-400">정기 검진 일정 확인</p>
            </>
          )}
        </div>
      </div>

      {/* AI Health Alert & Advice Banner */}
      {latestAIReport && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-white rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                  AI 건강 주치의 분석 요약 (상태: {latestAIReport.statusLevel})
                </h3>
                <span className="text-xs px-2 py-0.5 bg-teal-600 text-white rounded font-bold">
                  {latestAIReport.statusScore}점
                </span>
              </div>
              <p className={`text-slate-700 mt-1 leading-relaxed ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
                {latestAIReport.overallSummary}
              </p>
              <p className="text-xs text-teal-800 font-semibold mt-1">
                💡 {latestAIReport.seniorFriendlyTip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => {
                AIService.speakText(`${latestAIReport.overallSummary} 오늘의 건강 조언입니다. ${latestAIReport.seniorFriendlyTip}`);
              }}
              className="px-3 py-2 bg-white text-teal-800 border border-teal-200 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
              title="리포트 음성으로 듣기"
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>듣기</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai')}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
            >
              전체 리포트 보기
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Today's Medication & One-Stop Medical Journey Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Unified Medical History Journey */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
                통합 의료 여정 (진료 · 처방 · 영수증 · 실손청구)
              </h3>
              <p className="text-xs text-slate-500">
                「언제 어느 병원에서 어떤 질병으로 진료받고, 얼마를 지불해 보험금을 받았는지」 한눈에 확인
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('visits')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>전체보기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Unified Journey Cards */}
          <div className="space-y-3">
            {records.map(r => {
              const totalVisitCopay = (r.hospitalReceipt?.patientCopay || r.visit.costCopay || 0) + (r.pharmacyReceipt?.patientCopay || 0);
              return (
                <div
                  key={r.visit.id}
                  onClick={() => onSelectRecord(r)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  {/* Row 1: Hospital, Date, Disease */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`font-extrabold text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                            {r.visit.hospitalName}
                          </h4>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                            {r.visit.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          진료일: {r.visit.visitDate} · 담당: {r.visit.doctor}
                        </p>
                      </div>
                    </div>

                    {/* Claim Status Badge */}
                    <div>
                      {r.insuranceClaim ? (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                          r.insuranceClaim.status === '지급완료'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          실손 {r.insuranceClaim.status}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenClaimWizard(r);
                          }}
                          className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors"
                        >
                          실손 청구하기
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Diagnosis & Details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">진단 질병:</span>
                      <span className="font-bold text-teal-800">
                        {r.disease ? `${r.disease.name} (${r.disease.code})` : '정기 외래 경과관찰'}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">
                      <strong className="text-slate-700">진료 소견:</strong> {r.visit.details}
                    </p>
                  </div>

                  {/* Row 3: Prescribed Medications pills */}
                  {r.medications && r.medications.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-amber-600" />
                        처방약:
                      </span>
                      {r.medications.map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/70 rounded-md font-medium text-[11px]">
                          {m.name} ({m.dosagePerTake}, {m.dailyFrequency}회/일)
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Row 4: Financial Summary Bar (Cost vs Reimbursed) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">총 본인부담금</span>
                        <span className="font-bold text-rose-600 text-sm">
                          {totalVisitCopay.toLocaleString()}원
                        </span>
                      </div>
                      {r.insuranceClaim && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">실손보험 지급액</span>
                          <span className="font-bold text-emerald-600 text-sm">
                            +{r.insuranceClaim.paidAmount.toLocaleString()}원
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-teal-700 font-bold flex items-center gap-0.5">
                      <span>상세 리포트</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Today's Medication & Upcoming Appointments */}
        <div className="space-y-6">
          {/* Today's Medication Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-amber-600" />
                <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                  오늘의 복약 알림
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {todayRemindersTaken}/{reminders.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {reminders.map(rem => (
                <div
                  key={rem.id}
                  onClick={() => onToggleReminder(rem.id, !rem.isTakenToday)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    rem.isTakenToday
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        rem.isTakenToday ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                      }`}
                    >
                      {rem.isTakenToday && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-bold ${seniorMode ? 'text-base' : 'text-xs sm:text-sm'}`}>
                        {rem.medName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {rem.timeSlot} ({rem.reminderTime}) · {rem.frequency}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    rem.isTakenToday ? 'bg-emerald-200/60 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rem.isTakenToday ? '복용 완료' : '복용 하기'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('meds')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              처방전 및 복약 상세 관리
            </button>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                  예정된 외래 진료
                </h3>
              </div>
              <button
                onClick={() => onOpenAddRecord('appointment')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>예약 추가</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {appointments.slice(0, 3).map(apt => (
                <div key={apt.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">{apt.hospital}</span>
                    <span className="font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                      {apt.department}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    📅 {apt.date} {apt.time} · {apt.doctor}
                  </p>
                  {apt.examReservation && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-100 font-medium">
                      ⚠️ {apt.examReservation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
