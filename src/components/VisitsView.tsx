import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  Activity,
  FileCheck2,
  Plus,
  Search,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  UnifiedMedicalRecord,
  Hospital,
  Disease,
  LabTest,
  User,
} from '../types/health';

interface VisitsViewProps {
  currentUser: User;
  records: UnifiedMedicalRecord[];
  hospitals: Hospital[];
  diseases: Disease[];
  labTests: LabTest[];
  seniorMode: boolean;
  onSelectRecord: (record: UnifiedMedicalRecord) => void;
  onOpenAddRecord: (type: 'visit') => void;
}

export const VisitsView: React.FC<VisitsViewProps> = ({
  currentUser,
  records,
  hospitals,
  diseases,
  labTests,
  seniorMode,
  onSelectRecord,
  onOpenAddRecord,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visits' | 'diseases' | 'hospitals' | 'labs'>('visits');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(r =>
    r.visit.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.visit.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.disease?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.visit.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
            병원 진료 및 질병 관리
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentUser.name} 님의 정기 외래 방문, 진단 질병 코드, 주요 검사 결과를 확인하세요
          </p>
        </div>

        <button
          onClick={() => onOpenAddRecord('visit')}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 진료 기록 등록</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('visits')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'visits'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          외래 진료 이력 ({records.length})
        </button>
        <button
          onClick={() => setActiveSubTab('diseases')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'diseases'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          진단 질병 관리 ({diseases.length})
        </button>
        <button
          onClick={() => setActiveSubTab('labs')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'labs'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          검사 결과 관리 ({labTests.length})
        </button>
        <button
          onClick={() => setActiveSubTab('hospitals')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'hospitals'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          등록 병원 안내 ({hospitals.length})
        </button>
      </div>

      {/* Search Input */}
      {activeSubTab === 'visits' && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="병원명, 진료과, 질병명, 증상 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>
      )}

      {/* SubTab 1: Visits */}
      {activeSubTab === 'visits' && (
        <div className="space-y-3">
          {filteredRecords.map(r => (
            <div
              key={r.visit.id}
              onClick={() => onSelectRecord(r)}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-lg'}`}>
                      {r.visit.hospitalName}
                    </h3>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-xs font-bold rounded">
                      {r.visit.department}
                    </span>
                    <span className="text-xs text-slate-400">
                      담당: {r.visit.doctor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    진료일: {r.visit.visitDate}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">본인부담금</span>
                  <span className="font-bold text-rose-600 text-base">
                    {r.visit.costCopay.toLocaleString()}원
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <p><strong className="text-slate-700">방문 목적:</strong> {r.visit.purpose}</p>
                <p><strong className="text-slate-700">진료 소견:</strong> {r.visit.details}</p>
                {r.visit.examResults && (
                  <p className="text-teal-800 font-medium">
                    🔬 검사결과: {r.visit.examResults}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  {r.disease && (
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      질병: {r.disease.name} ({r.disease.code})
                    </span>
                  )}
                  {r.medications.length > 0 && (
                    <span className="text-slate-500">
                      💊 처방약 {r.medications.length}종
                    </span>
                  )}
                </div>

                <span className="text-teal-700 font-bold flex items-center">
                  <span>통합 리포트 열기</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubTab 2: Diseases */}
      {activeSubTab === 'diseases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diseases.map(dis => (
            <div key={dis.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                      {dis.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 text-xs font-mono font-bold rounded border border-indigo-200">
                      {dis.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    최초 진단: {dis.firstDiagnosisDate} ({dis.hospital})
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                  {dis.currentStatus}
                </span>
              </div>

              {dis.pastHistory && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                  <strong className="text-slate-800">질환 관리 메모:</strong> {dis.pastHistory}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SubTab 3: Lab Tests */}
      {activeSubTab === 'labs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 flex justify-between">
            <span>임상 검사항목 및 수치</span>
            <span>정상 기준치 및 소견</span>
          </div>
          <div className="divide-y divide-slate-100">
            {labTests.map(lab => (
              <div key={lab.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-slate-900 ${seniorMode ? 'text-base' : 'text-sm'}`}>
                      {lab.testName}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      lab.status === '정상' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">검사일: {lab.testDate}</p>
                  {lab.doctorOpinion && (
                    <p className="text-slate-600 mt-1">
                      🩺 <strong>소견:</strong> {lab.doctorOpinion}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className={`font-black ${seniorMode ? 'text-xl' : 'text-base'} ${
                    lab.status === '정상' ? 'text-slate-900' : 'text-rose-600'
                  }`}>
                    {lab.resultValue}
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    (기준치: {lab.normalRange})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 4: Hospitals */}
      {activeSubTab === 'hospitals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hospitals.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                    {h.name}
                  </h3>
                  <p className="text-xs text-teal-700 font-medium">
                    {h.department} · {h.doctor}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{h.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${h.phone}`} className="text-teal-700 font-bold hover:underline">
                    {h.phone}
                  </a>
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {h.specialities.map((spec, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
