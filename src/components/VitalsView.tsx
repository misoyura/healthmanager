import React, { useState } from 'react';
import {
  Activity,
  Heart,
  FileCheck2,
  Calendar,
  Plus,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  VitalSign,
  HealthCheckup,
  SymptomLog,
  User,
} from '../types/health';

interface VitalsViewProps {
  currentUser: User;
  vitals: VitalSign[];
  checkups: HealthCheckup[];
  symptoms: SymptomLog[];
  seniorMode: boolean;
  onOpenAddRecord: (type: 'vital' | 'symptom') => void;
}

export const VitalsView: React.FC<VitalsViewProps> = ({
  currentUser,
  vitals,
  checkups,
  symptoms,
  seniorMode,
  onOpenAddRecord,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'vitals' | 'checkups' | 'symptoms'>('vitals');

  const latestVital = vitals[0];

  const getBpStatus = (sys?: number, dia?: number) => {
    if (!sys || !dia) return { label: '미측정', color: 'text-slate-400 bg-slate-100' };
    if (sys < 120 && dia < 80) return { label: '정상', color: 'text-emerald-700 bg-emerald-50' };
    if (sys <= 139 || dia <= 89) return { label: '고혈압 전단계 (주의)', color: 'text-amber-700 bg-amber-50' };
    return { label: '고혈압 (관리 필요)', color: 'text-rose-700 bg-rose-50' };
  };

  const getSugarStatus = (val?: number, type?: string) => {
    if (!val) return { label: '미측정', color: 'text-slate-400 bg-slate-100' };
    if (type === '공복') {
      if (val < 100) return { label: '정상', color: 'text-emerald-700 bg-emerald-50' };
      if (val <= 125) return { label: '공복혈당장애 (주의)', color: 'text-amber-700 bg-amber-50' };
      return { label: '당뇨 수준 (집중관리)', color: 'text-rose-700 bg-rose-50' };
    }
    if (val < 140) return { label: '정상', color: 'text-emerald-700 bg-emerald-50' };
    if (val <= 199) return { label: '식후혈당주의', color: 'text-amber-700 bg-amber-50' };
    return { label: '고혈당 (관리 필요)', color: 'text-rose-700 bg-rose-50' };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
            건강측정 · 검진 · 증상일지
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentUser.name} 님의 매일 혈압/혈당 변화 추이와 정기 건강검진, 신체 이상 증상을 기록합니다
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddRecord('vital')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>혈압·혈당 측정 입력</span>
          </button>
          <button
            onClick={() => onOpenAddRecord('symptom')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>증상일지 기록</span>
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      {latestVital && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">최근 측정 혈압</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${getBpStatus(latestVital.bloodPressureSystolic, latestVital.bloodPressureDiastolic).color}`}>
                {getBpStatus(latestVital.bloodPressureSystolic, latestVital.bloodPressureDiastolic).label}
              </span>
            </div>
            <p className={`font-black text-slate-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              {latestVital.bloodPressureSystolic || '-'}/{latestVital.bloodPressureDiastolic || '-'} <span className="text-sm font-normal text-slate-400">mmHg</span>
            </p>
            <p className="text-[11px] text-slate-400">
              측정일: {latestVital.date} {latestVital.time}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">최근 측정 혈당</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${getSugarStatus(latestVital.bloodSugar, latestVital.bloodSugarType).color}`}>
                {getSugarStatus(latestVital.bloodSugar, latestVital.bloodSugarType).label}
              </span>
            </div>
            <p className={`font-black text-slate-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              {latestVital.bloodSugar || '-'} <span className="text-sm font-normal text-slate-400">mg/dL ({latestVital.bloodSugarType})</span>
            </p>
            <p className="text-[11px] text-slate-400">
              측정일: {latestVital.date} {latestVital.time}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">체중 / 맥박</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                안정적
              </span>
            </div>
            <p className={`font-black text-slate-900 ${seniorMode ? 'text-3xl' : 'text-2xl'}`}>
              {latestVital.weight || 68.5} <span className="text-sm font-normal text-slate-400">kg</span>
            </p>
            <p className="text-[11px] text-slate-400">
              심박수: {latestVital.heartRate || 72} bpm
            </p>
          </div>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('vitals')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'vitals'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          건강측정 기록 ({vitals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('checkups')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'checkups'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          건강검진 결과 ({checkups.length})
        </button>
        <button
          onClick={() => setActiveSubTab('symptoms')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'symptoms'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          증상일지 ({symptoms.length})
        </button>
      </div>

      {/* Sub Tab 1: Vitals */}
      {activeSubTab === 'vitals' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 grid grid-cols-4 sm:grid-cols-6">
            <span>측정일시</span>
            <span>혈압 (수축/이완)</span>
            <span>혈당 (유형)</span>
            <span className="hidden sm:inline">체중</span>
            <span className="hidden sm:inline">심박수</span>
            <span>판정/메모</span>
          </div>
          <div className="divide-y divide-slate-100">
            {vitals.map(v => (
              <div key={v.id} className="p-4 grid grid-cols-4 sm:grid-cols-6 items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{v.date}</span>
                  <span className="text-[11px] text-slate-400">{v.time}</span>
                </div>
                <div>
                  <span className="font-black text-slate-900 text-sm">
                    {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                  </span>
                  <span className="text-[10px] text-slate-400 block">mmHg</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm">
                    {v.bloodSugar || '-'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">({v.bloodSugarType || '공복'})</span>
                </div>
                <div className="hidden sm:block text-slate-700">
                  {v.weight ? `${v.weight} kg` : '-'}
                </div>
                <div className="hidden sm:block text-slate-700">
                  {v.heartRate ? `${v.heartRate} bpm` : '-'}
                </div>
                <div>
                  <p className="text-slate-600 truncate">{v.notes || '이상 없음'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Checkups */}
      {activeSubTab === 'checkups' && (
        <div className="space-y-4">
          {checkups.map(chk => (
            <div key={chk.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                      {chk.institution} ({chk.checkupType})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">검진일자: {chk.date}</p>
                </div>

                {chk.nextCheckupDate && (
                  <span className="text-xs text-slate-500 font-medium">
                    다음 검진 예정: {chk.nextCheckupDate}
                  </span>
                )}
              </div>

              {/* Finding Chips */}
              <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-100">
                <p className="font-bold text-slate-800">검진 종합 소견:</p>
                <p className="text-slate-700 leading-relaxed font-medium">{chk.mainResults}</p>

                {chk.abnormalFindings && chk.abnormalFindings.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="font-bold text-amber-900 mb-1">이상소견 및 추적관찰 항목:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {chk.abnormalFindings.map((item, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md font-bold text-[11px]">
                          ⚠️ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 3: Symptoms */}
      {activeSubTab === 'symptoms' && (
        <div className="space-y-3">
          {symptoms.map(symp => (
            <div key={symp.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                    {symp.symptom}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    symp.severity === '경미함' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {symp.severity}
                  </span>
                </div>
                <span className="text-xs text-slate-400">발생일: {symp.date}</span>
              </div>
              <p className="text-xs text-slate-500">
                지속 시간: {symp.duration || '약 1시간'}
              </p>
              {symp.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                  <strong className="text-slate-800">기록 메모:</strong> {symp.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
