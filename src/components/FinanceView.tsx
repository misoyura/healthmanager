import React, { useState } from 'react';
import {
  ReceiptText,
  ShieldCheck,
  FileCheck2,
  DollarSign,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
} from 'lucide-react';
import {
  Receipt,
  Insurance,
  InsuranceClaim,
  User,
  UnifiedMedicalRecord,
} from '../types/health';

interface FinanceViewProps {
  currentUser: User;
  receipts: Receipt[];
  insuranceList: Insurance[];
  claims: InsuranceClaim[];
  records: UnifiedMedicalRecord[];
  seniorMode: boolean;
  onOpenClaimWizard: (record?: UnifiedMedicalRecord) => void;
  onOpenOcr: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  currentUser,
  receipts,
  insuranceList,
  claims,
  records,
  seniorMode,
  onOpenClaimWizard,
  onOpenOcr,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'claims' | 'receipts' | 'insurance'>('claims');

  const totalCost = receipts.reduce((sum, r) => sum + r.totalCost, 0);
  const totalCopay = receipts.reduce((sum, r) => sum + r.patientCopay, 0);
  const totalReimbursed = claims.filter(c => c.status === '지급완료').reduce((sum, c) => sum + c.paidAmount, 0);
  const totalClaimPending = claims.filter(c => c.status !== '지급완료').reduce((sum, c) => sum + c.claimAmount, 0);
  const netPatientExpense = totalCopay - totalReimbursed;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <h2 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
            진료비 영수증 및 실손보험 청구
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {currentUser.name} 님의 병원·약국 영수증을 모아 실손보험금을 간편하게 청구하고 환급받으세요
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOcr}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5"
          >
            <ReceiptText className="w-4 h-4 text-teal-600" />
            <span>영수증 사진 스캔</span>
          </button>
          <button
            onClick={() => onOpenClaimWizard()}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>실손보험 청구하기</span>
          </button>
        </div>
      </div>

      {/* Financial Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">총 발생 진료비</span>
          <p className={`font-black text-slate-800 mt-1 ${seniorMode ? 'text-xl' : 'text-lg'}`}>
            {totalCost.toLocaleString()}원
          </p>
          <span className="text-[11px] text-slate-400">공단부담 + 본인부담</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-rose-600 block">총 환자 본인부담금</span>
          <p className={`font-black text-rose-600 mt-1 ${seniorMode ? 'text-xl' : 'text-lg'}`}>
            {totalCopay.toLocaleString()}원
          </p>
          <span className="text-[11px] text-slate-400">영수증 {receipts.length}건 합산</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 block">실손보험 환급 완료</span>
          <p className={`font-black text-emerald-600 mt-1 ${seniorMode ? 'text-xl' : 'text-lg'}`}>
            {totalReimbursed.toLocaleString()}원
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">
            환급률 {totalCopay > 0 ? Math.round((totalReimbursed / totalCopay) * 100) : 0}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-indigo-600 block">최종 순 지출 의료비</span>
          <p className={`font-black text-indigo-700 mt-1 ${seniorMode ? 'text-xl' : 'text-lg'}`}>
            {netPatientExpense.toLocaleString()}원
          </p>
          <span className="text-[11px] text-slate-400">
            (심사중 {totalClaimPending.toLocaleString()}원)
          </span>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('claims')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'claims'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          실손보험 청구 내역 ({claims.length})
        </button>
        <button
          onClick={() => setActiveSubTab('receipts')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'receipts'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          영수증 보관함 ({receipts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('insurance')}
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeSubTab === 'insurance'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          가입된 보험 증권 ({insuranceList.length})
        </button>
      </div>

      {/* Sub Tab 1: Claims */}
      {activeSubTab === 'claims' && (
        <div className="space-y-3">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                      {claim.insuranceName}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      claim.status === '지급완료'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">청구 접수일: {claim.claimDate}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">최종 지급 금액</span>
                  <span className="font-black text-emerald-600 text-base sm:text-lg">
                    {claim.paidAmount > 0 ? `${claim.paidAmount.toLocaleString()}원` : '심사중'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">청구액</span>
                  <span className="font-bold text-slate-800">{claim.claimAmount.toLocaleString()}원</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">자기공제액</span>
                  <span className="font-bold text-slate-500">-{claim.copayAmount.toLocaleString()}원</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px]">보상 상태</span>
                  <span className="font-bold text-emerald-600">{claim.status}</span>
                </div>
              </div>

              {claim.notes && (
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">진행 메모:</strong> {claim.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 2: Receipts */}
      {activeSubTab === 'receipts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {receipts.map(rec => (
            <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                      {rec.providerName}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                      {rec.type === 'hospital' ? '병원' : '약국'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">발행일: {rec.date}</p>
                </div>

                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  rec.isClaimed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {rec.isClaimed ? '실손청구 완료' : '미청구 영수증'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>총 진료·조제비:</span>
                  <span>{rec.totalCost.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                  <span>환자 본인부담금:</span>
                  <span className="text-rose-600 text-sm">{rec.patientCopay.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>공단부담금: {rec.insuredAmount.toLocaleString()}원</span>
                  <span>비급여: {rec.nonCoveredAmount.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Tab 3: Insurance Policies */}
      {activeSubTab === 'insurance' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insuranceList.map(ins => (
            <div key={ins.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                    {ins.insurer}
                  </h3>
                  <p className="text-xs text-teal-700 font-bold">{ins.productName}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>증권번호: <span className="font-mono">{ins.policyNumber}</span></p>
                <p>가입일자: {ins.startDate}</p>
                <p>보장한도: {ins.coverageAmount.toLocaleString()}원</p>
                <p>월 납입보험료: {ins.premium.toLocaleString()}원</p>
              </div>

              <div className="p-3 bg-teal-50/60 rounded-xl text-xs text-teal-900 border border-teal-100">
                <strong className="text-teal-950">보장 내역:</strong> {ins.coverageDetails}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
