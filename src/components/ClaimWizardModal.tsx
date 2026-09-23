import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Calculator,
  ChevronRight,
} from 'lucide-react';
import { Insurance, InsuranceClaim, UnifiedMedicalRecord } from '../types/health';
import { HealthStorage } from '../services/storage';

interface ClaimWizardModalProps {
  userId: string;
  selectedRecord?: UnifiedMedicalRecord | null;
  records: UnifiedMedicalRecord[];
  insuranceList: Insurance[];
  onClose: () => void;
  onSuccess: () => void;
  seniorMode: boolean;
}

export const ClaimWizardModal: React.FC<ClaimWizardModalProps> = ({
  userId,
  selectedRecord,
  records,
  insuranceList,
  onClose,
  onSuccess,
  seniorMode,
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string>(
    selectedRecord?.visit.id || (records[0]?.visit.id || '')
  );
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>(
    insuranceList[0]?.id || ''
  );

  const [hasReceipt, setHasReceipt] = useState(true);
  const [hasItemizedBill, setHasItemizedBill] = useState(true);
  const [hasPrescription, setHasPrescription] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [claimNotes, setClaimNotes] = useState('외래 진료 및 약제비 실손의료비 청구');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const currentRecord = records.find(r => r.visit.id === selectedVisitId) || selectedRecord;
  const currentInsurance = insuranceList.find(i => i.id === selectedInsuranceId) || insuranceList[0];

  const totalCost = (currentRecord?.hospitalReceipt?.totalCost || currentRecord?.visit.costTotal || 0) +
    (currentRecord?.pharmacyReceipt?.totalCost || 0);

  const totalCopay = (currentRecord?.hospitalReceipt?.patientCopay || currentRecord?.visit.costCopay || 0) +
    (currentRecord?.pharmacyReceipt?.patientCopay || 0);

  // Standard Korean deductible deduction estimation:
  // Clinics/Hospitals ~ 10,000~20,000 KRW, Pharmacy ~ 8,000 KRW
  const deductible = Math.min(20000, Math.floor(totalCopay * 0.2));
  const estimatedPayout = Math.max(0, totalCopay - deductible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newClaim: InsuranceClaim = {
        id: `claim-${Date.now()}`,
        userId,
        insuranceId: currentInsurance?.id || 'ins-01',
        insuranceName: currentInsurance ? `${currentInsurance.insurer} (${currentInsurance.productName})` : '삼성화재 실손보험',
        visitId: currentRecord.visit.id,
        claimDate: new Date().toISOString().split('T')[0],
        claimAmount: totalCopay,
        paidAmount: 0,
        copayAmount: deductible,
        status: '서류심사중',
        documents: {
          receipt: hasReceipt,
          itemizedBill: hasItemizedBill,
          prescription: hasPrescription,
          medicalCertificate: hasCertificate,
        },
        notes: claimNotes,
      };

      HealthStorage.saveClaim(newClaim);

      // Also mark receipt as claimed
      if (currentRecord.hospitalReceipt) {
        currentRecord.hospitalReceipt.isClaimed = true;
        HealthStorage.saveReceipt(currentRecord.hospitalReceipt);
      }
      if (currentRecord.pharmacyReceipt) {
        currentRecord.pharmacyReceipt.isClaimed = true;
        HealthStorage.saveReceipt(currentRecord.pharmacyReceipt);
      }

      setIsSubmitting(false);
      setIsDone(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                실손보험 원클릭 청구 도우미
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                진료비 영수증과 처방전을 자동으로 묶어 보험사에 접수합니다
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">실손보험 청구 접수 완료!</h4>
            <p className="text-sm text-slate-600">
              청구서류가 정상 접수되어 <strong className="text-teal-700">서류심사중</strong>으로 등록되었습니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
            {/* 1. Select Visit Record */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                청구할 진료 내역 선택
              </label>
              <select
                value={selectedVisitId}
                onChange={e => setSelectedVisitId(e.target.value)}
                className={`w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 ${
                  seniorMode ? 'text-base' : 'text-sm'
                }`}
              >
                {records.map(r => (
                  <option key={r.visit.id} value={r.visit.id}>
                    [{r.visit.visitDate}] {r.visit.hospitalName} ({r.visit.department}) - 본인부담 {((r.hospitalReceipt?.patientCopay || r.visit.costCopay) + (r.pharmacyReceipt?.patientCopay || 0)).toLocaleString()}원
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Insurance Company */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                가입된 실손보험 선택
              </label>
              {insuranceList.length > 0 ? (
                <select
                  value={selectedInsuranceId}
                  onChange={e => setSelectedInsuranceId(e.target.value)}
                  className={`w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 ${
                    seniorMode ? 'text-base' : 'text-sm'
                  }`}
                >
                  {insuranceList.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.insurer} - {ins.productName} (증권번호: {ins.policyNumber})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  등록된 보험이 없습니다. 기본 실손보험으로 청구됩니다.
                </div>
              )}
            </div>

            {/* 3. Expected Payout Calculation Box */}
            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs sm:text-sm">
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>예상 실손 환급금 시뮬레이션</span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-teal-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block">총 본인부담금</span>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    {totalCopay.toLocaleString()}원
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">예상 자기공제금</span>
                  <span className="font-bold text-slate-500 text-sm sm:text-base">
                    - {deductible.toLocaleString()}원
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 font-bold block">예상 환급금액</span>
                  <span className="font-black text-teal-600 text-base sm:text-lg">
                    {estimatedPayout.toLocaleString()}원
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                * 실제 지급액은 보험 약관의 통원의료비 공제 기준(병원 급별 1~2만원 or 10~20%)에 따라 일부 차이가 발생할 수 있습니다.
              </p>
            </div>

            {/* 4. Required Documents Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                자동 첨부 서류 확인
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasReceipt}
                    onChange={e => setHasReceipt(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="font-medium text-slate-800">진료비 계산서·영수증</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasItemizedBill}
                    onChange={e => setHasItemizedBill(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="font-medium text-slate-800">진료비 세부내역서</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPrescription}
                    onChange={e => setHasPrescription(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="font-medium text-slate-800">처방전(질병분류기호 포함)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCertificate}
                    onChange={e => setHasCertificate(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span className="font-medium text-slate-800">진단서/통원확인서(선택)</span>
                </label>
              </div>
            </div>

            {/* Claim Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                청구 메모 및 전달사항
              </label>
              <input
                type="text"
                value={claimNotes}
                onChange={e => setClaimNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? '접수 처리중...' : '실손보험 청구 접수하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
