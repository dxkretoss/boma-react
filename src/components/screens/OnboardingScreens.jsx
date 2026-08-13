import React, { useState } from 'react';
import { updateOnboarding } from '../../auth';

// Import split onboarding steps
import EntryPath from './onboarding/EntryPath';
import OnboardingWelcome from './onboarding/OnboardingWelcome';
import OnboardingAge from './onboarding/OnboardingAge';
import OnboardingLifestyle from './onboarding/OnboardingLifestyle';
import OnboardingCommunity from './onboarding/OnboardingCommunity';
import OnboardingLocation from './onboarding/OnboardingLocation';
import OnboardingBudget from './onboarding/OnboardingBudget';
import OnboardingIntent from './onboarding/OnboardingIntent';
import OnboardingCommitment from './onboarding/OnboardingCommitment';
import OnboardingReview from './onboarding/OnboardingReview';
import OnboardingScore from './onboarding/OnboardingScore';
import OnboardingApproval from './onboarding/OnboardingApproval';
import PodCreate from './onboarding/PodCreate';
import PodInvite from './onboarding/PodInvite';
import PodMemberOnboarding from './onboarding/PodMemberOnboarding';
import PodReview from './onboarding/PodReview';
import PodPending from './onboarding/PodPending';

export default function OnboardingScreens({
  activeScreen,
  setActiveScreen,
  userOnboarded,
  setUserOnboarded,
  updateOnboardUI,
  currentUser,
  setCurrentUser
}) {
  // Onboarding responses state
  const [ageGroup, setAgeGroup] = useState('31–60 years');
  const [selectedLifestyles, setSelectedLifestyles] = useState(['Quiet & low-key', 'Sustainability']);
  const [decisionStyle, setDecisionStyle] = useState('consensus');
  const [podSize, setPodSize] = useState('4–6');
  const [locationCity, setLocationCity] = useState('Austin, TX');
  const [locationRadius, setLocationRadius] = useState(45);
  const [settingPreference, setSettingPreference] = useState('suburban');
  const [budgetRange, setBudgetRange] = useState('$350,000 – $450,000');
  const [downPaymentTier, setDownPaymentTier] = useState('5–10%');
  const [financingPreference, setFinancingPreference] = useState('traditional');
  const [housingIntent, setHousingIntent] = useState('purchase');
  const [commitmentTimeline, setCommitmentTimeline] = useState('5+ years');

  // Pod Registration States
  const [podRegName, setPodRegName] = useState('');
  const [podRegDescription, setPodRegDescription] = useState('');
  const [podRegType, setPodRegType] = useState('Friends');
  const [podInvites, setPodInvites] = useState('');

  if (![
    'entry-path', 'onboarding-welcome', 'onboarding-age', 'onboarding-lifestyle',
    'onboarding-community', 'onboarding-location', 'onboarding-budget', 'onboarding-intent',
    'onboarding-commitment', 'onboarding-review', 'onboarding-score', 'onboarding-approval',
    'pod-create', 'pod-invite', 'pod-member-onboarding', 'pod-review', 'pod-pending'
  ].includes(activeScreen)) {
    return null;
  }

  const toggleLifestyle = (label) => {
    if (selectedLifestyles.includes(label)) {
      setSelectedLifestyles(selectedLifestyles.filter(l => l !== label));
    } else {
      setSelectedLifestyles([...selectedLifestyles, label]);
    }
  };

  const handleAgeSelect = (age) => {
    setAgeGroup(age);
    setActiveScreen('onboarding-lifestyle');
  };

  const submitOnboarding = async () => {
    if (currentUser?.id) {
      try {
        const updatedUser = await updateOnboarding(currentUser.id, {
          ageGroup,
          selectedLifestyles,
          decisionStyle,
          podSize,
          locationCity,
          locationRadius: locationRadius + ' miles',
          settingPreference,
          budgetRange,
          downPaymentTier,
          financingPreference,
          housingIntent,
          commitmentTimeline,
          readinessScore: 82
        });
        if (setCurrentUser) {
          setCurrentUser(updatedUser);
        }
      } catch (err) {
        console.error('Error saving onboarding data:', err);
      }
    }

    setUserOnboarded(true);
    if (updateOnboardUI) {
      updateOnboardUI(true);
    }
    setActiveScreen('onboarding-score');
  };

  const stepProgressBar = (stepNumber) => (
    <div className="flex gap-1.5 my-4 mb-7 select-none">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div
          key={idx}
          className={`flex-1 h-1 rounded-sm transition-all duration-300 ${idx < stepNumber ? 'bg-amber' : 'bg-border'
            }`}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full text-left py-12 px-6 md:px-8 max-w-[1180px] mx-auto animate-fade">
      {activeScreen === 'entry-path' && (
        <EntryPath setActiveScreen={setActiveScreen} />
      )}
      {activeScreen === 'onboarding-welcome' && (
        <OnboardingWelcome setActiveScreen={setActiveScreen} />
      )}
      {activeScreen === 'onboarding-age' && (
        <OnboardingAge
          ageGroup={ageGroup}
          handleAgeSelect={handleAgeSelect}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-lifestyle' && (
        <OnboardingLifestyle
          selectedLifestyles={selectedLifestyles}
          toggleLifestyle={toggleLifestyle}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-community' && (
        <OnboardingCommunity
          decisionStyle={decisionStyle}
          setDecisionStyle={setDecisionStyle}
          podSize={podSize}
          setPodSize={setPodSize}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-location' && (
        <OnboardingLocation
          locationCity={locationCity}
          setLocationCity={setLocationCity}
          locationRadius={locationRadius}
          setLocationRadius={setLocationRadius}
          settingPreference={settingPreference}
          setSettingPreference={setSettingPreference}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-budget' && (
        <OnboardingBudget
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
          downPaymentTier={downPaymentTier}
          setDownPaymentTier={setDownPaymentTier}
          financingPreference={financingPreference}
          setFinancingPreference={setFinancingPreference}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-intent' && (
        <OnboardingIntent
          housingIntent={housingIntent}
          setHousingIntent={setHousingIntent}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-commitment' && (
        <OnboardingCommitment
          commitmentTimeline={commitmentTimeline}
          setCommitmentTimeline={setCommitmentTimeline}
          setActiveScreen={setActiveScreen}
          stepProgressBar={stepProgressBar}
        />
      )}
      {activeScreen === 'onboarding-review' && (
        <OnboardingReview
          selectedLifestyles={selectedLifestyles}
          decisionStyle={decisionStyle}
          locationCity={locationCity}
          locationRadius={locationRadius}
          settingPreference={settingPreference}
          budgetRange={budgetRange}
          downPaymentTier={downPaymentTier}
          housingIntent={housingIntent}
          commitmentTimeline={commitmentTimeline}
          setActiveScreen={setActiveScreen}
          submitOnboarding={submitOnboarding}
        />
      )}
      {activeScreen === 'onboarding-score' && (
        <OnboardingScore setActiveScreen={setActiveScreen} />
      )}
      {activeScreen === 'onboarding-approval' && (
        <OnboardingApproval setActiveScreen={setActiveScreen} />
      )}
      {activeScreen === 'pod-create' && (
        <PodCreate
          podRegName={podRegName}
          setPodRegName={setPodRegName}
          podRegDescription={podRegDescription}
          setPodRegDescription={setPodRegDescription}
          podRegType={podRegType}
          setPodRegType={setPodRegType}
          setActiveScreen={setActiveScreen}
        />
      )}
      {activeScreen === 'pod-invite' && (
        <PodInvite
          podInvites={podInvites}
          setPodInvites={setPodInvites}
          setActiveScreen={setActiveScreen}
        />
      )}
      {activeScreen === 'pod-member-onboarding' && (
        <PodMemberOnboarding setActiveScreen={setActiveScreen} />
      )}
      {activeScreen === 'pod-review' && (
        <PodReview
          podRegName={podRegName}
          podRegType={podRegType}
          setActiveScreen={setActiveScreen}
        />
      )}
      {activeScreen === 'pod-pending' && (
        <PodPending setActiveScreen={setActiveScreen} />
      )}
    </div>
  );
}
