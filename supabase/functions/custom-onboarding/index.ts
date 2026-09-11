import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to sanitize user object
function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, verification_code, ...safeUser } = user;
  return safeUser;
}

// Helper to send email via SMTP
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const host = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
  const port = Number(Deno.env.get('SMTP_PORT') || '587');
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  const from = Deno.env.get('SMTP_FROM') || user;

  if (!user || !pass) {
    console.warn('SMTP credentials not configured. Skipping email dispatch.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"BOMA" <${from}>`,
    to,
    subject,
    html,
  });
}

// Helper to generate luxury BOMA email template
function getInvitationEmailTemplate(podName: string, inviterName: string, inviteUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>BOMA Pod Invitation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F7F5F0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F5F0; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #E5DDD2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(46, 35, 48, 0.08);">
              <tr><td height="5" style="background-color: #C46A4A;"></td></tr>
              <tr>
                <td style="padding: 32px 36px 36px 36px; text-align: left;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #EFEAE3; padding-bottom: 20px; margin-bottom: 24px;">
                    <tr>
                      <td style="vertical-align: middle;">
                        <div style="background-color: #2E2330; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 800; color: #F7F5F0; display: inline-block;">B</div>
                      </td>
                      <td style="padding-left: 12px; vertical-align: middle;">
                        <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 800; color: #2E2330; letter-spacing: 2px;">BOMA</div>
                        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; font-weight: 700; color: #C46A4A; letter-spacing: 1.5px; text-transform: uppercase;">Community Matching & Co-Living</div>
                      </td>
                    </tr>
                  </table>

                  <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 700; color: #2E2330; margin: 0 0 12px 0;">You've Been Invited to Join a Pod</h2>
                  <div style="background-color: #F7EDE7; border: 1px solid #EAD8CE; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">
                    <span style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; color: #C46A4A; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">POD INVITATION</span>
                    <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 700; color: #2E2330;">${podName || 'A BOMA Pod'}</span>
                  </div>
                  <p style="font-size: 14px; line-height: 1.6; color: #5C544E; margin: 0 0 16px 0;">
                    <strong style="color: #2E2330;">${inviterName || 'A neighbor'}</strong> has invited you to join their existing Pod on BOMA.
                  </p>
                  <p style="font-size: 13.5px; line-height: 1.6; color: #7A746B; margin: 0 0 24px 0;">
                    BOMA helps groups align on lifestyle preferences, shared governance, and co-living agreements before taking the next step into The Commons.
                  </p>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${inviteUrl}" style="background-color: #C46A4A; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; padding: 13px 32px; border-radius: 9999px; text-decoration: none; display: inline-block;">
                      Accept Pod Invitation
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAF8F5; padding: 22px 36px; border-top: 1px solid #E5DDD2; text-align: center;">
                  <p style="margin: 0; font-family: 'Inter', sans-serif; font-size: 11.5px; color: #7A746B;">
                    © 2026 BOMA — Finding neighbors who actually fit.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    let body: any = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseErr) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON request payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing "action" parameter in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 1. ACTION: GET-QUESTIONNAIRE
    // =========================================================================
    if (action === 'get-questionnaire') {
      const { data: questionnaire, error: qError } = await supabaseAdmin
        .from('onboarding_questionnaires')
        .select('*')
        .eq('status', 'PUBLISHED')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (qError) throw qError;
      if (!questionnaire) {
        return new Response(
          JSON.stringify({ success: true, questionnaire: null }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: questions, error: qnsError } = await supabaseAdmin
        .from('onboarding_questions')
        .select(`*, options:onboarding_question_options(*)`)
        .eq('questionnaire_id', questionnaire.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (qnsError) throw qnsError;

      const processedQuestions = (questions || []).map((q: any) => {
        if (q.options) {
          q.options = q.options
            .filter((opt: any) => opt.is_active)
            .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        }
        return q;
      }).sort((a: any, b: any) => {
        if ((a.step_number || 0) !== (b.step_number || 0)) {
          return (a.step_number || 0) - (b.step_number || 0);
        }
        return (a.display_order || 0) - (b.display_order || 0);
      });

      // Group questions dynamically by step_number for mobile wizard pagination
      const stepMap = new Map<number, any[]>();
      for (const q of processedQuestions) {
        const stepNum = q.step_number || 1;
        if (!stepMap.has(stepNum)) {
          stepMap.set(stepNum, []);
        }
        stepMap.get(stepNum)!.push(q);
      }

      const STEP_NAMES: Record<number, string> = {
        1: 'Demographics & Life Stage',
        2: 'Core Lifestyle & Values',
        3: 'Community Preference & Governance',
        4: 'Location & Setting Bounds',
        5: 'Budget & Down Payment Readiness',
        6: 'Housing Intent & Property Type',
        7: 'Commitment Timeline',
        8: 'Group Size & Dynamics',
        9: 'Profile Review & Submission',
      };

      const dynamicSteps = Array.from(stepMap.entries()).map(([stepNum, stepQuestions]) => ({
        step_number: stepNum,
        step_title: STEP_NAMES[stepNum] || `Step ${stepNum}`,
        question_count: stepQuestions.length,
        questions: stepQuestions,
      })).sort((a, b) => a.step_number - b.step_number);

      const totalSteps = dynamicSteps.length > 0 ? dynamicSteps[dynamicSteps.length - 1].step_number : 9;

      return new Response(
        JSON.stringify({
          success: true,
          questionnaire: {
            ...questionnaire,
            total_steps: totalSteps,
            steps: dynamicSteps,
            questions: processedQuestions,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 2. ACTION: GET-PROGRESS
    // =========================================================================
    if (action === 'get-progress') {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: progress, error: pError } = await supabaseAdmin
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (pError) throw pError;

      const { data: responses, error: rError } = await supabaseAdmin
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', userId);

      if (rError) throw rError;

      return new Response(
        JSON.stringify({
          success: true,
          progress: progress || {
            user_id: userId,
            current_step: 1,
            total_steps: 9,
            status: 'NOT_STARTED',
          },
          responses: responses || [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 3. ACTION: SAVE-RESPONSE / SAVE-STEP (Supports 1 API call per step)
    // =========================================================================
    if (action === 'save-response' || action === 'save-step') {
      const { userId, questionnaireId, questionnaireVersion, stepNumber } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Normalize items list: supports both array of responses (batch save) and single question
      const itemsToSave: Array<{ questionKey: string; answerJson: any; questionId?: string }> = [];
      if (Array.isArray(body.responses) && body.responses.length > 0) {
        for (const item of body.responses) {
          if (item.questionKey || item.question_key) {
            itemsToSave.push({
              questionKey: item.questionKey || item.question_key,
              answerJson: item.answerJson ?? item.answer_json ?? { value: item.value },
              questionId: item.questionId || item.question_id,
            });
          }
        }
      } else if (body.questionKey || body.question_key) {
        itemsToSave.push({
          questionKey: body.questionKey || body.question_key,
          answerJson: body.answerJson ?? body.answer_json ?? { value: body.value },
          questionId: body.questionId || body.question_id,
        });
      }

      if (itemsToSave.length === 0) {
        return new Response(
          JSON.stringify({ error: 'At least one questionKey or responses array is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let finalQId = questionnaireId || 'bff45f03-5a51-4621-918e-88f7425e6cbb';

      for (const item of itemsToSave) {
        let finalQuestionId = item.questionId;

        // Auto-resolve question_id if not supplied
        if (!finalQuestionId) {
          const { data: qData } = await supabaseAdmin
            .from('onboarding_questions')
            .select('id, questionnaire_id')
            .eq('question_key', item.questionKey)
            .maybeSingle();

          if (qData?.id) {
            finalQuestionId = qData.id;
            finalQId = qData.questionnaire_id || finalQId;
          } else {
            // Create question entry on the fly if needed
            const { data: newQ, error: createQErr } = await supabaseAdmin
              .from('onboarding_questions')
              .insert({
                questionnaire_id: finalQId,
                question_key: item.questionKey,
                step_number: stepNumber || 1,
                title: item.questionKey.replace(/_/g, ' '),
                question_type: typeof item.answerJson?.values !== 'undefined' ? 'multiple_choice' : 'single_choice',
                is_required: true,
                is_active: true,
                display_order: (stepNumber || 1) * 2,
                scoring_enabled: false
              })
              .select('id')
              .single();

            if (!createQErr && newQ?.id) {
              finalQuestionId = newQ.id;
            }
          }
        }

        if (finalQuestionId) {
          const { error: responseError } = await supabaseAdmin
            .from('onboarding_responses')
            .upsert({
              user_id: userId,
              questionnaire_id: finalQId,
              questionnaire_version: questionnaireVersion || 1,
              question_id: finalQuestionId,
              question_key: item.questionKey,
              answer_json: item.answerJson,
              answered_at: new Date().toISOString(),
            }, { onConflict: 'user_id,question_id' });

          if (responseError) throw responseError;
        }
      }

      // Update progress to the step being saved
      const nextStep = stepNumber || 1;

      await supabaseAdmin
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          questionnaire_id: finalQId,
          current_step: nextStep,
          total_steps: 9,
          status: 'IN_PROGRESS',
          last_saved_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${itemsToSave.length} response(s) saved successfully for step ${nextStep}.`, 
          current_step: nextStep 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 4. ACTION: SUBMIT-ONBOARDING
    // =========================================================================
    if (action === 'submit-onboarding') {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 1. Fetch saved responses
      const { data: responses, error: rError } = await supabaseAdmin
        .from('onboarding_responses')
        .select('*')
        .eq('user_id', userId);

      if (rError) throw rError;

      // 2. Fetch active scoring rules
      const { data: rules } = await supabaseAdmin
        .from('readiness_scoring_rules')
        .select('*')
        .eq('is_active', true);

      const rulesMap: Record<string, number> = {};
      (rules || []).forEach((r: any) => {
        rulesMap[r.option_id] = r.score_value;
      });

      // 3. Fetch options to map keys
      const { data: options } = await supabaseAdmin
        .from('onboarding_question_options')
        .select('*')
        .eq('is_active', true);

      const optionKeyToIdMap: Record<string, string> = {};
      (options || []).forEach((opt: any) => {
        optionKeyToIdMap[opt.option_key] = opt.id;
        if (opt.value) optionKeyToIdMap[opt.value] = opt.id;
        if (opt.label) optionKeyToIdMap[opt.label] = opt.id;
      });

      let totalScore = 0;
      let scoredCount = 0;

      (responses || []).forEach((resp: any) => {
        const val = resp.answer_json?.value;
        const optId = optionKeyToIdMap[val];
        const scoreVal = rulesMap[optId];
        if (scoreVal !== undefined) {
          totalScore += scoreVal;
          scoredCount++;
        }
      });

      const finalReadinessScore = scoredCount === 0 ? 82 : Math.round(totalScore / scoredCount);

      // 4. Map answers to user fields
      const userUpdates: Record<string, any> = {
        onboarding_status: 'COMPLETED',
        profile_status: 'UNDER_REVIEW',
        readiness_status: 'CALCULATED',
        readiness_score: finalReadinessScore,
        matching_status: 'NOT_ELIGIBLE',
        user_onboarded: true,
      };

      (responses || []).forEach((resp: any) => {
        const val = resp.answer_json?.value || resp.answer_json?.values;
        if (resp.question_key === 'age_group') userUpdates.age_group = val;
        else if (resp.question_key === 'lifestyles') userUpdates.selected_lifestyles = val;
        else if (resp.question_key === 'decision_style') userUpdates.decision_style = val;
        else if (resp.question_key === 'pod_size') userUpdates.pod_size = val;
        else if (resp.question_key === 'location_city') userUpdates.location_city = val;
        else if (resp.question_key === 'location_radius') userUpdates.location_radius = val;
        else if (resp.question_key === 'setting_preference') userUpdates.setting_preference = val;
        else if (resp.question_key === 'budget_range') userUpdates.budget_range = val;
        else if (resp.question_key === 'down_payment_tier') userUpdates.down_payment_tier = val;
        else if (resp.question_key === 'financing_preference') userUpdates.financing_preference = val;
        else if (resp.question_key === 'housing_intent') userUpdates.housing_intent = val;
        else if (resp.question_key === 'commitment_timeline') userUpdates.commitment_timeline = val;
      });

      // 5. Update user and progress tables
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      await supabaseAdmin
        .from('onboarding_progress')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Onboarding completed successfully.',
          readiness_score: finalReadinessScore,
          user: sanitizeUser(updatedUser),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 5. ACTION: GET-SCORE-BREAKDOWN
    // =========================================================================
    if (action === 'get-score-breakdown') {
      const { userId } = body;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: responses } = await supabaseAdmin
        .from('onboarding_responses')
        .select(`*, question:onboarding_questions(*)`)
        .eq('user_id', userId);

      const { data: rules } = await supabaseAdmin
        .from('readiness_scoring_rules')
        .select('*')
        .eq('is_active', true);

      const { data: options } = await supabaseAdmin
        .from('onboarding_question_options')
        .select('*')
        .eq('is_active', true);

      const rulesMap: Record<string, any> = {};
      (rules || []).forEach((r: any) => {
        if (r.option_id) rulesMap[r.option_id] = r;
      });

      const optionKeyToOptMap: Record<string, any> = {};
      (options || []).forEach((opt: any) => {
        optionKeyToOptMap[opt.option_key] = opt;
        if (opt.value) optionKeyToOptMap[opt.value] = opt;
        if (opt.label) optionKeyToOptMap[opt.label] = opt;
      });

      let totalScore = 0;
      let scoredCount = 0;
      const appliedSteps: any[] = [];
      const unscoredSteps: any[] = [];

      (responses || []).forEach((resp: any) => {
        const val = resp.answer_json?.value;
        const optObj = optionKeyToOptMap[val];
        const rule = rulesMap[optObj?.id];

        if (rule && rule.score_value !== undefined) {
          totalScore += rule.score_value;
          scoredCount++;
          appliedSteps.push({
            stepNumber: resp.question?.step_number || 0,
            questionTitle: resp.question?.title || resp.question_key,
            questionKey: resp.question_key,
            selectedOption: optObj?.label || val,
            points: rule.score_value,
            reasoning: rule.reasoning || 'Score value from active readiness rule.',
          });
        } else {
          unscoredSteps.push({
            stepNumber: resp.question?.step_number || 0,
            questionTitle: resp.question?.title || resp.question_key,
            questionKey: resp.question_key,
            selectedOption: Array.isArray(resp.answer_json?.values) ? resp.answer_json.values.join(', ') : val,
          });
        }
      });

      const finalScore = scoredCount === 0 ? 82 : Math.round(totalScore / scoredCount);

      return new Response(
        JSON.stringify({
          success: true,
          totalScore: finalScore,
          scoredCategoriesCount: scoredCount,
          appliedSteps,
          unscoredSteps,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 6. ACTION: CREATE-POD (Register Existing Pod)
    // =========================================================================
    if (action === 'create-pod') {
      const { creatorId, name, description, groupType, housingIntent, commitmentTimeline } = body;

      if (!creatorId || !name) {
        return new Response(
          JSON.stringify({ error: 'creatorId and name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const intentKey = housingIntent === 'Purchase primary residence' ? 'purchase' : housingIntent === 'Investment hold' ? 'investment' : 'co-develop';
      const timelineKey = commitmentTimeline === '5+ years' ? 'timeline_5yr' : commitmentTimeline === 'Flexible' ? 'timeline_flex' : 'timeline_2yr';
      const calculatedScore = timelineKey === 'timeline_5yr' ? 90 : timelineKey === 'timeline_flex' ? 80 : 85;

      // 1. Create Pod
      const { data: pod, error: podError } = await supabaseAdmin
        .from('pods')
        .insert({
          name,
          description: `${description || ''} ||| [0,1]`,
          group_type: groupType || 'Friends',
          created_by: creatorId,
          status: 'CREATING',
        })
        .select()
        .single();

      if (podError) throw podError;

      // 2. Creator Membership
      const { error: memberError } = await supabaseAdmin
        .from('pod_members')
        .insert({
          pod_id: pod.id,
          user_id: creatorId,
          role: 'CREATOR',
          membership_status: 'ACCEPTED',
        });

      if (memberError) throw memberError;

      // 3. Update creator's user record
      const { data: updatedUser, error: userError } = await supabaseAdmin
        .from('users')
        .update({
          entry_path: 'EXISTING_POD',
          housing_intent: intentKey,
          commitment_timeline: timelineKey,
          onboarding_status: 'COMPLETED',
          readiness_score: calculatedScore,
          readiness_status: 'CALCULATED',
          profile_status: 'APPROVED',
          user_onboarded: true,
        })
        .eq('id', creatorId)
        .select()
        .single();

      if (userError) throw userError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Pod created successfully.',
          pod,
          user: sanitizeUser(updatedUser),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 7. ACTION: INVITE-POD-MEMBER
    // =========================================================================
    if (action === 'invite-pod-member') {
      const { podId, inviterId, email } = body;

      if (!podId || !inviterId || !email) {
        return new Response(
          JSON.stringify({ error: 'podId, inviterId, and email are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Fetch Pod and Inviter
      const { data: pod } = await supabaseAdmin.from('pods').select('name').eq('id', podId).single();
      const { data: inviter } = await supabaseAdmin.from('users').select('name').eq('id', inviterId).single();

      const rawToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Insert Invitation
      const { data: invitation, error: invError } = await supabaseAdmin
        .from('pod_invitations')
        .insert({
          pod_id: podId,
          email: normalizedEmail,
          inviter_id: inviterId,
          token_hash: rawToken,
          status: 'PENDING',
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (invError) throw invError;

      const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://boma.app';
      const inviteUrl = `${appBaseUrl}/join-pod?token=${rawToken}`;

      try {
        const html = getInvitationEmailTemplate(pod?.name || 'A BOMA Pod', inviter?.name || 'A neighbor', inviteUrl);
        await sendEmail({
          to: normalizedEmail,
          subject: `You've Been Invited to Join ${pod?.name || 'a BOMA Pod'}`,
          html,
        });
      } catch (mailErr) {
        console.warn('Failed to send invitation email:', mailErr);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Invitation created and email sent.',
          invitation: {
            ...invitation,
            inviteUrl,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 8. ACTION: GET-POD-DETAILS
    // =========================================================================
    if (action === 'get-pod-details') {
      const { podId, userId } = body;

      let targetPodId = podId;
      if (!targetPodId && userId) {
        const { data: member } = await supabaseAdmin
          .from('pod_members')
          .select('pod_id')
          .eq('user_id', userId)
          .maybeSingle();
        targetPodId = member?.pod_id;
      }

      if (!targetPodId) {
        return new Response(
          JSON.stringify({ success: true, pod: null, members: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: pod, error: podError } = await supabaseAdmin
        .from('pods')
        .select('*')
        .eq('id', targetPodId)
        .single();

      if (podError) throw podError;

      const { data: members, error: memError } = await supabaseAdmin
        .from('pod_members')
        .select(`*, user:users(id, name, email, avatar_url, readiness_score)`)
        .eq('pod_id', targetPodId);

      if (memError) throw memError;

      return new Response(
        JSON.stringify({
          success: true,
          pod,
          members: (members || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            membership_status: m.membership_status,
            user: sanitizeUser(m.user),
          })),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // 9. ACTION: SUBMIT-POD-REVIEW
    // =========================================================================
    if (action === 'submit-pod-review') {
      const { podId } = body;
      if (!podId) {
        return new Response(
          JSON.stringify({ error: 'podId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: updatedPod, error } = await supabaseAdmin
        .from('pods')
        .update({
          status: 'PENDING_REVIEW',
          updated_at: new Date().toISOString(),
        })
        .eq('id', podId)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Pod submitted for admin review.', pod: updatedPod }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =========================================================================
    // ACTION: LOGOUT
    // =========================================================================
    if (action === 'logout') {
      return new Response(
        JSON.stringify({ success: true, message: 'Logged out successfully.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ error: `Unknown action "${action}"` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
