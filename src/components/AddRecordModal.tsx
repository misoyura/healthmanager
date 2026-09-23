import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Activity,
  Calendar,
  Pill,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  MedicalVisit,
  VitalSign,
  SymptomLog,
  Appointment,
  Hospital,
} from '../types/health';
import { HealthStorage } from '../services/storage';

interface AddRecordModalProps {
  userId: string;
  hospitals: Hospital[];
  onClose: () => void;
  onSuccess: () => void;
  seniorMode: boolean;
  defaultType?: 'visit' | 'vital' | 'symptom' | 'appointment';
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  userId,
  hospitals,
  onClose,
  onSuccess,
  seniorMode,
  defaultType = 'visit',
}) => {
  const [recordType, setRecordType] = useState<'visit' | 'vital' | 'symptom' | 'appointment'>(defaultType);

  // Visit Form Fields
  const [hospitalName, setHospitalName] = useState(hospitals[0]?.name || '서울아산병원');
  const [department, setDepartment] = useState('내과');
  const [doctor, setDoctor] = useState('담당의');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [details, setDetails] = useState('');
  const [costTotal, setCostTotal] = useState(45000);
  const [costCopay, setCostCopay] = useState(13500);

  // Vital Form Fields
  const [vitalDate, setVitalDate] = useState(new Date().toISOString().split('T')[0]);
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [bloodSugar, setBloodSugar] = useState<number>(100);
  const [sugarType, setSugarType] = useState<'공복' | '식전' | '식후 2시간' | '취침전'>('공복');
  const [weight, setWeight] = useState<number>(70);
  const [vitalNotes, setVitalNotes] = useState('');

  // Symptom Form Fields
  const [symptomDate, setSymptomDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState<'경미함' | '보통' | '심함' | '매우 심함'>('보통');
  const [duration, setDuration] = useState('1시간');
  const [symptomNotes, setSymptomNotes] = useState('');

  // Appointment Form Fields
  const [aptHospital, setAptHospital] = useState(hospitals[0]?.name || '서울아산병원');
  const [aptDept, setAptDept] = useState('순환기내과');
  const [aptDoctor, setAptDoctor] = useState('박준형 교수');
  const [aptDate, setAptDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [aptTime, setAptTime] = useState('10:00');
  const [aptPurpose, setAptPurpose] = useState('정기 외래 진료');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (recordType === 'visit') {
      const newVisit: MedicalVisit = {
        id: `visit-${Date.now()}`,
        userId,
        hospitalId: hospitals.find(h => h.name === hospitalName)?.id || 'hosp-01',
        hospitalName,
        department,
        doctor,
        visitDate,
        purpose: purpose || '일반 진료',
        symptoms,
        details: details || '진료 완료',
        costTotal,
        costCopay,
      };
      HealthStorage.saveVisit(newVisit);

      // Also create matching hospital receipt
      HealthStorage.saveReceipt({
        id: `rec-${Date.now()}`,
        userId,
        visitId: newVisit.id,
        type: 'hospital',
        providerName: hospitalName,
        date: visitDate,
        totalCost: costTotal,
        patientCopay: costCopay,
        insuredAmount: Math.max(0, costTotal - costCopay),
        nonCoveredAmount: 0,
        isClaimed: false,
      });
    } else if (recordType === 'vital') {
      const newVital: VitalSign = {
        id: `vit-${Date.now()}`,
        userId,
        date: vitalDate,
        time: new Date().toTimeString().slice(0, 5),
        bloodPressureSystolic: systolic || undefined,
        bloodPressureDiastolic: diastolic || undefined,
        bloodSugar: bloodSugar || undefined,
        bloodSugarType: sugarType,
        weight: weight || undefined,
        notes: vitalNotes,
      };
      HealthStorage.saveVital(newVital);
    } else if (recordType === 'symptom') {
      const newSymptom: SymptomLog = {
        id: `symp-${Date.now()}`,
        userId,
        date: symptomDate,
        symptom: symptomName || '특이 증상',
        severity,
        duration,
        notes: symptomNotes,
      };
      HealthStorage.saveSymptom(newSymptom);
    } else if (recordType === 'appointment') {
      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        userId,
        hospital: aptHospital,
        department: aptDept,
        doctor: aptDoctor,
        date: aptDate,
        time: aptTime,
        purpose: aptPurpose,
        status: '예약확정',
        reminderEnabled: true,
      };
      HealthStorage.saveAppointment(newApt);
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl' : 'text-lg'}`}>
            새 건강·의료 기록 등록
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Record Type Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setRecordType('visit')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              recordType === 'visit' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>병원 진료</span>
          </button>
          <button
            type="button"
            onClick={() => setRecordType('vital')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              recordType === 'vital' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>혈압·혈당</span>
          </button>
          <button
            type="button"
            onClick={() => setRecordType('symptom')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              recordType === 'symptom' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>증상일지</span>
          </button>
          <button
            type="button"
            onClick={() => setRecordType('appointment')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
              recordType === 'appointment' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>병원예약</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto max-h-[70vh]">
          {/* Visit Form */}
          {recordType === 'visit' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">병원명</label>
                  <input
                    type="text"
                    required
                    value={hospitalName}
                    onChange={e => setHospitalName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">진료과</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">진료일</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">담당 의사</label>
                  <input
                    type="text"
                    value={doctor}
                    onChange={e => setDoctor(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">방문 목적</label>
                <input
                  type="text"
                  placeholder="예: 정기 3개월 혈압약 처방 및 검사"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">의사 진료 소견</label>
                <textarea
                  rows={2}
                  placeholder="진료 내용이나 전달받은 주의사항을 적어주세요."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">총 진료비 (원)</label>
                  <input
                    type="number"
                    value={costTotal}
                    onChange={e => setCostTotal(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">환자 본인부담금 (원)</label>
                  <input
                    type="number"
                    value={costCopay}
                    onChange={e => setCostCopay(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-rose-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* Vital Form */}
          {recordType === 'vital' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">측정일</label>
                <input
                  type="date"
                  value={vitalDate}
                  onChange={e => setVitalDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">수축기 혈압 (최고)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={systolic}
                    onChange={e => setSystolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">이완기 혈압 (최저)</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={diastolic}
                    onChange={e => setDiastolic(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">혈당 (mg/dL)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={bloodSugar}
                    onChange={e => setBloodSugar(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">측정 시점</label>
                  <select
                    value={sugarType}
                    onChange={e => setSugarType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="공복">공복 (기상 직후)</option>
                    <option value="식전">식전</option>
                    <option value="식후 2시간">식후 2시간</option>
                    <option value="취침전">취침전</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">메모</label>
                <input
                  type="text"
                  placeholder="예: 기상 후 측정, 가벼운 스트레칭 후"
                  value={vitalNotes}
                  onChange={e => setVitalNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </>
          )}

          {/* Symptom Form */}
          {recordType === 'symptom' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">발생일</label>
                <input
                  type="date"
                  value={symptomDate}
                  onChange={e => setSymptomDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">증상 명칭</label>
                <input
                  type="text"
                  required
                  placeholder="예: 오른쪽 무릎 쑤심 및 계단 보행 시 통증"
                  value={symptomName}
                  onChange={e => setSymptomName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">불편한 정도</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="경미함">경미함</option>
                    <option value="보통">보통</option>
                    <option value="심함">심함</option>
                    <option value="매우 심함">매우 심함</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">지속 시간</label>
                  <input
                    type="text"
                    placeholder="예: 약 2시간"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">특이사항 및 대처</label>
                <textarea
                  rows={2}
                  placeholder="예: 온찜질 20분 후 통증 완화됨."
                  value={symptomNotes}
                  onChange={e => setSymptomNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </>
          )}

          {/* Appointment Form */}
          {recordType === 'appointment' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">예약 병원</label>
                  <input
                    type="text"
                    required
                    value={aptHospital}
                    onChange={e => setAptHospital(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">진료과</label>
                  <input
                    type="text"
                    required
                    value={aptDept}
                    onChange={e => setAptDept(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">예약일</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={e => setAptDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">예약 시간</label>
                  <input
                    type="time"
                    required
                    value={aptTime}
                    onChange={e => setAptTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">담당 의사</label>
                <input
                  type="text"
                  value={aptDoctor}
                  onChange={e => setAptDoctor(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">방문 목적 및 사전 검사</label>
                <input
                  type="text"
                  placeholder="예: 혈액검사 2시간 전 공복 채혈 후 외래"
                  value={aptPurpose}
                  onChange={e => setAptPurpose(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
