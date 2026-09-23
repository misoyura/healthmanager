import React, { useState, useEffect, useRef } from 'react';
import { HealthStorage } from './services/storage';
import { AIService } from './services/aiService';
import {
  User,
  HealthProfile,
  Hospital,
  MedicalVisit,
  Disease,
  Prescription,
  Medication,
  Pharmacy,
  Receipt,
  Insurance,
  InsuranceClaim,
  Appointment,
  HealthCheckup,
  LabTest,
  VitalSign,
  MedicationReminder,
  SymptomLog,
  AIHealthAnalysis,
  UnifiedMedicalRecord,
} from './types/health';

import { Header } from './components/Header';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { VisitsView } from './components/VisitsView';
import { MedicationsView } from './components/MedicationsView';
import { FinanceView } from './components/FinanceView';
import { VitalsView } from './components/VitalsView';
import { AIReportView } from './components/AIReportView';
import { ProfileFamilyView } from './components/ProfileFamilyView';

import { MedicalDetailModal } from './components/MedicalDetailModal';
import { ClaimWizardModal } from './components/ClaimWizardModal';
import { OcrScannerModal } from './components/OcrScannerModal';
import { SymptomConsultModal } from './components/SymptomConsultModal';
import { AddRecordModal } from './components/AddRecordModal';

export function App() {
  // Global State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-01');

  // Loaded Data from HealthStorage
  const [users, setUsers] = useState<User[]>([]);
  const [profile, setProfile] = useState<HealthProfile | undefined>(undefined);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [insuranceList, setInsuranceList] = useState<Insurance[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [checkups, setCheckups] = useState<HealthCheckup[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [aiReports, setAiReports] = useState<AIHealthAnalysis[]>([]);
  const [unifiedRecords, setUnifiedRecords] = useState<UnifiedMedicalRecord[]>([]);

  // Modals state
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<UnifiedMedicalRecord | null>(null);
  const [showClaimWizard, setShowClaimWizard] = useState<boolean>(false);
  const [selectedRecordForClaim, setSelectedRecordForClaim] = useState<UnifiedMedicalRecord | null>(null);
  const [showOcrModal, setShowOcrModal] = useState<boolean>(false);
  const [showSymptomModal, setShowSymptomModal] = useState<boolean>(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState<boolean>(false);
  const [addRecordDefaultType, setAddRecordDefaultType] = useState<'visit' | 'vital' | 'symptom' | 'appointment'>('visit');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load all data
  const loadData = () => {
    const uid = HealthStorage.getCurrentUserId();
    setCurrentUserId(uid);
    setSeniorMode(HealthStorage.getSeniorMode());

    const loadedUsers = HealthStorage.getUsers();
    setUsers(loadedUsers);
    setProfile(HealthStorage.getProfileByUserId(uid));
    setHospitals(HealthStorage.getHospitals());
    setVisits(HealthStorage.getVisitsByUserId(uid));
    setDiseases(HealthStorage.getDiseasesByUserId(uid));
    setPrescriptions(HealthStorage.getPrescriptionsByUserId(uid));
    setMedications(HealthStorage.getMedications());
    setPharmacies(HealthStorage.getPharmacies());
    setReceipts(HealthStorage.getReceiptsByUserId(uid));
    setInsuranceList(HealthStorage.getInsuranceByUserId(uid));
    setClaims(HealthStorage.getClaimsByUserId(uid));
    setAppointments(HealthStorage.getAppointmentsByUserId(uid));
    setCheckups(HealthStorage.getCheckupsByUserId(uid));
    setLabTests(HealthStorage.getLabTestsByUserId(uid));
    setVitals(HealthStorage.getVitalsByUserId(uid));
    setReminders(HealthStorage.getRemindersByUserId(uid));
    setSymptoms(HealthStorage.getSymptomsByUserId(uid));
    setAiReports(HealthStorage.getAIReportsByUserId(uid));
    setUnifiedRecords(HealthStorage.getUnifiedRecords(uid));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectUser = (uid: string) => {
    HealthStorage.setCurrentUserId(uid);
    setCurrentUserId(uid);
    loadData();
  };

  const handleToggleSeniorMode = () => {
    const next = !seniorMode;
    setSeniorMode(next);
    HealthStorage.setSeniorMode(next);
  };

  const handleStopSpeaking = () => {
    AIService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleToggleReminder = (reminderId: string, currentStatus: boolean) => {
    HealthStorage.toggleReminderTaken(reminderId, currentStatus);
    setReminders(HealthStorage.getRemindersByUserId(currentUserId));
  };

  const handleExportData = () => {
    const jsonStr = HealthStorage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Health_Manager_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (HealthStorage.importData(content)) {
        loadData();
        alert('데이터가 성공적으로 복원되었습니다.');
      } else {
        alert('올바른 백업 JSON 파일 형식이 아닙니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    if (window.confirm('정말 모든 데이터를 초기 기본 데이터로 리셋하시겠습니까?')) {
      HealthStorage.resetToInitial();
      loadData();
      alert('초기 데이터로 재설정되었습니다.');
    }
  };

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || {
    id: 'usr-01',
    name: '홍길동',
    birthDate: '1956-03-15',
    gender: '남성',
    familyRole: '본인',
    phone: '010-3849-2918',
    isDefault: true,
  };

  const unclaimedReceiptsCount = receipts.filter(r => !r.isClaimed).length;
  const activeMedsCount = medications.filter(m => m.isTaking).length;
  const upcomingAptCount = appointments.filter(a => a.status === '예약확정' && new Date(a.date) >= new Date()).length;

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 ${
      seniorMode ? 'senior-mode text-base sm:text-lg' : 'text-sm'
    }`}>
      {/* Hidden File Input for Data Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* App Header */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onAddUser={() => {
          setActiveTab('profile');
        }}
        seniorMode={seniorMode}
        onToggleSeniorMode={handleToggleSeniorMode}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        onExportData={handleExportData}
        onImportData={handleImportClick}
        onResetData={handleResetData}
        onOpenSymptomConsult={() => setShowSymptomModal(true)}
        onOpenOcr={() => setShowOcrModal(true)}
      />

      {/* Navigation Tab Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        seniorMode={seniorMode}
        activeMedicationCount={activeMedsCount}
        unclaimedReceiptCount={unclaimedReceiptsCount}
        upcomingAppointmentCount={upcomingAptCount}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            records={unifiedRecords}
            reminders={reminders}
            appointments={appointments}
            latestAIReport={aiReports[0]}
            seniorMode={seniorMode}
            onSelectRecord={(rec) => setSelectedRecordForDetail(rec)}
            onToggleReminder={handleToggleReminder}
            onOpenClaimWizard={(rec) => {
              setSelectedRecordForClaim(rec || null);
              setShowClaimWizard(true);
            }}
            onOpenOcr={() => setShowOcrModal(true)}
            onOpenSymptomConsult={() => setShowSymptomModal(true)}
            onOpenAddRecord={(type) => {
              setAddRecordDefaultType(type);
              setShowAddRecordModal(true);
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'visits' && (
          <VisitsView
            currentUser={currentUser}
            records={unifiedRecords}
            hospitals={hospitals}
            diseases={diseases}
            labTests={labTests}
            seniorMode={seniorMode}
            onSelectRecord={(rec) => setSelectedRecordForDetail(rec)}
            onOpenAddRecord={(type) => {
              setAddRecordDefaultType(type);
              setShowAddRecordModal(true);
            }}
          />
        )}

        {activeTab === 'meds' && (
          <MedicationsView
            currentUser={currentUser}
            prescriptions={prescriptions}
            medications={medications}
            pharmacies={pharmacies}
            reminders={reminders}
            seniorMode={seniorMode}
            onToggleReminder={handleToggleReminder}
            onOpenOcr={() => setShowOcrModal(true)}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceView
            currentUser={currentUser}
            receipts={receipts}
            insuranceList={insuranceList}
            claims={claims}
            records={unifiedRecords}
            seniorMode={seniorMode}
            onOpenClaimWizard={(rec) => {
              setSelectedRecordForClaim(rec || null);
              setShowClaimWizard(true);
            }}
            onOpenOcr={() => setShowOcrModal(true)}
          />
        )}

        {activeTab === 'vitals' && (
          <VitalsView
            currentUser={currentUser}
            vitals={vitals}
            checkups={checkups}
            symptoms={symptoms}
            seniorMode={seniorMode}
            onOpenAddRecord={(type) => {
              setAddRecordDefaultType(type);
              setShowAddRecordModal(true);
            }}
          />
        )}

        {activeTab === 'ai' && (
          <AIReportView
            currentUser={currentUser}
            profile={profile}
            records={unifiedRecords}
            vitals={vitals}
            checkups={checkups}
            reports={aiReports}
            seniorMode={seniorMode}
            onOpenOcr={() => setShowOcrModal(true)}
            onOpenSymptomConsult={() => setShowSymptomModal(true)}
            onReportGenerated={(rep) => {
              setAiReports(HealthStorage.getAIReportsByUserId(currentUserId));
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileFamilyView
            currentUser={currentUser}
            users={users}
            profile={profile}
            seniorMode={seniorMode}
            onSelectUser={handleSelectUser}
            onRefreshData={loadData}
            onExportData={handleExportData}
            onImportData={handleImportClick}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">AI 건강·의료 통합관리 (AI Health Manager)</span>
            <span>·</span>
            <span>시니어 친화 안심 헬스케어</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-400">
            <p>개인 의료정보는 기기 내에 암호화되어 안전하게 보관됩니다.</p>
            <p>본 서비스의 AI 분석은 참고용이며, 정확한 진단과 처방은 전문 의료진과 상의하세요.</p>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      {selectedRecordForDetail && (
        <MedicalDetailModal
          record={selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
          seniorMode={seniorMode}
          onClaimInsurance={(rec) => {
            setSelectedRecordForDetail(null);
            setSelectedRecordForClaim(rec);
            setShowClaimWizard(true);
          }}
        />
      )}

      {showClaimWizard && (
        <ClaimWizardModal
          userId={currentUserId}
          selectedRecord={selectedRecordForClaim}
          records={unifiedRecords}
          insuranceList={insuranceList}
          onClose={() => {
            setShowClaimWizard(false);
            setSelectedRecordForClaim(null);
          }}
          onSuccess={() => {
            setShowClaimWizard(false);
            setSelectedRecordForClaim(null);
            loadData();
          }}
          seniorMode={seniorMode}
        />
      )}

      {showOcrModal && (
        <OcrScannerModal
          userId={currentUserId}
          onClose={() => setShowOcrModal(false)}
          onSuccess={() => {
            setShowOcrModal(false);
            loadData();
          }}
          seniorMode={seniorMode}
        />
      )}

      {showSymptomModal && (
        <SymptomConsultModal
          currentUser={currentUser}
          profile={profile}
          onClose={() => setShowSymptomModal(false)}
          seniorMode={seniorMode}
        />
      )}

      {showAddRecordModal && (
        <AddRecordModal
          userId={currentUserId}
          hospitals={hospitals}
          defaultType={addRecordDefaultType}
          onClose={() => setShowAddRecordModal(false)}
          onSuccess={() => {
            setShowAddRecordModal(false);
            loadData();
          }}
          seniorMode={seniorMode}
        />
      )}
    </div>
  );
}

export default App;
