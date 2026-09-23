import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Pill,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Camera,
  MessageSquare,
} from 'lucide-react';
import {
  AIHealthAnalysis,
  HealthProfile,
  User,
  UnifiedMedicalRecord,
  VitalSign,
  HealthCheckup,
} from '../types/health';
import { AIService } from '../services/aiService';
import { HealthStorage } from '../services/storage';

interface AIReportViewProps {
  currentUser: User;
  profile?: HealthProfile;
  records: UnifiedMedicalRecord[];
  vitals: VitalSign[];
  checkups: HealthCheckup[];
  reports: AIHealthAnalysis[];
  seniorMode: boolean;
  onOpenOcr: () => void;
  onOpenSymptomConsult: () => void;
  onReportGenerated: (report: AIHealthAnalysis) => void;
}

export const AIReportView: React.FC<AIReportViewProps> = ({
  currentUser,
  profile,
  records,
  vitals,
  checkups,
  reports,
  seniorMode,
  onOpenOcr,
  onOpenSymptomConsult,
  onReportGenerated,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleGenerateNewReport = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        userProfile: {
          name: currentUser.name,
          birthDate: currentUser.birthDate,
          gender: currentUser.gender,
          ...profile,
        },
        visits: records.map(r => ({
          hospitalName: r.visit.hospitalName,
          date: r.visit.visitDate,
          department: r.visit.department,
          details: r.visit.details,
          disease: r.disease?.name,
        })),
        medications: records.flatMap(r => r.medications.map(m => ({
          name: m.name,
          dosage: m.dosagePerTake,
          freq: m.dailyFrequency,
          howToTake: m.howToTake,
        }))),
        vitals: vitals.slice(0, 5),
        checkups: checkups.slice(0, 2),
      };

      const result = await AIService.analyzeHealth(payload);

      const newReport: AIHealthAnalysis = {
        id: `rep-${Date.now()}`,
        userId: currentUser.id,
        analysisDate: new Date().toISOString().split('T')[0],
        overallSummary: result.overallSummary,
        statusScore: result.statusScore,
        statusLevel: result.statusLevel,
        medicationReview: result.medicationReview,
        vitalsReview: result.vitalsReview,
        actionItems: result.actionItems,
        upcomingCheckpoints: result.upcomingCheckpoints,
        seniorFriendlyTip: result.seniorFriendlyTip,
        disclaimer: result.disclaimer,
      };

      HealthStorage.saveAIReport(newReport);
      onReportGenerated(newReport);
      setSelectedReportId(newReport.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = () => {
    if (!activeReport) return;
    if (isSpeaking) {
      AIService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `
${currentUser.name} 님의 건강 분석 결과입니다. 현재 건강 점수는 ${activeReport.statusScore}점이며 상태는 ${activeReport.statusLevel}입니다.
${activeReport.overallSummary}
복약 안내입니다. ${activeReport.medicationReview}
혈압과 혈당 측정 소견입니다. ${activeReport.vitalsReview}
오늘의 건강 실천 과제입니다. ${activeReport.actionItems.join(', ')}
${activeReport.seniorFriendlyTip}
`;
    setIsSpeaking(true);
    AIService.speakText(textToRead, () => setIsSpeaking(false));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-300" />
            <span className="text-xs font-bold text-teal-200">Gemini 3.8 Flash 헬스케어 AI 엔진</span>
          </div>
          <h2 className={`font-black tracking-tight ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {currentUser.name} 님 맞춤형 AI 종합 건강 리포트
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 font-medium">
            병원 진료, 복약, 검사결과, 혈압·혈당 데이터를 종합 분석하여 쉬운 우리말로 설명해 드립니다.
          </p>
        </div>

        <button
          onClick={handleGenerateNewReport}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-teal-600 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? '전체 데이터 종합 분석중...' : '지금 새 AI 분석 받기'}</span>
        </button>
      </div>

      {/* Quick Launch Cards for Other AI Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={onOpenOcr}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">AI 스마트 영수증 & 처방전 스캔</h4>
              <p className="text-xs text-slate-500">사진 찍으면 진료비와 약품명을 자동 등록</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={onOpenSymptomConsult}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">시니어 AI 증상 상담 및 진료과 추천</h4>
              <p className="text-xs text-slate-500">어디가 불편할 때 추천 진료과와 질문거리 안내</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Main Active Report Container */}
      {activeReport ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-5 p-5 sm:p-7">
          {/* Top Bar with Score & TTS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex flex-col items-center justify-center font-black">
                <span className="text-2xl leading-none">{activeReport.statusScore}</span>
                <span className="text-[10px] text-teal-800 font-bold">건강점수</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    activeReport.statusLevel === '양호' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    관리 상태: {activeReport.statusLevel}
                  </span>
                  <span className="text-xs text-slate-400">분석일: {activeReport.analysisDate}</span>
                </div>
                <h3 className={`font-black text-slate-900 mt-1 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                  {currentUser.name} 님의 건강관리 진단 종합
                </h3>
              </div>
            </div>

            <button
              onClick={handleSpeak}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-colors shadow-xs ${
                isSpeaking
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-600" />}
              <span>{isSpeaking ? '음성 읽기 중지' : '전체 내용 소리내어 듣기'}</span>
            </button>
          </div>

          {/* Overall Friendly Summary */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 mb-1">AI 주치의 종합 평가 소견</h4>
            <p className={`text-slate-800 font-medium leading-relaxed ${seniorMode ? 'text-xl' : 'text-base sm:text-lg'}`}>
              {activeReport.overallSummary}
            </p>
          </div>

          {/* 2-Column Details: Medication & Vitals Review */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                <Pill className="w-4 h-4 text-amber-600" />
                <span>복약 및 처방약 분석</span>
              </div>
              <p className={`text-slate-700 text-xs sm:text-sm leading-relaxed ${seniorMode ? 'text-base' : ''}`}>
                {activeReport.medicationReview}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-xs sm:text-sm">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>혈압·혈당 측정치 평가</span>
              </div>
              <p className={`text-slate-700 text-xs sm:text-sm leading-relaxed ${seniorMode ? 'text-base' : ''}`}>
                {activeReport.vitalsReview}
              </p>
            </div>
          </div>

          {/* Action Items Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>어르신을 위한 오늘의 건강 실천 과제</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeReport.actionItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-2 text-xs text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium pt-0.5">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Senior Friendly Tip */}
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
            <Heart className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs sm:text-sm text-emerald-950 font-bold">
              💡 {activeReport.seniorFriendlyTip}
            </p>
          </div>

          {/* Medical Disclaimer */}
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            ⚠️ {activeReport.disclaimer}
          </p>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Sparkles className="w-10 h-10 text-teal-600 mx-auto" />
          <p className="font-bold text-slate-800">아직 생성된 AI 리포트가 없습니다.</p>
          <button
            onClick={handleGenerateNewReport}
            className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm"
          >
            지금 건강 분석 시작하기
          </button>
        </div>
      )}
    </div>
  );
};
