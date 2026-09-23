import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Home,
  BookOpen,
  Send,
} from 'lucide-react';
import { AIService, SymptomConsultResponse } from '../services/aiService';
import { User, HealthProfile } from '../types/health';

interface SymptomConsultModalProps {
  currentUser: User;
  profile?: HealthProfile;
  onClose: () => void;
  seniorMode: boolean;
}

const QUICK_SYMPTOM_PRESETS = [
  '앉았다 일어날 때 핑 돌면서 어지러워요',
  '무릎이 쑤시고 계단 내려갈 때 찌릿해요',
  '식사하고 나면 속이 쓰리고 신물이 올라와요',
  '목이 간지럽고 마른 기침이 자주 나요',
  '밤에 자다가 소변이 마려워 2~3번씩 깨요',
  '가슴이 두근거리고 가끔 답답한 느낌이 들어요',
];

export const SymptomConsultModal: React.FC<SymptomConsultModalProps> = ({
  currentUser,
  profile,
  onClose,
  seniorMode,
}) => {
  const [symptomText, setSymptomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomConsultResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const calculateAge = (birthDate: string): number => {
    const year = parseInt(birthDate.slice(0, 4), 10);
    return new Date().getFullYear() - year;
  };

  const handleConsult = async (queryText?: string) => {
    const textToSubmit = queryText || symptomText;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await AIService.consultSymptom({
        symptomText: textToSubmit,
        age: calculateAge(currentUser.birthDate),
        gender: currentUser.gender,
        chronicDiseases: profile?.chronicDiseases || [],
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!result) return;
    if (isSpeaking) {
      AIService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechText = `
${currentUser.name} 어르신, ${result.gentleExplanation}
추천해 드리는 진료과는 ${result.departmentRecommendation}입니다.
병원에 방문하시면 의사선생님께 다음과 같이 여쭤보세요.
첫째, ${result.questionsForDoctor[0] || ''}
둘째, ${result.questionsForDoctor[1] || ''}
집에서는 ${result.homeCareTips.join(', ')}를 실천해 보세요.
`;
    setIsSpeaking(true);
    AIService.speakText(speechText, () => setIsSpeaking(false));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-slate-200 animate-in fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl' : 'text-xl'}`}>
                시니어 AI 증상 상담 & 진료과 추천
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                불편하신 증상을 말씀하시면 알맞은 병원 진료과와 질문거리를 알려드립니다
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 max-h-[80vh]">
          {/* Patient Quick Info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-700">{currentUser.name} ({currentUser.familyRole})</span>
            <span>·</span>
            <span>{calculateAge(currentUser.birthDate)}세 {currentUser.gender}</span>
            {profile?.chronicDiseases && profile.chronicDiseases.length > 0 && (
              <>
                <span>·</span>
                <span className="text-teal-700 font-medium">기저질환: {profile.chronicDiseases.join(', ')}</span>
              </>
            )}
          </div>

          {/* Symptom Input Form */}
          <div className="space-y-2">
            <label className={`block font-bold text-slate-800 ${seniorMode ? 'text-base' : 'text-xs'}`}>
              어디가 어떻게 불편하신가요?
            </label>
            <div className="relative">
              <textarea
                value={symptomText}
                onChange={e => setSymptomText(e.target.value)}
                placeholder="예: 어제부터 아침에 일어날 때 머리가 어질어질하고 속이 울렁거려요."
                rows={3}
                className={`w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden ${
                  seniorMode ? 'text-lg placeholder:text-base' : 'text-sm'
                }`}
              />
              <button
                type="button"
                onClick={() => handleConsult()}
                disabled={loading || !symptomText.trim()}
                className="absolute right-2.5 bottom-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? '분석중...' : '상담하기'}</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-1.5">자주 호소하시는 증상 예시:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SYMPTOM_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSymptomText(preset);
                      handleConsult(preset);
                    }}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-8 text-center bg-teal-50/60 rounded-xl border border-teal-100 space-y-2">
              <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-teal-900 text-sm">
                어르신의 건강 상태와 증상을 따뜻하게 살펴보고 있습니다...
              </p>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white space-y-4 shadow-sm animate-in fade-in">
              {/* Top Bar with TTS */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">AI 권장 진료과:</span>
                  <span className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm sm:text-base font-black shadow-xs">
                    {result.departmentRecommendation}
                  </span>
                  {result.secondaryDepartment && (
                    <span className="text-xs text-slate-500">
                      (또는 {result.secondaryDepartment})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSpeak}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isSpeaking
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? '듣기 중지' : '음성으로 듣기'}</span>
                </button>
              </div>

              {/* Gentle Explanation */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className={`text-slate-800 leading-relaxed font-medium ${seniorMode ? 'text-lg' : 'text-sm'}`}>
                  {result.gentleExplanation}
                </p>
              </div>

              {/* Questions for Doctor */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs sm:text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>병원 방문 시 의사선생님께 드릴 질문 3가지</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 pl-1">
                  {result.questionsForDoctor.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                      <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Home Care */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs sm:text-sm">
                  <Home className="w-4 h-4" />
                  <span>가정에서 실천할 수 있는 안전한 대처법</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600 pl-1">
                  {result.homeCareTips.map((tip, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Medical Terms Explained */}
              {result.medicalTermsExplained && result.medicalTermsExplained.length > 0 && (
                <div className="space-y-1.5 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>알기 쉬운 의학용어 풀이</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {result.medicalTermsExplained.map((item, idx) => (
                      <p key={idx} className="text-slate-700">
                        <strong className="text-amber-900">[{item.term}]</strong> : {item.easyMeaning}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                ⚠️ {result.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
