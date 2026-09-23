import React, { useState } from 'react';
import {
  Pill,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileText,
  Volume2,
  Plus,
} from 'lucide-react';
import {
  Prescription,
  Medication,
  Pharmacy,
  MedicationReminder,
  User,
} from '../types/health';
import { AIService, MedicationGuideResponse } from '../services/aiService';

interface MedicationsViewProps {
  currentUser: User;
  prescriptions: Prescription[];
  medications: Medication[];
  pharmacies: Pharmacy[];
  reminders: MedicationReminder[];
  seniorMode: boolean;
  onToggleReminder: (reminderId: string, current: boolean) => void;
  onOpenOcr: () => void;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  currentUser,
  prescriptions,
  medications,
  pharmacies,
  reminders,
  seniorMode,
  onToggleReminder,
  onOpenOcr,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'meds' | 'reminders' | 'rx' | 'pharmacies'>('meds');
  const [aiGuide, setAiGuide] = useState<MedicationGuideResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleCheckInteractions = async () => {
    setLoadingAi(true);
    try {
      const medNames = medications.map(m => m.name);
      const res = await AIService.getMedicationGuide({
        medNames,
        userConditions: ['고혈압', '관절염'],
      });
      setAiGuide(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
            처방전 및 복약 관리
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentUser.name} 님이 드시는 약품의 복용 시간, 용법, 주의사항 및 약국 조제 내역입니다
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckInteractions}
            disabled={loadingAi}
            className="px-4 py-2.5 bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{loadingAi ? 'AI 복약 분석중...' : 'AI 약물 상호작용 점검'}</span>
          </button>
          <button
            onClick={onOpenOcr}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>처방전 사진 등록</span>
          </button>
        </div>
      </div>

      {/* AI Medication Guide Output Banner */}
      {aiGuide && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-amber-950 text-base sm:text-lg">
                AI 복약 지도 & 주의사항
              </h3>
            </div>
            <button
              onClick={() => AIService.speakText(aiGuide.summary + ' ' + aiGuide.interactionWarnings.join(' '))}
              className="px-3 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-100"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
              <span>소리내어 듣기</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            {aiGuide.summary}
          </p>

          <div className="p-3 bg-white rounded-xl border border-amber-200/70 text-xs space-y-1.5">
            <span className="font-bold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              함께 드실 때 주의할 점:
            </span>
            <ul className="list-disc list-inside text-slate-700 space-y-0.5">
              {aiGuide.interactionWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400">
            * {aiGuide.disclaimer}
          </p>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('meds')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'meds'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          복용 중인 약품 ({medications.length})
        </button>
        <button
          onClick={() => setActiveSubTab('reminders')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'reminders'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          복약 알림 & 기록 ({reminders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('rx')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'rx'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          처방전 목록 ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('pharmacies')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'pharmacies'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          조제 약국 안내 ({pharmacies.length})
        </button>
      </div>

      {/* Sub Tab 1: Current Medications */}
      {activeSubTab === 'meds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map(med => (
            <div key={med.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                      {med.name}
                    </h3>
                    {med.isTaking && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded">
                        복용중
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    복용기간: {med.startDate} ~ {med.endDate} ({med.durationDays}일분)
                  </p>
                </div>

                <span className="font-bold text-teal-800 text-sm bg-teal-50 px-2.5 py-1 rounded-lg">
                  1일 {med.dailyFrequency}회 ({med.dosagePerTake})
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
                <p><strong className="text-slate-800">복용 시점:</strong> {med.takeTimes.join(', ')} ({med.howToTake})</p>
                {med.precaution && (
                  <p className="text-amber-800 font-medium">
                    ⚠️ 주의: {med.precaution}
                  </p>
                )}
                {med.sideEffects && (
                  <p className="text-slate-500">
                    부작용 가능성: {med.sideEffects}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 2: Reminders */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-3">
          {reminders.map(rem => (
            <div
              key={rem.id}
              onClick={() => onToggleReminder(rem.id, !rem.isTakenToday)}
              className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer flex items-center justify-between ${
                rem.isTakenToday ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 hover:border-teal-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    rem.isTakenToday ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {rem.isTakenToday && <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                    {rem.medName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    복용 시간: {rem.timeSlot} {rem.reminderTime} · {rem.frequency}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                  rem.isTakenToday ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {rem.isTakenToday ? '오늘 복용 완료 ✓' : '복용 체크하기'}
                </span>
                {rem.streakDays > 0 && (
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">
                    🔥 {rem.streakDays}일 연속 복약 중
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 3: Prescriptions */}
      {activeSubTab === 'rx' && (
        <div className="space-y-3">
          {prescriptions.map(rx => (
            <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                    {rx.hospital} 처방전
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  발급일: {rx.prescribeDate}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                담당의: {rx.doctor} · 처방 약품수: {rx.medicationCount || 2}종
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                <strong className="text-slate-800">처방 상세:</strong> {rx.details}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 4: Pharmacies */}
      {activeSubTab === 'pharmacies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pharmacies.map(pharm => (
            <div key={pharm.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                    {pharm.name}
                  </h3>
                  <p className="text-xs text-slate-400">조제일: {pharm.dispenseDate}</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p>주소: {pharm.address}</p>
                <p>전화: <a href={`tel:${pharm.phone}`} className="text-teal-700 font-bold">{pharm.phone}</a></p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                <strong className="text-slate-800">복약 지도:</strong> {pharm.instruction}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
