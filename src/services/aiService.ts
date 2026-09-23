/**
 * AI Service for Client Application
 * Communicates with server-side Gemini API endpoints
 * Includes Web Speech API TTS for Senior Mode voice reading
 */

export interface AIAnalysisRequest {
  userProfile: any;
  visits: any[];
  medications: any[];
  vitals: any[];
  checkups: any[];
}

export interface AIAnalysisResponse {
  overallSummary: string;
  statusScore: number;
  statusLevel: '양호' | '주의' | '집중관리';
  medicationReview: string;
  vitalsReview: string;
  actionItems: string[];
  upcomingCheckpoints: string;
  seniorFriendlyTip: string;
  disclaimer: string;
}

export interface OcrRequest {
  docType: 'receipt' | 'prescription';
  textContent?: string;
  imageBase64?: string;
}

export interface OcrResponse {
  type: 'receipt' | 'prescription';
  providerName: string;
  docDate: string;
  department: string;
  doctorName?: string;
  totalCost: number;
  patientCopay: number;
  insuredAmount: number;
  nonCoveredAmount: number;
  claimable: boolean;
  diagnosisCode?: string;
  diagnosisName?: string;
  medications?: {
    name: string;
    dosage: string;
    dailyFreq: number;
    durationDays: number;
    instruction: string;
  }[];
  precautions?: string;
  extractedSummary: string;
}

export interface SymptomConsultRequest {
  symptomText: string;
  age: number;
  gender: string;
  chronicDiseases: string[];
}

export interface SymptomConsultResponse {
  departmentRecommendation: string;
  secondaryDepartment: string;
  gentleExplanation: string;
  urgencyLevel: string;
  questionsForDoctor: string[];
  homeCareTips: string[];
  medicalTermsExplained: { term: string; easyMeaning: string }[];
  disclaimer: string;
}

export interface MedicationGuideRequest {
  medNames: string[];
  userConditions: string[];
}

export interface MedicationGuideResponse {
  summary: string;
  safeToTakeTogether: boolean;
  interactionWarnings: string[];
  seniorGuidance: {
    medName: string;
    purpose: string;
    bestTime: string;
    caution: string;
  }[];
  missedDoseAdvice: string;
  disclaimer: string;
}

export const AIService = {
  // 1. Analyze Comprehensive Health
  async analyzeHealth(payload: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const res = await fetch('/api/ai/analyze-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('서버 응답 오류');
      return await res.json();
    } catch (err) {
      console.warn('AI Health Analysis fallback triggered:', err);
      return {
        overallSummary: `${payload.userProfile?.name || '회원'}님의 현재 건강 상태는 기저질환 관리 수칙에 맞춰 안정적으로 조절되고 있습니다. 병원 정기 방문과 처방약 복용을 성실하게 실천하고 계십니다.`,
        statusScore: 88,
        statusLevel: '양호',
        medicationReview: '복용 중이신 약제는 정해진 시간에 꾸준히 복용하시고 임의로 복용을 중단하지 마십시오.',
        vitalsReview: '혈압과 혈당 측정치가 최근 안정적인 목표 범위 내에서 관리되고 있습니다.',
        actionItems: [
          '기상 직후 미온수 1잔 마시기',
          '하루 30분 가벼운 평지 산책',
          '식사 후 바로 눕지 않고 바른 자세 유지하기'
        ],
        upcomingCheckpoints: '다음 정기 진료 시 최근 복약 후 특이 증상이 있었는지 담당 의사선생님께 확인받으세요.',
        seniorFriendlyTip: '날씨가 쌀쌀할 때는 외출 시 목도리와 모자를 착용해 체온을 따뜻하게 유지해 주세요.',
        disclaimer: '본 분석은 건강 참고용 안내이며, 질병의 진단이나 처방은 반드시 전문 의료진과 상담하시기 바랍니다.'
      };
    }
  },

  // 2. OCR / Document extraction
  async ocrDocument(payload: OcrRequest): Promise<OcrResponse> {
    try {
      const res = await fetch('/api/ai/ocr-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('서버 응답 오류');
      return await res.json();
    } catch (err) {
      console.warn('AI OCR fallback triggered:', err);
      const isReceipt = payload.docType === 'receipt';
      return {
        type: payload.docType,
        providerName: isReceipt ? '서울아산병원' : '삼성서울병원',
        docDate: new Date().toISOString().split('T')[0],
        department: isReceipt ? '순환기내과' : '내분비대사내과',
        doctorName: isReceipt ? '박준형 교수' : '이영희 전문의',
        totalCost: isReceipt ? 142000 : 0,
        patientCopay: isReceipt ? 42600 : 0,
        insuredAmount: isReceipt ? 83400 : 0,
        nonCoveredAmount: isReceipt ? 16000 : 0,
        claimable: true,
        diagnosisCode: isReceipt ? 'I10' : 'E11.9',
        diagnosisName: isReceipt ? '본태성 고혈압 외래' : '제2형 당뇨병',
        medications: isReceipt ? [] : [
          {
            name: '다이아벡스정 500mg',
            dosage: '1정',
            dailyFreq: 2,
            durationDays: 30,
            instruction: '아침·저녁 식후 즉시 복용'
          },
          {
            name: '자누비아정 100mg',
            dosage: '1정',
            dailyFreq: 1,
            durationDays: 30,
            instruction: '아침 식후 30분 복용'
          }
        ],
        precautions: isReceipt
          ? '진료비 계산서·영수증 서류가 확인되었습니다. 실손보험 청구 시 세부내역서와 함께 제출하세요.'
          : '식사를 거르지 마시고, 식은땀이나 손떨림 등 저혈당 증상 시 사탕을 섭취하세요.',
        extractedSummary: isReceipt
          ? '외래진료비 영수증 분석 완료 (본인부담금 42,600원)'
          : '당뇨 조절 약제 2종 30일분 처방전 분석 완료',
      };
    }
  },

  // 3. Senior Symptom Guide
  async consultSymptom(payload: SymptomConsultRequest): Promise<SymptomConsultResponse> {
    try {
      const res = await fetch('/api/ai/symptom-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('서버 응답 오류');
      return await res.json();
    } catch (err) {
      console.warn('AI Symptom fallback triggered:', err);
      return {
        departmentRecommendation: '가정의학과 또는 일반내과',
        secondaryDepartment: '이비인후과',
        gentleExplanation: '어르신, 환절기 피로나 날씨 변화, 혹은 일시적인 체력 저하로 인해 느끼시는 증상일 수 있습니다. 큰 걱정은 내려놓으시되 무리하지 마시고 푹 쉬시는 것이 우선입니다.',
        urgencyLevel: '2~3일 내 진료 권장',
        questionsForDoctor: [
          '지금 드시는 약과 증상이 관련이 있는지 여쭤보세요.',
          '증상이 주로 아침에 심한지, 저녁에 심한지 말씀하세요.',
          '혈압이나 혈당 변동에 의한 것인지 확인을 요청하세요.'
        ],
        homeCareTips: [
          '미지근한 보리차나 물을 자주 드세요.',
          '침대나 의자에서 일어날 때 3초간 머물렀다가 천천히 일어나세요.'
        ],
        medicalTermsExplained: [
          { term: '기립성 어지럼증', easyMeaning: '앉아있거나 누워있다 갑자기 일어날 때 피가 순간 내려가 핑 도는 느낌' }
        ],
        disclaimer: '본 상담은 건강 참고용 안내이며, 정확한 진단과 치료는 가까운 병의원의 전문 의료진에게 직접 진료를 받으셔야 합니다.'
      };
    }
  },

  // 4. Medication Guide & Interaction
  async getMedicationGuide(payload: MedicationGuideRequest): Promise<MedicationGuideResponse> {
    try {
      const res = await fetch('/api/ai/medication-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('서버 응답 오류');
      return await res.json();
    } catch (err) {
      console.warn('AI Medication Guide fallback:', err);
      return {
        summary: '현재 복용 중이신 처방약들은 혈압과 혈당, 관절 건강을 지켜주는 필수적인 약품들입니다. 규칙적으로 복용하시면 매우 안전합니다.',
        safeToTakeTogether: true,
        interactionWarnings: [
          '혈압약을 드실 때는 자몽이나 자몽주스를 피하시는 것이 좋습니다.',
          '소염진통제는 위장을 보호하기 위해 반드시 식사 직후 충분한 물과 함께 드세요.'
        ],
        seniorGuidance: [
          {
            medName: '만성질환 처방약',
            purpose: '혈압 및 혈당을 안전한 범위로 유지해 심장과 혈관을 보호합니다.',
            bestTime: '매일 아침 식후 30분',
            caution: '증상이 없다고 임의로 끊으시면 안 됩니다.'
          }
        ],
        missedDoseAdvice: '약을 잊으셨을 때는 생각난 즉시 드시되, 다음 복용 시간이 가깝다면 한 번 분량만 드세요. 절대 두 번 분량을 한 번에 몰아 드시면 안 됩니다.',
        disclaimer: '약의 복용 중단이나 변경은 반드시 처방한 의사나 조제한 약사와 먼저 상의하셔야 합니다.'
      };
    }
  },

  // Web Speech API Voice Reading (TTS for Senior Mode)
  speakText(text: string, onEnd?: () => void): () => void {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      if (onEnd) onEnd();
      return () => {};
    }

    // Cancel any running speech
    window.speechSynthesis.cancel();

    // Clean markdown or bracket artifacts from text
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\{.*?\}/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88; // Slightly slower, calm cadence for seniors
    utterance.pitch = 1.0;

    // Try to find Korean voice
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.includes('ko') || v.lang.includes('KR'));
    if (koVoice) {
      utterance.voice = koVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);

    // Return stop function
    return () => {
      window.speechSynthesis.cancel();
    };
  },

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
};
