import React from 'react';
import {
  X,
  Building2,
  Stethoscope,
  Activity,
  FileText,
  Pill,
  Receipt,
  ShieldCheck,
  Calendar,
  Volume2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { UnifiedMedicalRecord } from '../types/health';
import { AIService } from '../services/aiService';

interface MedicalDetailModalProps {
  record: UnifiedMedicalRecord | null;
  onClose: () => void;
  seniorMode: boolean;
  onClaimInsurance: (record: UnifiedMedicalRecord) => void;
}

export const MedicalDetailModal: React.FC<MedicalDetailModalProps> = ({
  record,
  onClose,
  seniorMode,
  onClaimInsurance,
}) => {
  if (!record) return null;

  const {
    visit,
    hospital,
    disease,
    prescription,
    medications,
    pharmacy,
    hospitalReceipt,
    pharmacyReceipt,
    insuranceClaim,
  } = record;

  const totalCopay = (hospitalReceipt?.patientCopay || visit.costCopay || 0) + (pharmacyReceipt?.patientCopay || 0);

  const handleSpeakSummary = () => {
    const text = `
${visit.visitDate}에 ${visit.hospitalName} ${visit.department}에서 진료를 받으셨습니다.
진단된 질병은 ${disease ? disease.name : '정기 진료'}입니다.
처방받은 약은 ${medications.map(m => m.name).join(', ') || '없음'}입니다.
병원과 약국에서 지불하신 본인부담금은 총 ${totalCopay.toLocaleString()}원입니다.
${insuranceClaim ? `실손보험 청구 상태는 ${insuranceClaim.status}이며, 지급받으신 금액은 ${insuranceClaim.paidAmount.toLocaleString()}원입니다.` : '아직 실손보험 청구가 진행되지 않았습니다.'}
`;
    AIService.speakText(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                  {visit.hospitalName} 진료 통합 리포트
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md">
                  {visit.department}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                진료일: {visit.visitDate} · 담당: {visit.doctor}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              title="이 진료 요약 음성으로 듣기"
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>읽어주기</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body - Flow Timeline */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Stat Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-[11px] font-bold text-slate-400">진료과 및 의사</p>
              <p className={`font-bold text-slate-800 ${seniorMode ? 'text-base' : 'text-sm'}`}>
                {visit.department} / {visit.doctor}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400">진단 질병</p>
              <p className={`font-bold text-teal-700 truncate ${seniorMode ? 'text-base' : 'text-sm'}`}>
                {disease?.name || '만성질환 경과관찰'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400">총 본인부담금</p>
              <p className={`font-bold text-rose-600 ${seniorMode ? 'text-lg' : 'text-base'}`}>
                {totalCopay.toLocaleString()}원
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400">실손보험 상태</p>
              <p className={`font-bold ${seniorMode ? 'text-base' : 'text-sm'} ${
                insuranceClaim?.status === '지급완료' ? 'text-emerald-600' : insuranceClaim ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {insuranceClaim ? `${insuranceClaim.status} (${insuranceClaim.paidAmount > 0 ? `${insuranceClaim.paidAmount.toLocaleString()}원 지급` : '심사중'})` : '미청구'}
              </p>
            </div>
          </div>

          {/* 1. 병원 진료 상세 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-teal-700 font-bold">
              <Building2 className="w-5 h-5" />
              <h4 className={seniorMode ? 'text-lg' : 'text-base'}>1. 병원 및 진료 내용</h4>
            </div>
            <div className="space-y-2 text-slate-700 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>병원 주소: {hospital?.address || '정보 없음'}</span>
                <span>대표 전화: {hospital?.phone || '정보 없음'}</span>
              </div>
              <p><strong className="text-slate-900">방문 목적:</strong> {visit.purpose}</p>
              <p><strong className="text-slate-900">호소 증상:</strong> {visit.symptoms || '특이 증상 없음'}</p>
              <p><strong className="text-slate-900">의사 진료 소견:</strong> {visit.details}</p>
              {visit.examDetails && (
                <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900 mt-2">
                  <span className="font-bold">시행 검사:</span> {visit.examDetails}
                  {visit.examResults && <div className="mt-1"><span className="font-bold">검사 결과:</span> {visit.examResults}</div>}
                </div>
              )}
              {visit.nextVisitDate && (
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md mt-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>다음 진료 예정일: {visit.nextVisitDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. 질병 진단 정보 */}
          {disease && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
                <Activity className="w-5 h-5" />
                <h4 className={seniorMode ? 'text-lg' : 'text-base'}>2. 질병 진단 분류 (KCD)</h4>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{disease.name}</span>
                    <span className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-800 text-xs font-mono font-bold rounded">
                      {disease.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    최초 진단: {disease.firstDiagnosisDate} ({disease.hospital})
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md">
                  현재 상태: {disease.currentStatus}
                </span>
              </div>
              {disease.pastHistory && (
                <p className="text-xs text-slate-600 mt-2">
                  <strong className="text-slate-800">병력 및 관리 메모:</strong> {disease.pastHistory}
                </p>
              )}
            </div>
          )}

          {/* 3. 처방전 및 복용 약품 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <Pill className="w-5 h-5" />
                <h4 className={seniorMode ? 'text-lg' : 'text-base'}>3. 처방전 및 복약 정보</h4>
              </div>
              {prescription && (
                <span className="text-xs text-slate-500">
                  처방일: {prescription.prescribeDate}
                </span>
              )}
            </div>

            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map(med => (
                  <div key={med.id} className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <span>{med.name}</span>
                        {med.isTaking && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            현재 복용중
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-amber-900">
                        {med.dailyFrequency}회 / {med.durationDays}일분 ({med.dosagePerTake})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1.5 space-y-1">
                      <p><strong className="text-slate-700">복용 시기:</strong> {med.takeTimes.join(', ')} ({med.howToTake})</p>
                      {med.precaution && (
                        <p className="text-rose-700 font-medium">
                          ⚠️ 주의: {med.precaution}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">처방된 약품 내역이 없습니다.</p>
            )}

            {pharmacy && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>조제 약국: <strong className="text-slate-800">{pharmacy.name}</strong> ({pharmacy.phone})</span>
                <span className="text-slate-500">복약지도: {pharmacy.instruction}</span>
              </div>
            )}
          </div>

          {/* 4. 영수증 및 진료비 내역 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
              <Receipt className="w-5 h-5" />
              <h4 className={seniorMode ? 'text-lg' : 'text-base'}>4. 진료비 및 약제비 영수증</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hospitalReceipt && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>병원 영수증 ({hospitalReceipt.providerName})</span>
                    <span className="text-teal-700">외래</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>총 진료비:</span>
                    <span>{hospitalReceipt.totalCost.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                    <span>본인부담금:</span>
                    <span className="text-rose-600">{hospitalReceipt.patientCopay.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>공단부담금: {hospitalReceipt.insuredAmount.toLocaleString()}원</span>
                    <span>비급여: {hospitalReceipt.nonCoveredAmount.toLocaleString()}원</span>
                  </div>
                </div>
              )}

              {pharmacyReceipt ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>약국 영수증 ({pharmacyReceipt.providerName})</span>
                    <span className="text-teal-700">처방조제</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>총 조제비:</span>
                    <span>{pharmacyReceipt.totalCost.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                    <span>본인부담금:</span>
                    <span className="text-rose-600">{pharmacyReceipt.patientCopay.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>공단부담금: {pharmacyReceipt.insuredAmount.toLocaleString()}원</span>
                    <span>비급여: {pharmacyReceipt.nonCoveredAmount.toLocaleString()}원</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50/60 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 flex items-center justify-center">
                  약국 영수증 미등록
                </div>
              )}
            </div>
          </div>

          {/* 5. 실손보험 청구 내역 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-700 font-bold">
                <ShieldCheck className="w-5 h-5" />
                <h4 className={seniorMode ? 'text-lg' : 'text-base'}>5. 실손보험 청구 및 지급 상태</h4>
              </div>
              {insuranceClaim && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  insuranceClaim.status === '지급완료'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {insuranceClaim.status}
                </span>
              )}
            </div>

            {insuranceClaim ? (
              <div className="p-3 bg-cyan-50/50 border border-cyan-200/70 rounded-lg text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{insuranceClaim.insuranceName}</span>
                  <span className="text-slate-500">청구일: {insuranceClaim.claimDate}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded border border-cyan-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">청구 금액</span>
                    <span className="font-bold text-slate-800">{insuranceClaim.claimAmount.toLocaleString()}원</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">공제 금액</span>
                    <span className="font-bold text-slate-500">{insuranceClaim.copayAmount.toLocaleString()}원</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">실제 지급액</span>
                    <span className="font-bold text-emerald-600 text-sm">{insuranceClaim.paidAmount.toLocaleString()}원</span>
                  </div>
                </div>
                {insuranceClaim.notes && (
                  <p className="text-slate-600 text-[11px] pt-1">
                    <strong className="text-slate-800">보상 메모:</strong> {insuranceClaim.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-slate-800">아직 실손보험 청구가 되지 않았습니다.</p>
                  <p className="text-slate-500">진료비 영수증과 처방전 서류가 준비되어 있어 바로 청구 가능합니다.</p>
                </div>
                <button
                  onClick={() => onClaimInsurance(record)}
                  className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                >
                  실손보험 청구하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            의료정보는 암호화되어 안전하게 보관됩니다.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
