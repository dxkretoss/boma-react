import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Edit2, Archive, Check, ArrowLeft, RefreshCw, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import { 
  fetchAdminQuestionsList, 
  saveAdminQuestion, 
  saveAdminQuestionOption, 
  archiveAdminQuestionOption, 
  publishQuestionnaireVersion,
  deleteAdminQuestion
} from '../../../api/admin';

// Unified QuestionRenderer component
export function QuestionRenderer({ question, answer, onChange }) {
  if (!question) return null;

  const { question_type, title, description, is_required, options } = question;

  switch (question_type) {
    case 'single_choice':
      return (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-ink mb-1">
            {title} {is_required && <span className="text-rust">*</span>}
          </label>
          {description && <p className="text-xs text-ink-dim leading-relaxed mb-3">{description}</p>}
          <div className="flex flex-col gap-2">
            {(options || []).map(opt => (
              <div
                key={opt.id}
                onClick={() => onChange(opt.value || opt.option_key)}
                className={`flex justify-between items-center border rounded-xl p-4 bg-white cursor-pointer transition-all ${
                  answer === (opt.value || opt.option_key)
                    ? 'ring-2 ring-amber/20 border-amber bg-amber-soft/10'
                    : 'border-border hover:border-amber hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-ink">{opt.label}</span>
                  {opt.description && <span className="text-[10px] text-ink-dim mt-0.5">{opt.description}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'multiple_choice':
      const currentValues = Array.isArray(answer) ? answer : [];
      const handleToggle = (val) => {
        if (currentValues.includes(val)) {
          onChange(currentValues.filter(v => v !== val));
        } else {
          onChange([...currentValues, val]);
        }
      };

      return (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-ink mb-1">
            {title} {is_required && <span className="text-rust">*</span>}
          </label>
          {description && <p className="text-xs text-ink-dim leading-relaxed mb-3">{description}</p>}
          <div className="grid grid-cols-2 gap-2">
            {(options || []).map(opt => {
              const isSelected = currentValues.includes(opt.label);
              return (
                <div
                  key={opt.id}
                  onClick={() => handleToggle(opt.label)}
                  className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber bg-amber-soft/30'
                      : 'border-border bg-white hover:border-amber hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-ink leading-tight ">
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'range':
      return (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-ink">
            <span>{title} {is_required && <span className="text-rust">*</span>}</span>
            <span className="font-mono text-xs">{answer || 45} mi</span>
          </div>
          {description && <p className="text-xs text-ink-dim leading-relaxed mb-2">{description}</p>}
          <input
            type="range"
            min="5"
            max="150"
            value={answer || 45}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
          />
        </div>
      );

    case 'text':
    default:
      return (
        <div className="space-y-2">
          <label className="block text-sm font-bold text-ink mb-1">
            {title} {is_required && <span className="text-rust">*</span>}
          </label>
          {description && <p className="text-xs text-ink-dim leading-relaxed mb-2">{description}</p>}
          <input
            type="text"
            placeholder="Enter response..."
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-border rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:border-amber"
          />
        </div>
      );
  }
}

export default function AdminQuestions({ setActiveScreen, adminUser, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingOptions, setEditingOptions] = useState([]);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState({ label: '', description: '', value: '', scoring_points: 0 });
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [previewAnswer, setPreviewAnswer] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const list = await fetchAdminQuestionsList();
      setQuestions(list);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load questions list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSelectEdit = async (qn) => {
    setEditingQuestion({ ...qn });
    setEditingOptions(qn.options || []);
    // Fetch readiness scores for choices
    try {
      const { data: scoringRules } = await supabase
        .from('readiness_scoring_rules')
        .select('*')
        .eq('is_active', true);
      
      const rulesMap = {};
      (scoringRules || []).forEach(r => {
        rulesMap[r.option_id] = r.score_value;
      });

      const enrichedOptions = (qn.options || []).map(opt => ({
        ...opt,
        scoring_points: rulesMap[opt.id] || 0
      }));
      setEditingOptions(enrichedOptions);
    } catch (e) {
      console.error(e);
    }
  };

  const [activeStepTab, setActiveStepTab] = useState(1);

  const handleCreateNewQuestion = () => {
    const questionnaireId = questions[0]?.questionnaire_id || null;
    const stepNum = typeof activeStepTab === 'number' ? activeStepTab : 1;
    setEditingQuestion({
      questionnaire_id: questionnaireId,
      question_key: '',
      step_number: stepNum,
      title: '',
      description: '',
      question_type: 'single_choice',
      is_required: true,
      is_active: true,
      display_order: questions.filter(q => q.step_number === stepNum).length + 1,
      scoring_enabled: true
    });
    setEditingOptions([]);
  };

  const handleDeleteQuestion = async (qnId) => {
    if (showConfirm) {
      showConfirm(
        'Delete Question',
        'Are you sure you want to delete this question? This will permanently remove its choices and scoring rules.',
        async () => {
          try {
            setErrorMsg('');
            setSuccessMsg('');
            await deleteAdminQuestion(qnId);
            setSuccessMsg('Question deleted successfully!');
            loadQuestions();
          } catch (err) {
            console.error(err);
            setErrorMsg(err.message || 'Failed to delete question.');
          }
        },
        'danger',
        'Delete'
      );
    } else {
      if (!confirm('Are you sure you want to delete this question? This will permanently remove its choices and scoring rules.')) return;
      try {
        setErrorMsg('');
        setSuccessMsg('');
        await deleteAdminQuestion(qnId);
        setSuccessMsg('Question deleted successfully!');
        loadQuestions();
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to delete question.');
      }
    }
  };

  const handleSaveQuestionDetails = async () => {
    if (!editingQuestion.title.trim() || !editingQuestion.question_key.trim()) {
      showToast('Question Key and Title are required.');
      return;
    }

    try {
      setErrorMsg('');
      const saved = await saveAdminQuestion(editingQuestion);
      setSuccessMsg('Question details saved successfully!');
      
      // Update local state list
      await loadQuestions();
      setEditingQuestion(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save question details.');
    }
  };

  const handleAddOption = async () => {
    if (!newOption.label.trim()) {
      showToast('Option Label is required.');
      return;
    }

    try {
      setErrorMsg('');
      const optKey = newOption.label.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const optPayload = {
        questionId: editingQuestion.id,
        optionKey: optKey,
        label: newOption.label,
        description: newOption.description,
        value: newOption.value || optKey,
        displayOrder: editingOptions.length + 1,
        isActive: true
      };

      const savedOpt = await saveAdminQuestionOption(optPayload);
      
      // Save scoring rules points if > 0
      if (parseInt(newOption.scoring_points) > 0) {
        await supabase
          .from('readiness_scoring_rules')
          .insert([{
            question_id: editingQuestion.id,
            option_id: savedOpt.id,
            score_value: parseInt(newOption.scoring_points)
          }]);
      }

      setEditingOptions([...editingOptions, { ...savedOpt, scoring_points: parseInt(newOption.scoring_points) || 0 }]);
      setNewOption({ label: '', description: '', value: '', scoring_points: 0 });
      setShowAddOption(false);
      loadQuestions();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to add option.');
    }
  };

  const handleArchiveOption = async (optId) => {
    if (showConfirm) {
      showConfirm(
        'Archive Option',
        'Are you sure you want to archive this option?',
        async () => {
          try {
            await archiveAdminQuestionOption(optId);
            setEditingOptions(editingOptions.filter(o => o.id !== optId));
            loadQuestions();
          } catch (err) {
            console.error(err);
            showToast('Failed to archive option.');
          }
        },
        'danger',
        'Archive'
      );
    } else {
      if (!confirm('Are you sure you want to archive this option?')) return;
      try {
        await archiveAdminQuestionOption(optId);
        setEditingOptions(editingOptions.filter(o => o.id !== optId));
        loadQuestions();
      } catch (err) {
        console.error(err);
        showToast('Failed to archive option.');
      }
    }
  };

  const STEP_TABS = [
    { step: 1, label: 'Step 1: Age Group' },
    { step: 2, label: 'Step 2: Lifestyle & Values' },
    { step: 3, label: 'Step 3: Community Preferences' },
    { step: 4, label: 'Step 4: Location Bounds' },
    { step: 5, label: 'Step 5: Budget & Financing' },
    { step: 'all', label: 'All Steps' }
  ];

  const filteredQuestions = activeStepTab === 'all'
    ? questions
    : questions.filter(q => q.step_number === activeStepTab);

  return (
    <div className="w-full text-left  animate-fade">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Admin / Question Management</div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-display font-extrabold text-2xl text-ink">Onboarding Questionnaire Editor</h3>
        {!editingQuestion && (
          <button 
            onClick={handleCreateNewQuestion}
            className="bg-teal hover:bg-teal-700 text-white font-bold text-xs rounded-xl px-4.5 py-2.5 flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        )}
      </div>
      <p className="text-ink-dim text-sm leading-relaxed mb-6 max-w-[560px]">
        Design onboarding steps, manage question options, assign point weights for readiness score calculation, and publish questionnaire versions.
      </p>

      {/* Step Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4 mb-6">
        {STEP_TABS.map(tab => (
          <button
            key={tab.step}
            onClick={() => {
              setActiveStepTab(tab.step);
              setEditingQuestion(null);
              setPreviewQuestion(null);
            }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStepTab === tab.step
                ? 'bg-teal text-white shadow-sm'
                : 'bg-white border border-border text-ink-dim hover:bg-slate-50 hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-100 text-rust text-xs font-semibold p-4 rounded-xl mb-5">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-teal text-xs font-semibold p-4 rounded-xl mb-5">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left pane: Questions list or editor details */}
        <div className="lg:col-span-8 space-y-5">
          {editingQuestion ? (
            <div className="border border-border rounded-2xl p-6 bg-white shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h4 className="font-display font-extrabold text-base text-ink">Edit Question Details</h4>
                <button 
                  onClick={() => setEditingQuestion(null)}
                  className="text-xs text-ink-dim hover:text-ink font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10.5px] font-mono uppercase text-ink-dim mb-1 font-bold">Question Key</label>
                  <input 
                    type="text" 
                    value={editingQuestion.question_key}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question_key: e.target.value })}
                    className="border border-border rounded-lg text-xs font-medium px-3.5 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10.5px] font-mono uppercase text-ink-dim mb-1 font-bold">Step Number (1–7)</label>
                  <input 
                    type="number" 
                    value={editingQuestion.step_number}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, step_number: parseInt(e.target.value) })}
                    className="border border-border rounded-lg text-xs font-medium px-3.5 py-2"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10.5px] font-mono uppercase text-ink-dim mb-1 font-bold">Question Type</label>
                  <select 
                    value={editingQuestion.question_type}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question_type: e.target.value })}
                    className="border border-border rounded-lg text-xs font-semibold px-3 py-2 bg-white"
                  >
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Text Response</option>
                    <option value="range">Range / Scale</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10.5px] font-mono uppercase text-ink-dim mb-1 font-bold">Display Order</label>
                  <input 
                    type="number" 
                    value={editingQuestion.display_order || 1}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, display_order: parseInt(e.target.value) })}
                    className="border border-border rounded-lg text-xs font-medium px-3.5 py-2"
                  />
                </div>
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10.5px] font-mono uppercase text-ink-dim mb-1 font-bold">Question Title</label>
                  <input 
                    type="text" 
                    value={editingQuestion.title}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    className="border border-border rounded-lg text-xs font-semibold px-3.5 py-2"
                  />
                </div>
                <div className="col-span-2 flex flex-col">
                  <label className="text-[10.5px] font-mono uppercase text-ink-dim mb-1 font-bold">Description / Helper Text</label>
                  <textarea 
                    value={editingQuestion.description || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, description: e.target.value })}
                    className="border border-border rounded-lg text-xs font-medium p-3"
                    rows={2.5}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="required_chk"
                    checked={editingQuestion.is_required}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, is_required: e.target.checked })}
                    className="w-4 h-4 rounded text-amber"
                  />
                  <label htmlFor="required_chk" className="text-xs font-bold text-ink">Required Question</label>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="active_chk"
                    checked={editingQuestion.is_active}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-amber"
                  />
                  <label htmlFor="active_chk" className="text-xs font-bold text-ink">Active in Survey</label>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button 
                  onClick={handleSaveQuestionDetails}
                  className="bg-amber text-white font-bold text-xs rounded-lg px-4.5 py-2.5 shadow hover:bg-[#2450C4] transition-colors"
                >
                  Save Question Details
                </button>
              </div>

              {/* Options list for choices */}
              {['single_choice', 'multiple_choice'].includes(editingQuestion.question_type) && (
                <div className="pt-5 border-t border-border space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <h5 className="font-display font-extrabold text-[13.5px] text-ink uppercase tracking-wide">Options &amp; Scoring Points</h5>
                    <button 
                      onClick={() => setShowAddOption(true)}
                      className="bg-teal text-white font-bold text-xs rounded-lg px-3 py-1.5 flex items-center gap-1 hover:bg-teal-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Choice
                    </button>
                  </div>

                  {showAddOption && (
                    <div className="bg-panel-alt/30 border border-border p-4 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-mono uppercase text-ink-dim mb-1 font-bold">Choice Label</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 18-30 years"
                            value={newOption.label}
                            onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                            className="bg-white border border-border rounded-lg text-xs font-medium px-3 py-1.5"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] font-mono uppercase text-ink-dim mb-1 font-bold">Readiness Score Points (0–100)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 85"
                            value={newOption.scoring_points}
                            onChange={(e) => setNewOption({ ...newOption, scoring_points: parseInt(e.target.value) })}
                            className="bg-white border border-border rounded-lg text-xs font-medium px-3 py-1.5"
                          />
                        </div>
                        <div className="col-span-2 flex flex-col">
                          <label className="text-[10px] font-mono uppercase text-ink-dim mb-1 font-bold">Helper Subtext</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Nomads, Professionals & Creators"
                            value={newOption.description}
                            onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                            className="bg-white border border-border rounded-lg text-xs font-medium px-3 py-1.5"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button 
                          onClick={() => setShowAddOption(false)}
                          className="bg-transparent border border-border text-ink rounded-lg py-1 px-3 text-xs font-bold hover:bg-white"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleAddOption}
                          className="bg-teal text-white rounded-lg py-1 px-3.5 text-xs font-bold hover:bg-teal-700"
                        >
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {editingOptions.map(opt => (
                      <div key={opt.id} className="flex justify-between items-center border border-border rounded-xl p-3 bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink">{opt.label}</span>
                          {opt.description && <span className="text-[10.5px] text-ink-dim font-medium mt-0.5">{opt.description}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] font-mono text-ink-dim uppercase font-bold">Scoring Rule</span>
                            <span className="text-xs font-mono font-bold text-teal">{opt.scoring_points || 0} pts</span>
                          </div>
                          <button 
                            onClick={() => handleArchiveOption(opt.id)}
                            className="text-rust hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="border border-border rounded-2xl p-10 bg-white text-center text-ink-dim font-medium animate-pulse">
                  Loading onboarding questions for this step...
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="border border-border border-dashed rounded-2xl p-12 bg-white text-center text-ink-dim font-medium">
                  <HelpCircle className="w-8 h-8 text-ink-dim/40 mx-auto mb-3" />
                  <p className="text-sm">No questions registered under this step yet.</p>
                  <button
                    onClick={handleCreateNewQuestion}
                    className="mt-4 bg-teal hover:bg-teal-700 text-white font-bold text-xs rounded-xl px-4 py-2 transition-colors cursor-pointer"
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                filteredQuestions.map((qn) => (
                  <div key={qn.id} className="border border-border rounded-2xl bg-white shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Left Accent Color Indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal" />
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold bg-[#F1F5F9] text-ink px-2 py-0.5 rounded-md">
                            Step {qn.step_number}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-amber-soft text-amber px-2 py-0.5 rounded-md capitalize">
                            {qn.question_type.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            qn.is_active ? 'bg-emerald-50 text-teal border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            {qn.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {qn.is_required && (
                            <span className="text-[10px] font-bold bg-red-50 text-rust border border-red-100 px-2 py-0.5 rounded-md">
                              Required
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-extrabold text-base text-ink leading-snug">
                          {qn.title}
                        </h4>
                        <div className="text-[11px] text-ink-dim font-mono mt-1">
                          Key: <span className="font-semibold">{qn.question_key}</span> | Order: <span className="font-semibold">{qn.display_order || 1}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 bg-[#F8FAFC] border border-border p-1 rounded-xl">
                        <button 
                          onClick={() => setPreviewQuestion(qn)}
                          className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Preview Question"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSelectEdit(qn)}
                          className="text-teal hover:text-teal-700 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Edit Details / Options"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(qn.id)}
                          className="text-rust hover:text-red-700 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Description */}
                    {qn.description && (
                      <p className="text-xs text-ink-dim leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-border/40">
                        {qn.description}
                      </p>
                    )}

                    {/* Options list for choices rendering */}
                    {['single_choice', 'multiple_choice'].includes(qn.question_type) && (
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-mono uppercase text-ink-dim tracking-wider font-bold">
                            Configured Choices ({qn.options?.length || 0})
                          </span>
                        </div>
                        {qn.options && qn.options.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {qn.options.map(opt => (
                              <div 
                                key={opt.id} 
                                className="border border-border/80 rounded-xl p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center gap-3"
                              >
                                <div className="text-left">
                                  <div className="text-xs font-bold text-ink">{opt.label}</div>
                                  {opt.description && (
                                    <div className="text-[10px] text-ink-dim font-medium mt-0.5">
                                      {opt.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-[10px] font-mono font-bold bg-[#E0F2FE] text-sky-700 px-2 py-0.5 rounded-md">
                                    {opt.scoring_points || 0} pts
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11.5px] text-ink-dim italic">
                            No options created yet. Click edit button above to add choices and define readiness scoring rules.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right pane: Preview and Publish actions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Unified Preview Rendering Box */}
          <div className="border border-border rounded-2xl p-5 bg-slate-50/70 text-left">
            <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-ink border-b border-border/80 pb-2 mb-3.5 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber" /> Question Live Preview
            </h4>

            {previewQuestion ? (
              <div className="bg-white border border-border p-5 rounded-xl shadow-sm space-y-4">
                <QuestionRenderer 
                  question={previewQuestion}
                  answer={previewAnswer}
                  onChange={(val) => setPreviewAnswer(val)}
                />
                <button 
                  onClick={() => {
                    setPreviewQuestion(null);
                    setPreviewAnswer(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-ink text-[11px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Preview
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-ink-dim text-xs font-semibold bg-white border border-dashed border-border rounded-xl">
                Click the preview eye icon on a question list row to display its live rendering here.
              </div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setActiveScreen('admin-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
