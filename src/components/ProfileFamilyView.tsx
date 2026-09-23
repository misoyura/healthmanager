import React, { useState } from 'react';
import {
  UserCheck,
  Users,
  Shield,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { User, HealthProfile } from '../types/health';
import { HealthStorage } from '../services/storage';

interface ProfileFamilyViewProps {
  currentUser: User;
  users: UserType[];
  profile?: HealthProfile;
  seniorMode: boolean;
  onSelectUser: (userId: string) => void;
  onRefreshData: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
}

type UserType = User;

export const ProfileFamilyView: React.FC<ProfileFamilyViewProps> = ({
  currentUser,
  users,
  profile,
  seniorMode,
  onSelectUser,
  onRefreshData,
  onExportData,
  onImportData,
  onResetData,
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBirth, setNewBirth] = useState('1952-05-12');
  const [newGender, setNewGender] = useState<'남성' | '여성'>('여성');
  const [newRole, setNewRole] = useState<'본인' | '어머니' | '아버지' | '배우자' | '자녀' | '기타'>('어머니');
  const [newPhone, setNewPhone] = useState('010-0000-0000');

  // Edit Profile fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [height, setHeight] = useState(profile?.height || 162);
  const [weight, setWeight] = useState(profile?.weight || 64);
  const [bloodType, setBloodType] = useState(profile?.bloodType || 'A+');
  const [allergies, setAllergies] = useState(profile?.allergies?.join(', ') || '');
  const [diseases, setDiseases] = useState(profile?.chronicDiseases?.join(', ') || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContact?.phone || '010-1234-5678');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newId = `user-${Date.now()}`;
    const newUser: User = {
      id: newId,
      name: newName,
      birthDate: newBirth,
      gender: newGender,
      familyRole: newRole,
      phone: newPhone,
      email: `${newId}@health.local`,
      isDefault: false,
    };

    HealthStorage.saveUser(newUser);
    HealthStorage.saveProfile({
      id: `prof-${Date.now()}`,
      userId: newId,
      bloodType: 'A+',
      height: 160,
      weight: 60,
      allergies: [],
      currentMedications: [],
      chronicDiseases: [],
      pastConditions: [],
      surgeries: [],
      emergencyContact: {
        name: currentUser.name,
        relationship: '가족',
        phone: currentUser.phone,
      },
    });

    setShowAddUserModal(false);
    setNewName('');
    onRefreshData();
    onSelectUser(newId);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: HealthProfile = {
      id: profile?.id || `prof-${Date.now()}`,
      userId: currentUser.id,
      bloodType,
      height: Number(height),
      weight: Number(weight),
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      currentMedications: profile?.currentMedications || [],
      chronicDiseases: diseases.split(',').map(s => s.trim()).filter(Boolean),
      pastConditions: profile?.pastConditions || [],
      surgeries: profile?.surgeries || [],
      emergencyContact: {
        name: profile?.emergencyContact?.name || '보호자',
        relationship: profile?.emergencyContact?.relationship || '가족',
        phone: emergencyPhone,
      },
    };

    HealthStorage.saveProfile(updatedProfile);
    setIsEditingProfile(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`font-black text-slate-900 ${seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
            건강 프로필 및 가족 구성원 관리
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            부모님과 본인 등 가족 구성원을 등록하고 개별 맞춤 건강 정보를 안전하게 관리하세요
          </p>
        </div>

        <button
          onClick={() => setShowAddUserModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>새 가족 구성원 추가</span>
        </button>
      </div>

      {/* Family Members Card Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-xs sm:text-sm">가족 구성원 목록</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {users.map(u => {
            const isSelected = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative space-y-3 ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 bg-teal-600 text-white rounded-full">
                    현재 선택됨
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-black text-base border border-teal-100">
                    {u.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className={`font-extrabold text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
                      {u.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {u.familyRole} · {u.gender}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <p>생년월일: {u.birthDate}</p>
                  <p>연락처: {u.phone || '미등록'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Member Health Profile Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-600" />
            <h3 className={`font-black text-slate-900 ${seniorMode ? 'text-xl' : 'text-base'}`}>
              {currentUser.name} 님의 기본 신체 및 건강 기초 프로필
            </h3>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? '취소' : '수정하기'}</span>
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">키 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">체중 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">혈액형</label>
                <select
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">약물/식품 알레르기 (쉼표로 구분)</label>
              <input
                type="text"
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="예: 페니실린, 아스피린, 땅콩"
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">만성 기저질환 (쉼표로 구분)</label>
              <input
                type="text"
                value={diseases}
                onChange={e => setDiseases(e.target.value)}
                placeholder="예: 고혈압, 퇴행성 관절염, 당뇨"
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">비상 연락처 전화번호</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold"
              >
                변경사항 저장
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">신장 / 체중</span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile?.height || 165} cm / {profile?.weight || 65} kg
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">혈액형</span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile?.bloodType || 'A+'}형
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">체질량지수 (BMI)</span>
                <span className="font-bold text-teal-700 text-sm">
                  {((profile?.weight || 65) / (((profile?.height || 165) / 100) ** 2)).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">비상연락처</span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile?.emergencyContact?.phone || '010-1234-5678'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0 w-24">기저질환:</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.chronicDiseases && profile.chronicDiseases.length > 0 ? (
                    profile.chronicDiseases.map((d, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-800 font-bold rounded">
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">등록된 기저질환 없음</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0 w-24">알레르기:</span>
                <div className="flex flex-wrap gap-1">
                  {profile?.allergies && profile.allergies.length > 0 ? (
                    profile.allergies.map((a, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-rose-50 text-rose-800 font-bold rounded">
                        ⚠️ {a}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">알레르기 없음</span>
                  )}
                </div>
              </div>

              {profile?.surgeries && profile.surgeries.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-700 shrink-0 w-24">수술 및 입원이력:</span>
                  <span className="text-slate-600">{profile.surgeries.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security & Data Backup Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>의료 데이터 보안 및 백업 관리</span>
        </div>
        <p className="text-slate-500 leading-relaxed">
          본 앱의 의료·건강 데이터는 브라우저 내부 암호화 스토리지에 안전하게 보관됩니다. 다른 기기로 데이터를 이전하거나 안전하게 보관하기 위해 JSON 백업 파일을 다운로드할 수 있습니다.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={onExportData}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>데이터 백업 (JSON 다운로드)</span>
          </button>
          <button
            onClick={onImportData}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>백업 복원 (JSON 파일 열기)</span>
          </button>
          <button
            onClick={onResetData}
            className="px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold text-rose-700 flex items-center gap-1.5 shadow-xs ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>초기 데이터로 재설정</span>
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">새 가족 구성원 등록</h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">성함</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="예: 김영희"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">생년월일</label>
                  <input
                    type="date"
                    required
                    value={newBirth}
                    onChange={e => setNewBirth(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">성별</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="여성">여성</option>
                    <option value="남성">남성</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">가족 관계</label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="어머니">어머니</option>
                  <option value="아버지">아버지</option>
                  <option value="배우자">배우자</option>
                  <option value="자녀">자녀</option>
                  <option value="본인">본인</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">연락처</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
