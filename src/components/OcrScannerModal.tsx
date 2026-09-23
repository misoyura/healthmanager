import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Pill,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { AIService, OcrResponse } from '../services/aiService';
import { HealthStorage } from '../services/storage';
import { MedicalVisit, Prescription, Medication, Receipt as ReceiptType } from '../types/health';

interface OcrScannerModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
  seniorMode: boolean;
}

export const OcrScannerModal: React.FC<OcrScannerModalProps> = ({
  userId,
  onClose,
  onSuccess,
  seniorMode,
}) => {
  const [docType, setDocType] = useState<'receipt' | 'prescription'>('receipt');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sample presets for quick testing if user doesn't have an image on hand
  const handleSelectSample = (sampleType: 'receipt' | 'prescription') => {
    setDocType(sampleType);
    if (sampleType === 'receipt') {
      runOcr(
        'receipt',
        '서울아산병원 진료비 계산서·영수증 | 진료일자: 2026-09-15 | 진료과: 순환기내과 | 담당의: 박준형 | 진찰료: 19,000 | 검사료: 128,000 | 환자부담총액: 44,100원 | 공단부담: 102,900원'
      );
    } else {
      runOcr(
        'prescription',
        '처방전 | 의료기관명: 삼성서울병원 | 처방일: 2026-09-18 | 환자명: 본인 | 질병분류기호: E11.9 (제2형 당뇨병) | 처방의약품: 다이아벡스정 500mg 1회 1정 1일 2회 30일분 식후즉시, 자누비아정 100mg 1회 1정 1일 1회 30일분 아침식후'
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      runOcr(docType, '', base64);
    };
    reader.readAsDataURL(file);
  };

  const runOcr = async (type: 'receipt' | 'prescription', textContent?: string, imageBase64?: string) => {
    setIsScanning(true);
    setOcrResult(null);
    try {
      const res = await AIService.ocrDocument({
        docType: type,
        textContent,
        imageBase64,
      });
      setOcrResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToDatabase = () => {
    if (!ocrResult) return;
    setIsSaving(true);

    setTimeout(() => {
      const visitId = `visit-${Date.now()}`;
      const now = ocrResult.docDate || new Date().toISOString().split('T')[0];

      // 1. Save Visit
      const newVisit: MedicalVisit = {
        id: visitId,
        userId,
        hospitalId: 'hosp-01',
        hospitalName: ocrResult.providerName,
        department: ocrResult.department || '일반외래',
        doctor: ocrResult.doctorName || '의사',
        visitDate: now,
        purpose: ocrResult.extractedSummary || 'AI 스캔 영수증/처방전 진료',
        symptoms: '정기 외래 진료',
        details: ocrResult.extractedSummary,
        costTotal: ocrResult.totalCost || 45000,
        costCopay: ocrResult.patientCopay || 13500,
      };
      HealthStorage.saveVisit(newVisit);

      // 2. If prescription or has medications, save Prescription and Medications
      if (ocrResult.medications && ocrResult.medications.length > 0) {
        const rxId = `rx-${Date.now()}`;
        const newRx: Prescription = {
          id: rxId,
          userId,
          visitId,
          prescribeDate: now,
          hospital: ocrResult.providerName,
          doctor: ocrResult.doctorName || '의사',
          details: `${ocrResult.medications.length}종 처방약`,
          medicationCount: ocrResult.medications.length,
        };
        HealthStorage.savePrescription(newRx);

        ocrResult.medications.forEach((med, idx) => {
          const newMed: Medication = {
            id: `med-${Date.now()}-${idx}`,
            prescriptionId: rxId,
            name: med.name,
            dosagePerTake: med.dosage || '1정',
            dailyFrequency: med.dailyFreq || 1,
            durationDays: med.durationDays || 30,
            takeTimes: ['아침'],
            howToTake: med.instruction || '식후 30분 복용',
            isTaking: true,
            startDate: now,
            endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            precaution: ocrResult.precautions,
          };
          HealthStorage.saveMedication(newMed);
        });
      }

      // 3. Save Receipt
      const newReceipt: ReceiptType = {
        id: `rec-${Date.now()}`,
        userId,
        visitId,
        type: ocrResult.type === 'prescription' ? 'pharmacy' : 'hospital',
        providerName: ocrResult.providerName,
        date: now,
        totalCost: ocrResult.totalCost || 0,
        patientCopay: ocrResult.patientCopay || 0,
        insuredAmount: ocrResult.insuredAmount || 0,
        nonCoveredAmount: ocrResult.nonCoveredAmount || 0,
        isClaimed: false,
        ocrData: ocrResult.extractedSummary,
      };
      HealthStorage.saveReceipt(newReceipt);

      setIsSaving(false);
      setSaveSuccess(true);
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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                AI 스마트 영수증 & 처방전 스캐너
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                사진을 찍거나 첨부하면 AI가 병원, 진료비, 약품명을 자동으로 입력해 드립니다
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {saveSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">내 건강 기록에 저장 완료!</h4>
            <p className="text-sm text-slate-600">
              진료 기록, 처방약, 영수증이 모두 데이터베이스에 안전하게 연결되었습니다.
            </p>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Document Type Selector */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDocType('receipt')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 ${
                  docType === 'receipt'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>병원·약국 영수증</span>
              </button>
              <button
                type="button"
                onClick={() => setDocType('prescription')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 ${
                  docType === 'prescription'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>약국 처방전</span>
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="docUpload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="docUpload" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  영수증 또는 처방전 사진 올리기
                </p>
                <p className="text-xs text-slate-500">
                  스마트폰으로 촬영한 사진이나 이미지를 선택하세요
                </p>
              </label>

              {/* Sample Preset Buttons for Immediate Simulation */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400">사진이 없으신가요?</span>
                <button
                  type="button"
                  onClick={() => handleSelectSample('receipt')}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors"
                >
                  샘플 영수증 자동분석
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample('prescription')}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors"
                >
                  샘플 처방전 자동분석
                </button>
              </div>
            </div>

            {/* Scanning Progress */}
            {isScanning && (
              <div className="p-6 bg-teal-50/70 border border-teal-200 rounded-xl text-center space-y-2">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-bold text-teal-900 text-sm">
                  Gemini AI가 서류를 꼼꼼하게 읽고 있습니다...
                </p>
                <p className="text-xs text-slate-500">
                  병원명, 진료과, 본인부담금 및 약품 명칭을 정밀 추출하는 중입니다.
                </p>
              </div>
            )}

            {/* OCR Extracted Results Card */}
            {ocrResult && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">
                      AI 추출 결과 확인
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {ocrResult.providerName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">진료/조제일</span>
                    <span className="font-bold text-slate-800">{ocrResult.docDate}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">진료과 / 의사</span>
                    <span className="font-bold text-slate-800">{ocrResult.department || '-'} / {ocrResult.doctorName || '-'}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">본인부담금</span>
                    <span className="font-bold text-rose-600">{ocrResult.patientCopay.toLocaleString()}원</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">실손청구 가능</span>
                    <span className="font-bold text-emerald-600">{ocrResult.claimable ? '가능 (영수증 확인)' : '확인 필요'}</span>
                  </div>
                </div>

                {ocrResult.medications && ocrResult.medications.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">처방 의약품 ({ocrResult.medications.length}종):</p>
                    <ul className="text-xs text-slate-600 space-y-1 pl-1">
                      {ocrResult.medications.map((m, idx) => (
                        <li key={idx} className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="font-medium text-slate-900">💊 {m.name}</span>
                          <span className="text-slate-500">{m.dosage} · 1일 {m.dailyFreq}회 · {m.durationDays}일분</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ocrResult.precautions && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">
                    💡 <strong>복약/서류 안내:</strong> {ocrResult.precautions}
                  </p>
                )}

                {/* Confirm & Save Button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSaveToDatabase}
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                  >
                    {isSaving ? '내 기록에 저장중...' : '이 내용 내 건강기록에 저장하기'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
