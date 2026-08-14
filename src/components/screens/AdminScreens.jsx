import React, { useState } from 'react';

// Import split admin screens
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminMatching from './admin/AdminMatching';
import AdminQuestions from './admin/AdminQuestions';
import AdminPodReview from './admin/AdminPodReview';
import AdminPodManagement from './admin/AdminPodManagement';
import AdminPodDetail from './admin/AdminPodDetail';
import AdminExistingPodQueue from './admin/AdminExistingPodQueue';
import AdminReadinessLogic from './admin/AdminReadinessLogic';

export default function AdminScreens({
  activeScreen,
  setActiveScreen,
  adminViewPodId,
  setAdminViewPodId,
  adminUser,
  setAdminUser,
  showToast,
  showConfirm
}) {

  // Matching Engine weight states
  const [lifestyleWeight, setLifestyleWeight] = useState(35);
  const [locationWeight, setLocationWeight] = useState(25);
  const [budgetWeight, setBudgetWeight] = useState(20);
  const [commitmentWeight, setCommitmentWeight] = useState(20);

  if (![
    'admin-login', 'admin-dashboard', 'admin-users', 'admin-readiness-logic', 'admin-matching', 'admin-pod-review',
    'admin-pod-management', 'admin-pod-detail', 'admin-existing-pod-queue', 'admin-questions'
  ].includes(activeScreen)) {
    return null;
  }

  // Enforce admin authentication
  if (activeScreen !== 'admin-login' && !adminUser) {
    return (
      <AdminLogin 
        setActiveScreen={setActiveScreen} 
        setAdminUser={setAdminUser} 
        currentScreen={activeScreen}
      />
    );
  }

  const handleViewAdminPod = (podId) => {
    setAdminViewPodId(podId);
    setActiveScreen('admin-pod-detail');
  };

  return (
    <div className="w-full text-left py-12 px-6 md:px-8 max-w-[1180px] mx-auto animate-fade">
      {activeScreen === 'admin-login' && (
        <AdminLogin
          setActiveScreen={setActiveScreen}
          setAdminUser={setAdminUser}
          currentScreen={activeScreen}
        />
      )}
      {activeScreen === 'admin-dashboard' && (
        <AdminDashboard
          adminUser={adminUser}
          setActiveScreen={setActiveScreen}
          handleViewAdminPod={handleViewAdminPod}
        />
      )}
      {activeScreen === 'admin-users' && (
        <AdminUsers setActiveScreen={setActiveScreen} adminUser={adminUser} showToast={showToast} />
      )}
      {activeScreen === 'admin-readiness-logic' && (
        <AdminReadinessLogic setActiveScreen={setActiveScreen} isAdminView={true} />
      )}
      {activeScreen === 'admin-matching' && (
        <AdminMatching
          lifestyleWeight={lifestyleWeight}
          setLifestyleWeight={setLifestyleWeight}
          locationWeight={locationWeight}
          setLocationWeight={setLocationWeight}
          budgetWeight={budgetWeight}
          setBudgetWeight={setBudgetWeight}
          commitmentWeight={commitmentWeight}
          setCommitmentWeight={setCommitmentWeight}
          setActiveScreen={setActiveScreen}
        />
      )}
      {activeScreen === 'admin-questions' && (
        <AdminQuestions setActiveScreen={setActiveScreen} adminUser={adminUser} showToast={showToast} showConfirm={showConfirm} />
      )}
      {activeScreen === 'admin-pod-review' && (
        <AdminPodReview setActiveScreen={setActiveScreen} adminUser={adminUser} showToast={showToast} showConfirm={showConfirm} />
      )}
      {activeScreen === 'admin-pod-management' && (
        <AdminPodManagement
          setActiveScreen={setActiveScreen}
          handleViewAdminPod={handleViewAdminPod}
          adminUser={adminUser}
          showToast={showToast}
          showConfirm={showConfirm}
        />
      )}
      {activeScreen === 'admin-pod-detail' && (
        <AdminPodDetail
          setActiveScreen={setActiveScreen}
          adminViewPodId={adminViewPodId}
        />
      )}
      {activeScreen === 'admin-existing-pod-queue' && (
        <AdminExistingPodQueue setActiveScreen={setActiveScreen} />
      )}
    </div>
  );
}
