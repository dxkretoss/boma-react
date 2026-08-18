import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Mail, Phone, Calendar, RefreshCw, FileText, X, CheckCircle2, HelpCircle, Code } from 'lucide-react';
import { fetchVillageTestSubmissions } from '../../../api/admin';

const VILLAGE_TEST_QUESTIONS_MAP = {
  1: "What type of environment feels most like home?",
  2: "What kind of daily rhythm do you prefer?",
  3: "What matters most in your ideal living space?",
  4: "How do you feel about shared spaces?",
  5: "Would you want shared resources? (garden, tools, childcare, etc.)",
  6: "What is your noise tolerance?",
  7: "What is your timeline to purchase?",
  8: "What is your financial readiness?",
  9: "Share with us your credit comfort",
  10: "When decisions need to be made in a shared group, what feels best to you?",
  11: "When disagreements happen, what feels most natural to you?",
  12: "When working or living with others, what level of structure feels best to you?",
  13: "What matters most to you in a community you are building or joining?",
  14: "Would you like more information on BOMA- Living?",
  15: "How interested are you in alternative or non-traditional home building styles?",
  16: "What draws you most to the idea of BOMA?",
  17: "Share your contact information",
  18: "Would you like to learn more about shared equity real estate ownership?"
};

export default function AdminVillageTest({ setActiveScreen, showToast }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await fetchVillageTestSubmissions(search);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load village test submissions:', err);
      if (showToast) {
        showToast(err.message || 'Failed to load village test submissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [search]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderAnswerValue = (val) => {
    if (val === null || val === undefined) return <span className="text-slate-400 font-medium">—</span>;

    if (typeof val === 'object') {
      if (val.label) {
        return (
          <div className="inline-flex items-center gap-1.5 bg-teal-soft/80 text-teal border border-teal/15 font-semibold text-xs px-2.5 py-1 rounded-lg">
            {val.key && <span className="font-mono text-[10px] bg-teal text-white px-1.5 py-0.2 rounded">{val.key}</span>}
            <span>{val.label}</span>
          </div>
        );
      }
      if (Array.isArray(val)) {
        return (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {val.map((item, idx) => (
              <span key={idx} className="bg-slate-100 border border-slate-200 text-ink text-xs font-semibold px-2 py-0.5 rounded-md">
                {typeof item === 'object' ? item.label || item.key || JSON.stringify(item) : String(item)}
              </span>
            ))}
          </div>
        );
      }
      return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono text-ink space-y-1">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-ink-dim font-bold">{k}:</span>
              <span className='text-black'>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-ink font-semibold text-xs">{String(val)}</span>;
  };

  const getAnswerCount = (answers) => {
    if (!answers || typeof answers !== 'object') return 0;
    return Object.keys(answers).length;
  };

  return (
    <div className="w-full text-left animate-fade">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">
            Admin / Village Test
          </div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-1">
            Village Test Submissions
          </h3>
          <p className="text-ink-dim text-sm leading-relaxed max-w-[580px]">
            Review all quiz responses and lifestyle assessment answers submitted through the Village Test.
          </p>
        </div>
        <button
          onClick={loadSubmissions}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white border border-border text-ink font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-ink-dim ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-5 items-center justify-between bg-panel-alt/30 border border-border p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-teal-soft/80 text-teal px-3 py-1.5 rounded-lg border border-teal/15">
            <FileText className="w-4 h-4 text-teal" />
            <span className="text-xs font-bold font-mono">
              Total Submissions: <span className="text-ink">{submissions.length}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-72">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border rounded-lg text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-amber font-medium"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="w-full overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-gray-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Member Details</th>
                <th className="py-3.5 px-4 sm:px-6">Answers Recorded</th>
                <th className="py-3.5 px-4 sm:px-6">Submitted At</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-ink-dim font-medium">
                    <span className="inline-block animate-pulse">Loading village test submissions...</span>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-ink-dim font-medium">
                    No village test submissions match your search.
                  </td>
                </tr>
              ) : (
                submissions.map((item) => {
                  const ansCount = getAnswerCount(item.answers);
                  return (
                    <tr key={item.id} className="hover:bg-panel-alt/30 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-ink">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-soft text-amber font-display font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {((item.first_name || item.last_name || 'V')[0]).toUpperCase()}
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="block leading-tight text-ink font-bold text-sm">
                              {item.first_name} {item.last_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium mt-1">
                              <Mail className="w-3.5 h-3.5 text-ink-dim flex-shrink-0" />
                              <a href={`mailto:${item.email}`} className="text-teal hover:underline font-semibold break-all">
                                {item.email}
                              </a>
                            </div>
                            {item.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium mt-0.5">
                                <Phone className="w-3.5 h-3.5 text-ink-dim flex-shrink-0" />
                                <span className="font-mono text-ink-dim font-semibold">{item.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-soft/60 text-amber border border-amber/15">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ansCount} Answer{ansCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs font-mono text-ink-dim whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSubmission(item)}
                          className="bg-teal text-white rounded-lg py-1.5 px-3 text-xs font-bold hover:bg-teal-700 hover:-translate-y-[0.5px] transition-all cursor-pointer"
                        >
                          View Answers
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setActiveScreen('admin-dashboard')}
        className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-panel-alt transition-colors cursor-pointer mt-6"
      >
        Back to dashboard
      </button>

      {/* Answers Detail Modal Overlay */}
      {selectedSubmission && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade">
          <div className="bg-white border border-border rounded-2xl w-full max-w-[720px] max-h-[85vh] shadow-2xl flex flex-col relative overflow-hidden text-left animate-slide-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-6 pb-4 shrink-0 bg-slate-50/60">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber font-bold mb-0.5">
                  Village Test Submission Answers
                </div>
                <h3 className="font-display font-extrabold text-xl text-ink">
                  {selectedSubmission.first_name} {selectedSubmission.last_name}
                </h3>
                <div className="flex flex-wrap gap-4 text-xs text-ink-dim font-medium mt-1">
                  <span>Email: <strong className="text-black">{selectedSubmission.email}</strong></span>
                  {selectedSubmission.phone && <span>Phone: <strong className="text-black font-mono">{selectedSubmission.phone}</strong></span>}
                  {selectedSubmission.company && <span>Company: <strong className="text-black">{selectedSubmission.company}</strong></span>}
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-ink-dim hover:text-ink cursor-pointer p-1.5 rounded-lg hover:bg-panel-alt transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-header title */}
            <div className="border-b border-border px-6 py-2.5 bg-white shrink-0 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Questionnaire Responses
              </span>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {!selectedSubmission.answers || Object.keys(selectedSubmission.answers).length === 0 ? (
                <div className="py-12 text-center text-ink-dim text-xs font-semibold">
                  No answer data recorded in JSON for this submission.
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(selectedSubmission.answers).map(([key, val], idx) => {
                    const qNum = parseInt(key, 10);
                    const qText = VILLAGE_TEST_QUESTIONS_MAP[qNum] || VILLAGE_TEST_QUESTIONS_MAP[key] || (val && typeof val === 'object' && val.question) || null;
                    return (
                      <div key={key} className="border border-border/80 rounded-xl p-4 bg-[#F8FAFC]/60">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-amber font-bold">
                            Question #{key}
                          </span>
                          <span className="text-[10px] font-mono text-ink-dim">Key: {key}</span>
                        </div>
                        {qText && (
                          <h5 className="text-[13px] font-extrabold text-black leading-snug mb-2 font-display">
                            {qText}
                          </h5>
                        )}
                        <div className="pt-1">
                          {renderAnswerValue(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border p-4 px-6 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-ink-dim font-mono">
                Submitted: {formatDate(selectedSubmission.created_at)}
              </span>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="bg-teal text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
