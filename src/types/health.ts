/**
 * Database Types & Models for AI Health Manager (AI 건강·의료 통합관리)
 * 18 Core Integrated Medical & Health Entities
 */

// 01. 사용자관리
export interface User {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: '남성' | '여성';
  phone: string;
  email: string;
  familyRole: '본인' | '어머니' | '아버지' | '배우자' | '자녀' | '기타';
  guardianInfo?: {
    name: string;
    relationship: string;
    phone: string;
  };
  isDefault?: boolean;
}

// 02. 건강프로필
export interface HealthProfile {
  id: string;
  userId: string;
  height: number; // cm
  weight: number; // kg
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '기타';
  allergies: string[]; // e.g. 페니실린, 아스피린, 땅콩 등
  currentMedications: string[]; // 요약 문자열 리스트
  chronicDiseases: string[]; // 기저질환 (고혈압, 당뇨 등)
  pastConditions: string[]; // 과거질환 (위궤양 등)
  surgeries: string[]; // 수술이력 (백내장, 무릎관절 등)
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
}

// 03. 병원관리
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  department: string; // 진료과 (순환기내과, 정형외과 등)
  doctor: string;
  specialities: string[];
}

// 04. 진료관리
export interface MedicalVisit {
  id: string;
  userId: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctor: string;
  visitDate: string; // YYYY-MM-DD
  purpose: string; // 방문목적 (정기검진, 통증, 감기 등)
  symptoms: string; // 호소 증상
  details: string; // 진료내용
  examDetails?: string; // 시행된 검사내용
  examResults?: string; // 검사결과 요약
  nextVisitDate?: string; // 다음 외래 예정일
  costTotal: number; // 총 진료비 (원)
  costCopay: number; // 본인부담금 (원)
}

// 05. 질병관리
export interface Disease {
  id: string;
  userId: string;
  visitId?: string;
  name: string; // 질병명 (예: 본태성 고혈압, 제2형 당뇨병)
  code: string; // 질병코드 (KCD e.g. I10, E11.9, M17)
  firstDiagnosisDate: string;
  hospital: string;
  currentStatus: '관리중' | '치료중' | '완치' | '정기추적' | '경과관찰';
  pastHistory?: string;
}

// 06. 처방전관리
export interface Prescription {
  id: string;
  userId: string;
  visitId: string;
  prescribeDate: string; // 처방일
  hospital: string;
  doctor: string;
  details: string;
  imageUrl?: string;
  medicationCount?: number;
}

// 07. 약품·복용관리
export interface Medication {
  id: string;
  prescriptionId: string;
  name: string; // 약품명
  dosagePerTake: string; // 1회 복용량 (예: 1정)
  dailyFrequency: number; // 1일 복용횟수 (예: 1회, 2회, 3회)
  durationDays: number; // 복용기간 (일)
  takeTimes: ('아침' | '점심' | '저녁' | '취침전')[];
  howToTake: string; // 식후 30분, 식전 30분 등
  isTaking: boolean; // 현재 복용 여부
  startDate: string;
  endDate: string;
  sideEffects?: string;
  precaution?: string;
}

// 08. 약국관리
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  dispenseDate: string;
  prescriptionId?: string;
  dispenseDetails: string;
  instruction: string; // 복약지도
}

// 09. 영수증관리 (병원영수증 + 약국영수증 통합)
export interface Receipt {
  id: string;
  userId: string;
  visitId?: string;
  prescriptionId?: string;
  type: 'hospital' | 'pharmacy'; // 병원영수증 or 약국영수증
  providerName: string; // 병원명 or 약국명
  date: string; // 진료일 or 조제일
  totalCost: number; // 총 진료/조제비
  patientCopay: number; // 본인부담금
  insuredAmount: number; // 건강보험 공단부담금
  nonCoveredAmount: number; // 비급여
  imageUrl?: string;
  ocrData?: string;
  isClaimed?: boolean; // 실손보험 청구 여부
}

// 10. 보험관리
export interface Insurance {
  id: string;
  userId: string;
  insurer: string; // 삼성화재, 현대해상, KB손보 등
  productName: string; // 무배당 실손의료비보장보험 등
  policyNumber: string; // 증권번호
  startDate: string;
  endDate: string;
  premium: number; // 월 보험료
  coverageDetails: string; // 입원의료비 5000만원, 통원의료비 25만원 한도 등
  coverageAmount: number;
  insuredPerson: string;
}

// 11. 실손보험 청구관리
export interface InsuranceClaim {
  id: string;
  userId: string;
  insuranceId: string;
  insuranceName: string;
  visitId?: string;
  claimDate: string; // 청구일
  claimAmount: number; // 청구금액
  paidAmount: number; // 지급금액 (입금액)
  copayAmount: number; // 공제금액(자기부담금)
  status: '접수완료' | '서류심사중' | '지급완료' | '보완요청' | '반려';
  paidDate?: string;
  documents: {
    receipt: boolean; // 진료비 영수증
    itemizedBill: boolean; // 진료비 세부내역서
    prescription: boolean; // 처방전
    medicalCertificate?: boolean; // 진단서/확인서
  };
  notes?: string;
}

// 12. 예약·일정관리
export interface Appointment {
  id: string;
  userId: string;
  hospital: string;
  department: string;
  doctor: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  purpose: string;
  examReservation?: string; // 동반 검사 예약 (혈액검사, CT, 심전도 등)
  status: '예약확정' | '진료완료' | '취소됨';
  reminderEnabled: boolean;
}

// 13. 건강검진관리
export interface HealthCheckup {
  id: string;
  userId: string;
  date: string;
  institution: string; // 서울아산병원 건강증진센터 등
  checkupType: '국가일반검진' | '국가암검진' | '생애전환기검진' | '종합정밀검진';
  mainResults: string;
  abnormalFindings: string[]; // 이상소견 항목
  nextCheckupDate: string;
  fileUrl?: string;
}

// 14. 검사결과관리
export interface LabTest {
  id: string;
  userId: string;
  visitId?: string;
  testName: string; // 혈액검사(당화혈색소 HbA1c), 간기능(AST/ALT), 지질(콜레스테롤), 심전도 등
  testDate: string;
  resultValue: string; // e.g. "6.4%", "128/82 mmHg", "185 mg/dL"
  normalRange: string; // e.g. "4.0 ~ 5.6%"
  status: '정상' | '주의' | '이상소견';
  doctorOpinion?: string;
  fileUrl?: string;
}

// 15. 건강측정관리
export interface VitalSign {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  bloodPressureSystolic?: number; // 수축기 (mmHg)
  bloodPressureDiastolic?: number; // 이완기 (mmHg)
  bloodSugar?: number; // 혈당 (mg/dL)
  bloodSugarType?: '공복' | '식전' | '식후 2시간' | '취침전';
  weight?: number; // kg
  temperature?: number; // 체온 (℃)
  oxygenSaturation?: number; // 산소포화도 (%)
  heartRate?: number; // 심박수 (bpm)
  notes?: string;
}

// 16. 복약알림관리
export interface MedicationReminder {
  id: string;
  userId: string;
  medicationId: string;
  medName: string;
  timeSlot: '아침' | '점심' | '저녁' | '취침전';
  reminderTime: string; // HH:mm
  frequency: string;
  isTakenToday: boolean;
  takenHistory: { date: string; time: string; taken: boolean }[];
  streakDays: number;
}

// 17. 증상일지
export interface SymptomLog {
  id: string;
  userId: string;
  date: string;
  symptom: string;
  severity: '경미함' | '보통' | '심함' | '매우 심함';
  duration: string; // 2시간, 반나절, 3일 등
  notes: string;
  imageUrl?: string;
  relatedDisease?: string;
  relatedMedication?: string;
}

// 18. AI 건강분석
export interface AIHealthAnalysis {
  id: string;
  userId: string;
  analysisDate: string;
  statusScore: number;
  statusLevel: '양호' | '주의' | '집중관리';
  overallSummary: string;
  medicationReview: string;
  vitalsReview: string;
  actionItems: string[];
  upcomingCheckpoints: string;
  seniorFriendlyTip: string;
  disclaimer: string;
}

// Aggregated Unified Medical Record (한눈에 보는 종합 묶음: 병원 -> 진료 -> 질병 -> 처방/약 -> 영수증 -> 보험청구)
export interface UnifiedMedicalRecord {
  visit: MedicalVisit;
  hospital?: Hospital;
  disease?: Disease;
  prescription?: Prescription;
  medications: Medication[];
  pharmacy?: Pharmacy;
  hospitalReceipt?: Receipt;
  pharmacyReceipt?: Receipt;
  insuranceClaim?: InsuranceClaim;
}
