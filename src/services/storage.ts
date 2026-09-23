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
} from '../types/health';
import {
  initialUsers,
  initialProfiles,
  initialHospitals,
  initialVisits,
  initialDiseases,
  initialPrescriptions,
  initialMedications,
  initialPharmacies,
  initialReceipts,
  initialInsurance,
  initialClaims,
  initialAppointments,
  initialCheckups,
  initialLabTests,
  initialVitals,
  initialReminders,
  initialSymptoms,
  initialAIReports,
} from '../data/initialData';

const STORAGE_KEYS = {
  USERS: 'ai_health_users',
  CURRENT_USER_ID: 'ai_health_current_user_id',
  PROFILES: 'ai_health_profiles',
  HOSPITALS: 'ai_health_hospitals',
  VISITS: 'ai_health_visits',
  DISEASES: 'ai_health_diseases',
  PRESCRIPTIONS: 'ai_health_prescriptions',
  MEDICATIONS: 'ai_health_medications',
  PHARMACIES: 'ai_health_pharmacies',
  RECEIPTS: 'ai_health_receipts',
  INSURANCE: 'ai_health_insurance',
  CLAIMS: 'ai_health_claims',
  APPOINTMENTS: 'ai_health_appointments',
  CHECKUPS: 'ai_health_checkups',
  LAB_TESTS: 'ai_health_lab_tests',
  VITALS: 'ai_health_vitals',
  REMINDERS: 'ai_health_reminders',
  SYMPTOMS: 'ai_health_symptoms',
  AI_REPORTS: 'ai_health_ai_reports',
  SENIOR_MODE: 'ai_health_senior_mode',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const HealthStorage = {
  // Current Active User
  getCurrentUserId(): string {
    const defaultUser = initialUsers.find(u => u.isDefault)?.id || initialUsers[0].id;
    return getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, defaultUser);
  },
  setCurrentUserId(userId: string): void {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  // Senior Accessibility Mode
  getSeniorMode(): boolean {
    return getItem<boolean>(STORAGE_KEYS.SENIOR_MODE, false);
  },
  setSeniorMode(enabled: boolean): void {
    setItem(STORAGE_KEYS.SENIOR_MODE, enabled);
  },

  // 01. Users
  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  },
  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
  },
  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    setItem(STORAGE_KEYS.USERS, users);
  },

  // 02. Health Profile
  getProfiles(): HealthProfile[] {
    return getItem<HealthProfile[]>(STORAGE_KEYS.PROFILES, initialProfiles);
  },
  getProfileByUserId(userId: string): HealthProfile | undefined {
    return this.getProfiles().find(p => p.userId === userId);
  },
  saveProfile(profile: HealthProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.userId === profile.userId);
    if (index >= 0) profiles[index] = profile;
    else profiles.push(profile);
    setItem(STORAGE_KEYS.PROFILES, profiles);
  },

  // 03. Hospitals
  getHospitals(): Hospital[] {
    return getItem<Hospital[]>(STORAGE_KEYS.HOSPITALS, initialHospitals);
  },
  saveHospital(hospital: Hospital): void {
    const list = this.getHospitals();
    const index = list.findIndex(h => h.id === hospital.id);
    if (index >= 0) list[index] = hospital;
    else list.push(hospital);
    setItem(STORAGE_KEYS.HOSPITALS, list);
  },

  // 04. Medical Visits
  getVisits(): MedicalVisit[] {
    return getItem<MedicalVisit[]>(STORAGE_KEYS.VISITS, initialVisits);
  },
  getVisitsByUserId(userId: string): MedicalVisit[] {
    return this.getVisits().filter(v => v.userId === userId);
  },
  saveVisit(visit: MedicalVisit): void {
    const list = this.getVisits();
    const index = list.findIndex(v => v.id === visit.id);
    if (index >= 0) list[index] = visit;
    else list.push(visit);
    setItem(STORAGE_KEYS.VISITS, list);
  },
  deleteVisit(visitId: string): void {
    const list = this.getVisits().filter(v => v.id !== visitId);
    setItem(STORAGE_KEYS.VISITS, list);
  },

  // 05. Diseases
  getDiseases(): Disease[] {
    return getItem<Disease[]>(STORAGE_KEYS.DISEASES, initialDiseases);
  },
  getDiseasesByUserId(userId: string): Disease[] {
    return this.getDiseases().filter(d => d.userId === userId);
  },
  saveDisease(disease: Disease): void {
    const list = this.getDiseases();
    const index = list.findIndex(d => d.id === disease.id);
    if (index >= 0) list[index] = disease;
    else list.push(disease);
    setItem(STORAGE_KEYS.DISEASES, list);
  },

  // 06. Prescriptions
  getPrescriptions(): Prescription[] {
    return getItem<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, initialPrescriptions);
  },
  getPrescriptionsByUserId(userId: string): Prescription[] {
    return this.getPrescriptions().filter(p => p.userId === userId);
  },
  savePrescription(rx: Prescription): void {
    const list = this.getPrescriptions();
    const index = list.findIndex(p => p.id === rx.id);
    if (index >= 0) list[index] = rx;
    else list.push(rx);
    setItem(STORAGE_KEYS.PRESCRIPTIONS, list);
  },

  // 07. Medications
  getMedications(): Medication[] {
    return getItem<Medication[]>(STORAGE_KEYS.MEDICATIONS, initialMedications);
  },
  saveMedication(med: Medication): void {
    const list = this.getMedications();
    const index = list.findIndex(m => m.id === med.id);
    if (index >= 0) list[index] = med;
    else list.push(med);
    setItem(STORAGE_KEYS.MEDICATIONS, list);
  },

  // 08. Pharmacies
  getPharmacies(): Pharmacy[] {
    return getItem<Pharmacy[]>(STORAGE_KEYS.PHARMACIES, initialPharmacies);
  },
  savePharmacy(pharmacy: Pharmacy): void {
    const list = this.getPharmacies();
    const index = list.findIndex(p => p.id === pharmacy.id);
    if (index >= 0) list[index] = pharmacy;
    else list.push(pharmacy);
    setItem(STORAGE_KEYS.PHARMACIES, list);
  },

  // 09. Receipts
  getReceipts(): Receipt[] {
    return getItem<Receipt[]>(STORAGE_KEYS.RECEIPTS, initialReceipts);
  },
  getReceiptsByUserId(userId: string): Receipt[] {
    return this.getReceipts().filter(r => r.userId === userId);
  },
  saveReceipt(receipt: Receipt): void {
    const list = this.getReceipts();
    const index = list.findIndex(r => r.id === receipt.id);
    if (index >= 0) list[index] = receipt;
    else list.push(receipt);
    setItem(STORAGE_KEYS.RECEIPTS, list);
  },

  // 10. Insurance
  getInsurance(): Insurance[] {
    return getItem<Insurance[]>(STORAGE_KEYS.INSURANCE, initialInsurance);
  },
  getInsuranceByUserId(userId: string): Insurance[] {
    return this.getInsurance().filter(i => i.userId === userId);
  },
  saveInsurance(ins: Insurance): void {
    const list = this.getInsurance();
    const index = list.findIndex(i => i.id === ins.id);
    if (index >= 0) list[index] = ins;
    else list.push(ins);
    setItem(STORAGE_KEYS.INSURANCE, list);
  },

  // 11. Claims
  getClaims(): InsuranceClaim[] {
    return getItem<InsuranceClaim[]>(STORAGE_KEYS.CLAIMS, initialClaims);
  },
  getClaimsByUserId(userId: string): InsuranceClaim[] {
    return this.getClaims().filter(c => c.userId === userId);
  },
  saveClaim(claim: InsuranceClaim): void {
    const list = this.getClaims();
    const index = list.findIndex(c => c.id === claim.id);
    if (index >= 0) list[index] = claim;
    else list.push(claim);
    setItem(STORAGE_KEYS.CLAIMS, list);
  },

  // 12. Appointments
  getAppointments(): Appointment[] {
    return getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  },
  getAppointmentsByUserId(userId: string): Appointment[] {
    return this.getAppointments().filter(a => a.userId === userId);
  },
  saveAppointment(apt: Appointment): void {
    const list = this.getAppointments();
    const index = list.findIndex(a => a.id === apt.id);
    if (index >= 0) list[index] = apt;
    else list.push(apt);
    setItem(STORAGE_KEYS.APPOINTMENTS, list);
  },

  // 13. Checkups
  getCheckups(): HealthCheckup[] {
    return getItem<HealthCheckup[]>(STORAGE_KEYS.CHECKUPS, initialCheckups);
  },
  getCheckupsByUserId(userId: string): HealthCheckup[] {
    return this.getCheckups().filter(c => c.userId === userId);
  },
  saveCheckup(chk: HealthCheckup): void {
    const list = this.getCheckups();
    const index = list.findIndex(c => c.id === chk.id);
    if (index >= 0) list[index] = chk;
    else list.push(chk);
    setItem(STORAGE_KEYS.CHECKUPS, list);
  },

  // 14. Lab Tests
  getLabTests(): LabTest[] {
    return getItem<LabTest[]>(STORAGE_KEYS.LAB_TESTS, initialLabTests);
  },
  getLabTestsByUserId(userId: string): LabTest[] {
    return this.getLabTests().filter(l => l.userId === userId);
  },
  saveLabTest(lab: LabTest): void {
    const list = this.getLabTests();
    const index = list.findIndex(l => l.id === lab.id);
    if (index >= 0) list[index] = lab;
    else list.push(lab);
    setItem(STORAGE_KEYS.LAB_TESTS, list);
  },

  // 15. Vital Signs
  getVitals(): VitalSign[] {
    return getItem<VitalSign[]>(STORAGE_KEYS.VITALS, initialVitals);
  },
  getVitalsByUserId(userId: string): VitalSign[] {
    return this.getVitals().filter(v => v.userId === userId);
  },
  saveVital(vital: VitalSign): void {
    const list = this.getVitals();
    const index = list.findIndex(v => v.id === vital.id);
    if (index >= 0) list[index] = vital;
    else list.push(vital);
    setItem(STORAGE_KEYS.VITALS, list);
  },

  // 16. Reminders
  getReminders(): MedicationReminder[] {
    return getItem<MedicationReminder[]>(STORAGE_KEYS.REMINDERS, initialReminders);
  },
  getRemindersByUserId(userId: string): MedicationReminder[] {
    return this.getReminders().filter(r => r.userId === userId);
  },
  saveReminder(reminder: MedicationReminder): void {
    const list = this.getReminders();
    const index = list.findIndex(r => r.id === reminder.id);
    if (index >= 0) list[index] = reminder;
    else list.push(reminder);
    setItem(STORAGE_KEYS.REMINDERS, list);
  },
  toggleReminderTaken(reminderId: string, taken: boolean): void {
    const list = this.getReminders();
    const item = list.find(r => r.id === reminderId);
    if (item) {
      item.isTakenToday = taken;
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().slice(0, 5);
      const hist = item.takenHistory.find(h => h.date === today);
      if (hist) {
        hist.taken = taken;
        hist.time = nowTime;
      } else {
        item.takenHistory.unshift({ date: today, time: nowTime, taken });
      }
      if (taken) item.streakDays = (item.streakDays || 0) + 1;
      setItem(STORAGE_KEYS.REMINDERS, list);
    }
  },

  // 17. Symptoms
  getSymptoms(): SymptomLog[] {
    return getItem<SymptomLog[]>(STORAGE_KEYS.SYMPTOMS, initialSymptoms);
  },
  getSymptomsByUserId(userId: string): SymptomLog[] {
    return this.getSymptoms().filter(s => s.userId === userId);
  },
  saveSymptom(symptom: SymptomLog): void {
    const list = this.getSymptoms();
    const index = list.findIndex(s => s.id === symptom.id);
    if (index >= 0) list[index] = symptom;
    else list.push(symptom);
    setItem(STORAGE_KEYS.SYMPTOMS, list);
  },

  // 18. AI Reports
  getAIReports(): AIHealthAnalysis[] {
    return getItem<AIHealthAnalysis[]>(STORAGE_KEYS.AI_REPORTS, initialAIReports);
  },
  getAIReportsByUserId(userId: string): AIHealthAnalysis[] {
    return this.getAIReports().filter(r => r.userId === userId);
  },
  saveAIReport(report: AIHealthAnalysis): void {
    const list = this.getAIReports();
    const index = list.findIndex(r => r.id === report.id);
    if (index >= 0) list[index] = report;
    else list.unshift(report);
    setItem(STORAGE_KEYS.AI_REPORTS, list);
  },

  // CORE RELATIONAL JOIN: Unified Medical Records
  // Returns complete journey: Visit -> Hospital -> Disease -> Prescription -> Medications -> Pharmacy -> Receipts -> Claim
  getUnifiedRecords(userId: string): UnifiedMedicalRecord[] {
    const visits = this.getVisitsByUserId(userId);
    const hospitals = this.getHospitals();
    const diseases = this.getDiseasesByUserId(userId);
    const prescriptions = this.getPrescriptionsByUserId(userId);
    const medications = this.getMedications();
    const pharmacies = this.getPharmacies();
    const receipts = this.getReceiptsByUserId(userId);
    const claims = this.getClaimsByUserId(userId);

    return visits
      .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
      .map(visit => {
        const hospital = hospitals.find(h => h.id === visit.hospitalId || h.name === visit.hospitalName);
        const disease = diseases.find(d => d.visitId === visit.id);
        const prescription = prescriptions.find(p => p.visitId === visit.id);
        const meds = prescription ? medications.filter(m => m.prescriptionId === prescription.id) : [];
        const pharmacy = prescription ? pharmacies.find(p => p.prescriptionId === prescription.id) : undefined;
        const hospitalReceipt = receipts.find(r => r.visitId === visit.id && r.type === 'hospital');
        const pharmacyReceipt = receipts.find(r => (prescription && r.prescriptionId === prescription.id) || (r.visitId === visit.id && r.type === 'pharmacy'));
        const insuranceClaim = claims.find(c => c.visitId === visit.id);

        return {
          visit,
          hospital,
          disease,
          prescription,
          medications: meds,
          pharmacy,
          hospitalReceipt,
          pharmacyReceipt,
          insuranceClaim,
        };
      });
  },

  // Insurance & Claim Aggregates
  getClaimSummary(userId: string) {
    const receipts = this.getReceiptsByUserId(userId);
    const claims = this.getClaimsByUserId(userId);

    const totalMedicalCost = receipts.reduce((sum, r) => sum + r.totalCost, 0);
    const totalPatientCopay = receipts.reduce((sum, r) => sum + r.patientCopay, 0);
    const totalClaimed = claims.reduce((sum, c) => sum + c.claimAmount, 0);
    const totalPaid = claims.filter(c => c.status === '지급완료').reduce((sum, c) => sum + c.paidAmount, 0);
    const totalPending = claims.filter(c => c.status === '서류심사중' || c.status === '접수완료').reduce((sum, c) => sum + c.claimAmount, 0);
    const netOutPocket = totalPatientCopay - totalPaid;

    return {
      totalMedicalCost,
      totalPatientCopay,
      totalClaimed,
      totalPaid,
      totalPending,
      netOutPocket,
      claimCount: claims.length,
      paidCount: claims.filter(c => c.status === '지급완료').length,
    };
  },

  // Export all data to JSON
  exportAllData(): string {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      users: this.getUsers(),
      profiles: this.getProfiles(),
      hospitals: this.getHospitals(),
      visits: this.getVisits(),
      diseases: this.getDiseases(),
      prescriptions: this.getPrescriptions(),
      medications: this.getMedications(),
      pharmacies: this.getPharmacies(),
      receipts: this.getReceipts(),
      insurance: this.getInsurance(),
      claims: this.getClaims(),
      appointments: this.getAppointments(),
      checkups: this.getCheckups(),
      labTests: this.getLabTests(),
      vitals: this.getVitals(),
      reminders: this.getReminders(),
      symptoms: this.getSymptoms(),
      aiReports: this.getAIReports(),
    };
    return JSON.stringify(exportObject, null, 2);
  },

  // Import JSON backup
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) setItem(STORAGE_KEYS.USERS, data.users);
      if (data.profiles) setItem(STORAGE_KEYS.PROFILES, data.profiles);
      if (data.hospitals) setItem(STORAGE_KEYS.HOSPITALS, data.hospitals);
      if (data.visits) setItem(STORAGE_KEYS.VISITS, data.visits);
      if (data.diseases) setItem(STORAGE_KEYS.DISEASES, data.diseases);
      if (data.prescriptions) setItem(STORAGE_KEYS.PRESCRIPTIONS, data.prescriptions);
      if (data.medications) setItem(STORAGE_KEYS.MEDICATIONS, data.medications);
      if (data.pharmacies) setItem(STORAGE_KEYS.PHARMACIES, data.pharmacies);
      if (data.receipts) setItem(STORAGE_KEYS.RECEIPTS, data.receipts);
      if (data.insurance) setItem(STORAGE_KEYS.INSURANCE, data.insurance);
      if (data.claims) setItem(STORAGE_KEYS.CLAIMS, data.claims);
      if (data.appointments) setItem(STORAGE_KEYS.APPOINTMENTS, data.appointments);
      if (data.checkups) setItem(STORAGE_KEYS.CHECKUPS, data.checkups);
      if (data.labTests) setItem(STORAGE_KEYS.LAB_TESTS, data.labTests);
      if (data.vitals) setItem(STORAGE_KEYS.VITALS, data.vitals);
      if (data.reminders) setItem(STORAGE_KEYS.REMINDERS, data.reminders);
      if (data.symptoms) setItem(STORAGE_KEYS.SYMPTOMS, data.symptoms);
      if (data.aiReports) setItem(STORAGE_KEYS.AI_REPORTS, data.aiReports);
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  },

  // Reset to initial data
  resetToInitial(): void {
    localStorage.clear();
    setItem(STORAGE_KEYS.USERS, initialUsers);
    setItem(STORAGE_KEYS.PROFILES, initialProfiles);
    setItem(STORAGE_KEYS.HOSPITALS, initialHospitals);
    setItem(STORAGE_KEYS.VISITS, initialVisits);
    setItem(STORAGE_KEYS.DISEASES, initialDiseases);
    setItem(STORAGE_KEYS.PRESCRIPTIONS, initialPrescriptions);
    setItem(STORAGE_KEYS.MEDICATIONS, initialMedications);
    setItem(STORAGE_KEYS.PHARMACIES, initialPharmacies);
    setItem(STORAGE_KEYS.RECEIPTS, initialReceipts);
    setItem(STORAGE_KEYS.INSURANCE, initialInsurance);
    setItem(STORAGE_KEYS.CLAIMS, initialClaims);
    setItem(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    setItem(STORAGE_KEYS.CHECKUPS, initialCheckups);
    setItem(STORAGE_KEYS.LAB_TESTS, initialLabTests);
    setItem(STORAGE_KEYS.VITALS, initialVitals);
    setItem(STORAGE_KEYS.REMINDERS, initialReminders);
    setItem(STORAGE_KEYS.SYMPTOMS, initialSymptoms);
    setItem(STORAGE_KEYS.AI_REPORTS, initialAIReports);
  },
};
