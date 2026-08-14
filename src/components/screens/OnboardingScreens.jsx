import React, { useState, useEffect } from 'react';
import { updateOnboarding } from '../../auth';
import { 
  fetchActiveQuestionnaire, 
  fetchOnboardingProgress, 
  fetchSavedResponses, 
  saveOnboardingResponse, 
  submitOnboardingProfile 
} from '../../api/onboarding';

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
  setCurrentUser,
  showToast
}) {
  // Onboarding responses state
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedLifestyles, setSelectedLifestyles] = useState([]);
  const [decisionStyle, setDecisionStyle] = useState('');
  const [podSize, setPodSize] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationRadius, setLocationRadius] = useState(45);
  const [settingPreference, setSettingPreference] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [downPaymentTier, setDownPaymentTier] = useState('');
  const [financingPreference, setFinancingPreference] = useState('');
  const [housingIntent, setHousingIntent] = useState('');
  const [commitmentTimeline, setCommitmentTimeline] = useState('');

  // Database-driven questionnaire state
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState('Saving your answers...');

  // Pod Registration States
  const [podRegName, setPodRegName] = useState('');
  const [podRegDescription, setPodRegDescription] = useState('');
  const [podRegType, setPodRegType] = useState('Friends');
  const [podInvites, setPodInvites] = useState('');

  const resetOnboardingStates = () => {
    setAgeGroup('');
    setSelectedLifestyles([]);
    setDecisionStyle('');
    setPodSize('');
    setLocationCity('');
    setLocationRadius(45);
    setSettingPreference('');
    setBudgetRange('');
    setDownPaymentTier('');
    setFinancingPreference('');
    setHousingIntent('');
    setCommitmentTimeline('');
  };

  // 1. Fetch active questionnaire, progress and saved responses
  useEffect(() => {
    async function loadOnboardingData() {
      resetOnboardingStates();
      try {
        setLoading(true);
        const activeQ = await fetchActiveQuestionnaire();
        setQuestionnaire(activeQ);

        if (currentUser?.id) {
          const progress = await fetchOnboardingProgress(currentUser.id);
          const savedResponses = await fetchSavedResponses(currentUser.id);

          if (savedResponses && savedResponses.length > 0) {
            savedResponses.forEach(resp => {
              const val = resp.answer_json?.value || resp.answer_json?.values;
              if (resp.question_key === 'age_group') setAgeGroup(val || '');
              else if (resp.question_key === 'lifestyles') setSelectedLifestyles(val || []);
              else if (resp.question_key === 'decision_style') setDecisionStyle(val || '');
              else if (resp.question_key === 'pod_size') setPodSize(val || '');
              else if (resp.question_key === 'location_city') setLocationCity(val || '');
              else if (resp.question_key === 'location_radius') setLocationRadius(parseInt(val) || 45);
              else if (resp.question_key === 'setting_preference') setSettingPreference(val || '');
              else if (resp.question_key === 'budget_range') setBudgetRange(val || '');
              else if (resp.question_key === 'down_payment_tier') setDownPaymentTier(val || '');
              else if (resp.question_key === 'financing_preference') setFinancingPreference(val || '');
              else if (resp.question_key === 'housing_intent') setHousingIntent(val || '');
              else if (resp.question_key === 'commitment_timeline') setCommitmentTimeline(val || '');
            });
          }

          // Resume progress if user is starting from entry path
          if (progress && progress.status === 'IN_PROGRESS' && activeScreen === 'entry-path') {
            const stepScreens = {
              1: 'onboarding-age',
              2: 'onboarding-lifestyle',
              3: 'onboarding-community',
              4: 'onboarding-location',
              5: 'onboarding-budget',
              6: 'onboarding-intent',
              7: 'onboarding-commitment',
              8: 'onboarding-review'
            };
            if (stepScreens[progress.current_step_number]) {
              setActiveScreen(stepScreens[progress.current_step_number]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOnboardingData();
  }, [currentUser?.id]);

  const getQuestionOptions = (questionKey, fallbackOptions = []) => {
    if (!questionnaire?.questions) return fallbackOptions;
    const q = questionnaire.questions.find(item => item.question_key === questionKey);
    if (q && q.options && q.options.length > 0) {
      return q.options.map(opt => ({
        label: opt.label || opt.option_label || opt.value || '',
        desc: opt.description || opt.option_description || '',
        id: opt.id
      }));
    }
    return fallbackOptions;
  };

  if (![
    'entry-path', 'onboarding-welcome', 'onboarding-age', 'onboarding-lifestyle',
    'onboarding-community', 'onboarding-location', 'onboarding-budget', 'onboarding-intent',
    'onboarding-commitment', 'onboarding-review', 'onboarding-score', 'onboarding-approval',
    'pod-create', 'pod-invite', 'pod-member-onboarding', 'pod-review', 'pod-pending'
  ].includes(activeScreen)) {
    return null;
  }

  if (loading && !['entry-path', 'onboarding-welcome', 'onboarding-approval'].includes(activeScreen)) {
    return (
      <div className="w-full text-center py-24 font-sans  animate-fade">
        <div className="inline-block w-8 h-8 border-4 border-slate-100 border-t-amber rounded-full animate-spin mb-4 animate-fade" />
        <p className="text-[11px] font-mono uppercase tracking-wider text-ink-dim font-bold">Synchronizing Profile Data...</p>
      </div>
    );
  }

  const toggleLifestyle = (label) => {
    if (selectedLifestyles.includes(label)) {
      setSelectedLifestyles(selectedLifestyles.filter(l => l !== label));
    } else {
      setSelectedLifestyles([...selectedLifestyles, label]);
    }
  };

  // Helper to save current question response
  const saveStepResponse = async (questionKey, value, stepNumber) => {
    if (!currentUser?.id || !questionnaire) return;
    const question = questionnaire.questions.find(q => q.question_key === questionKey);
    if (!question) return;

    try {
      const isMulti = question.question_type === 'multiple_choice';
      const answerJson = isMulti ? { values: value } : { value: value };

      await saveOnboardingResponse(currentUser.id, {
        questionnaireId: questionnaire.id,
        questionnaireVersion: questionnaire.version,
        questionId: question.id,
        questionKey,
        answerJson,
        stepNumber
      });
    } catch (err) {
      console.error(`Failed to save step ${stepNumber} response:`, err);
    }
  };

  // Navigation interceptor to enable auto-save & validation
  const handleOnboardingNavigation = async (nextScreen) => {
    const screensOrder = [
      'onboarding-welcome',
      'onboarding-age',
      'onboarding-lifestyle',
      'onboarding-community',
      'onboarding-location',
      'onboarding-budget',
      'onboarding-intent',
      'onboarding-commitment',
      'onboarding-review'
    ];

    const isGoingForward = screensOrder.indexOf(nextScreen) > screensOrder.indexOf(activeScreen);

    // 1. Validation checks going forward
    if (isGoingForward) {
      if (activeScreen === 'onboarding-age') {
        if (!ageGroup) {
          showToast('Please select your age group to continue.');
          return;
        }
      }
      if (activeScreen === 'onboarding-lifestyle') {
        if (!selectedLifestyles || selectedLifestyles.length === 0) {
          showToast('Please select at least one lifestyle or value to continue.');
          return;
        }
      }
      if (activeScreen === 'onboarding-community') {
        if (!decisionStyle) {
          showToast('Please select your decision-making style.');
          return;
        }
        if (!podSize) {
          showToast('Please select your preferred Pod size.');
          return;
        }
      }
      if (activeScreen === 'onboarding-location') {
        if (!locationCity || !locationCity.trim()) {
          showToast('Preferred city or metro area is required.');
          return;
        }
        if (!settingPreference) {
          showToast('Please select your setting preference.');
          return;
        }
      }
      if (activeScreen === 'onboarding-budget') {
        if (!budgetRange || !budgetRange.trim()) {
          showToast('Estimated purchase budget range is required.');
          return;
        }
        if (!downPaymentTier) {
          showToast('Please select your down payment readiness tier.');
          return;
        }
        if (!financingPreference) {
          showToast('Please select your financing preference.');
          return;
        }
      }
      if (activeScreen === 'onboarding-intent') {
        if (!housingIntent) {
          showToast('Please select your primary housing intent.');
          return;
        }
      }
      if (activeScreen === 'onboarding-commitment') {
        if (!commitmentTimeline) {
          showToast('Please select your minimum commitment timeline.');
          return;
        }
      }
    }

    // 2. Persist step response
    if (currentUser?.id && questionnaire) {
      try {
        if (activeScreen === 'onboarding-age') {
          await saveStepResponse('age_group', ageGroup, 1);
        } else if (activeScreen === 'onboarding-lifestyle') {
          await saveStepResponse('lifestyles', selectedLifestyles, 2);
        } else if (activeScreen === 'onboarding-community') {
          await saveStepResponse('decision_style', decisionStyle, 3);
          await saveStepResponse('pod_size', podSize, 3);
        } else if (activeScreen === 'onboarding-location') {
          await saveStepResponse('location_city', locationCity, 4);
          await saveStepResponse('location_radius', locationRadius.toString(), 4);
          await saveStepResponse('setting_preference', settingPreference, 4);
        } else if (activeScreen === 'onboarding-budget') {
          await saveStepResponse('budget_range', budgetRange, 5);
          await saveStepResponse('down_payment_tier', downPaymentTier, 5);
          await saveStepResponse('financing_preference', financingPreference, 5);
        } else if (activeScreen === 'onboarding-intent') {
          await saveStepResponse('housing_intent', housingIntent, 6);
        } else if (activeScreen === 'onboarding-commitment') {
          await saveStepResponse('commitment_timeline', commitmentTimeline, 7);
        }
      } catch (err) {
        console.error('Error during onboarding step auto-save:', err);
      }
    }

    setActiveScreen(nextScreen);
  };

  const handleAgeSelect = async (age) => {
    setAgeGroup(age);
    if (currentUser?.id && questionnaire) {
      const question = questionnaire.questions.find(q => q.question_key === 'age_group');
      if (question) {
        try {
          await saveOnboardingResponse(currentUser.id, {
            questionnaireId: questionnaire.id,
            questionnaireVersion: questionnaire.version,
            questionId: question.id,
            questionKey: 'age_group',
            answerJson: { value: age },
            stepNumber: 1
          });
        } catch (err) {
          console.error('Failed to save age group:', err);
        }
      }
    }
    setActiveScreen('onboarding-lifestyle');
  };

  const submitOnboarding = async () => {
    if (currentUser?.id) {
      setSubmitting(true);
      setSubmittingMessage('Saving final responses...');
      
      const messages = [
        'Evaluating lifestyle alignment...',
        'Parsing budget & down-payment metrics...',
        'Calculating housing readiness score...',
        'Generating matching pool criteria...',
        'Almost ready...'
      ];
      let msgIdx = 0;
      const interval = setInterval(() => {
        if (msgIdx < messages.length) {
          setSubmittingMessage(messages[msgIdx]);
          msgIdx++;
        }
      }, 700);

      try {
        // Save final step response
        await saveStepResponse('commitment_timeline', commitmentTimeline, 7);
        // Call DB submit profile (marks COMPLETED, sets status to UNDER_REVIEW, calculates score)
        const updatedUser = await submitOnboardingProfile(currentUser.id);
        if (setCurrentUser) {
          setCurrentUser(updatedUser);
        }
      } catch (err) {
        console.error('Error submitting onboarding profile:', err);
      } finally {
        clearInterval(interval);
        setSubmitting(false);
      }
    }

    setUserOnboarded(true);
    if (updateOnboardUI) {
      updateOnboardUI(true);
    }
    setActiveScreen('onboarding-score');
  };

  const stepProgressBar = (stepNumber) => (
    <div className="flex gap-1.5 my-4 mb-7 ">
      {Array.from({ length: 9 }).map((_, idx) => (
        <div
          key={idx}
          className={`flex-1 h-1 rounded-sm transition-all duration-300 ${idx < stepNumber ? 'bg-amber' : 'bg-border'
            }`}
        />
      ))}
    </div>
  );

  if (submitting) {
    return (
      <div className="max-w-[480px] mx-auto text-center py-20 animate-fade">
        <div className="bg-white border border-border rounded-[22px] p-10 shadow-custom flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber/15 animate-ping" />
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-amber animate-spin" />
          </div>
          <span className="font-mono text-[11.5px] uppercase tracking-wider text-amber font-bold mb-3 animate-pulse">
            Analyzing responses
          </span>
          <h3 className="font-display font-extrabold text-[20px] text-ink mb-1.5 leading-tight">
            Calculating Housing Readiness
          </h3>
          <p className="text-ink-dim text-sm font-semibold leading-relaxed max-w-[280px]">
            {submittingMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-left py-12 px-6 md:px-8 max-w-[1180px] mx-auto animate-fade">
      {activeScreen === 'entry-path' && (
        <EntryPath setActiveScreen={setActiveScreen} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      )}
      {activeScreen === 'onboarding-welcome' && (
        <OnboardingWelcome setActiveScreen={handleOnboardingNavigation} />
      )}
      {activeScreen === 'onboarding-age' && (
        <OnboardingAge
          ageGroup={ageGroup}
          handleAgeSelect={handleAgeSelect}
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          options={getQuestionOptions('age_group')}
        />
      )}
      {activeScreen === 'onboarding-lifestyle' && (
        <OnboardingLifestyle
          selectedLifestyles={selectedLifestyles}
          toggleLifestyle={toggleLifestyle}
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          options={getQuestionOptions('lifestyles')}
        />
      )}
      {activeScreen === 'onboarding-community' && (
        <OnboardingCommunity
          decisionStyle={decisionStyle}
          setDecisionStyle={setDecisionStyle}
          podSize={podSize}
          setPodSize={setPodSize}
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          decisionOptions={getQuestionOptions('decision_style')}
          podSizeOptions={getQuestionOptions('pod_size')}
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
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          settingOptions={getQuestionOptions('setting_preference')}
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
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          downPaymentOptions={getQuestionOptions('down_payment_tier')}
          financingOptions={getQuestionOptions('financing_preference')}
        />
      )}
      {activeScreen === 'onboarding-intent' && (
        <OnboardingIntent
          housingIntent={housingIntent}
          setHousingIntent={setHousingIntent}
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          options={getQuestionOptions('housing_intent')}
        />
      )}
      {activeScreen === 'onboarding-commitment' && (
        <OnboardingCommitment
          commitmentTimeline={commitmentTimeline}
          setCommitmentTimeline={setCommitmentTimeline}
          setActiveScreen={handleOnboardingNavigation}
          stepProgressBar={stepProgressBar}
          options={getQuestionOptions('commitment_timeline')}
        />
      )}
      {activeScreen === 'onboarding-review' && (
        <OnboardingReview
          ageGroup={ageGroup}
          selectedLifestyles={selectedLifestyles}
          decisionStyle={decisionStyle}
          locationCity={locationCity}
          locationRadius={locationRadius}
          settingPreference={settingPreference}
          budgetRange={budgetRange}
          downPaymentTier={downPaymentTier}
          housingIntent={housingIntent}
          commitmentTimeline={commitmentTimeline}
          setActiveScreen={handleOnboardingNavigation}
          submitOnboarding={submitOnboarding}
        />
      )}
      {activeScreen === 'onboarding-score' && (
        <OnboardingScore setActiveScreen={setActiveScreen} currentUser={currentUser} />
      )}
      {activeScreen === 'onboarding-approval' && (
        <OnboardingApproval 
          setActiveScreen={setActiveScreen} 
          currentUser={currentUser} 
          setCurrentUser={setCurrentUser} 
        />
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
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      )}
      {activeScreen === 'pod-invite' && (
        <PodInvite
          podInvites={podInvites}
          setPodInvites={setPodInvites}
          setActiveScreen={setActiveScreen}
          currentUser={currentUser}
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
          currentUser={currentUser}
        />
      )}
      {activeScreen === 'pod-pending' && (
        <PodPending setActiveScreen={setActiveScreen} />
      )}
    </div>
  );
}
