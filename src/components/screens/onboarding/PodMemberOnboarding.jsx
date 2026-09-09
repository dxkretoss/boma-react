import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { updateUser } from '../../../api/users';
import { supabase } from '../../../supabaseClient';
import Toast from '../../Toast';

export default function PodMemberOnboarding({ 
  setActiveScreen, 
  currentUser, 
  setCurrentUser, 
  showToast 
}) {
  const [housingIntent, setHousingIntent] = useState(
    currentUser?.housing_intent === 'purchase'
      ? 'Purchase primary residence'
      : currentUser?.housing_intent === 'investment'
      ? 'Investment hold'
      : 'Co-develop property'
  );
  
  const [commitmentTimeline, setCommitmentTimeline] = useState(
    currentUser?.commitment_timeline === 'timeline_5yr'
      ? '5+ years'
      : currentUser?.commitment_timeline === 'timeline_flex'
      ? 'Flexible'
      : '2+ years'
  );

  const [saving, setSaving] = useState(false);
  const [localToast, setLocalToast] = useState({ show: false, message: '', type: 'error' });

  const handleContinue = async () => {
    if (!currentUser?.id) {
      setActiveScreen('profile');
      return;
    }

    setSaving(true);
    try {
      const intentKey = housingIntent === 'Purchase primary residence' 
        ? 'purchase' 
        : housingIntent === 'Investment hold' 
        ? 'investment' 
        : 'co-develop';

      const timelineKey = commitmentTimeline === '5+ years'
        ? 'timeline_5yr'
        : commitmentTimeline === 'Flexible'
        ? 'timeline_flex'
        : 'timeline_2yr';

      // 1. Sync responses in onboarding_responses so Admin screens can track them
      try {
        const { data: questions } = await supabase
          .from('onboarding_questions')
          .select('id, questionnaire_id, question_key')
          .in('question_key', ['housing_intent', 'commitment_timeline']);

        if (questions && questions.length > 0) {
          const { data: qn } = await supabase
            .from('onboarding_questionnaires')
            .select('version')
            .eq('id', questions[0].questionnaire_id)
            .maybeSingle();
          const version = qn?.version || 1;

          const responseUpserts = [];
          const qIntent = questions.find(x => x.question_key === 'housing_intent');
          if (qIntent) {
            responseUpserts.push({
              user_id: currentUser.id,
              questionnaire_id: qIntent.questionnaire_id,
              questionnaire_version: version,
              question_id: qIntent.id,
              question_key: 'housing_intent',
              answer_json: { value: intentKey, label: housingIntent },
              answered_at: new Date()
            });
          }

          const qTimeline = questions.find(x => x.question_key === 'commitment_timeline');
          if (qTimeline) {
            responseUpserts.push({
              user_id: currentUser.id,
              questionnaire_id: qTimeline.questionnaire_id,
              questionnaire_version: version,
              question_id: qTimeline.id,
              question_key: 'commitment_timeline',
              answer_json: { value: timelineKey, label: commitmentTimeline },
              answered_at: new Date()
            });
          }

          if (responseUpserts.length > 0) {
            await supabase
              .from('onboarding_responses')
              .upsert(responseUpserts, { onConflict: 'user_id,question_id' });
          }
        }
      } catch (upsertErr) {
        console.warn('Could not sync onboarding_responses:', upsertErr);
      }

      const calculatedScore = timelineKey === 'timeline_5yr' ? 90 : timelineKey === 'timeline_flex' ? 80 : 85;

      // 2. Update user database record
      const updatedUser = await updateUser(currentUser.id, {
        housing_intent: intentKey,
        commitment_timeline: timelineKey,
        entry_path: 'EXISTING_POD',
        onboarding_status: 'COMPLETED',
        profile_status: 'APPROVED',
        readiness_score: calculatedScore,
        readiness_status: 'CALCULATED',
        user_onboarded: true
      });

      // 3. Update parent state & storage
      if (setCurrentUser) {
        setCurrentUser(updatedUser);
      }
      localStorage.setItem('boma_current_user', JSON.stringify(updatedUser));

      if (showToast) {
        showToast('Profile completed successfully!', 'success');
      }

      setActiveScreen('profile');
    } catch (err) {
      console.error('Failed to save pod member onboarding:', err);
      setLocalToast({ show: true, message: err.message || 'Failed to save responses', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[660px] mx-auto py-12 px-4 animate-fade">
      {localToast.show && (
        <Toast 
          message={localToast.message} 
          type={localToast.type} 
          onClose={() => setLocalToast({ ...localToast, show: false })} 
        />
      )}

      <div className="w-full bg-white border border-border rounded-2xl p-8 shadow-custom text-left">
        <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
          Short Onboarding — For Existing Pod Members
        </div>
        
        <div className="mb-5 text-left">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
            Primary housing intent
          </label>
          <select 
            value={housingIntent}
            onChange={(e) => setHousingIntent(e.target.value)}
            disabled={saving}
            className="w-full bg-panel border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
          >
            <option value="Co-develop property">Co-develop property</option>
            <option value="Purchase primary residence">Purchase primary residence</option>
            <option value="Investment hold">Investment hold</option>
          </select>
        </div>

        <div className="mb-5 text-left">
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
            Minimum commitment timeline
          </label>
          <select 
            value={commitmentTimeline}
            onChange={(e) => setCommitmentTimeline(e.target.value)}
            disabled={saving}
            className="w-full bg-panel border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
          >
            <option value="2+ years">2+ years</option>
            <option value="5+ years">5+ years</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        <p className="text-xs text-ink-dim font-medium italic mb-6 text-left">
          Location and matching questions are skipped — your group is already formed.
        </p>

        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setActiveScreen('profile')}
            disabled={saving}
            className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button 
            onClick={handleContinue}
            disabled={saving}
            className="bg-amber text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#b05d3e] active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-75"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving answers...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
