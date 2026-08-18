import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, Calendar, RefreshCw, UserCheck } from 'lucide-react';
import { fetchWaitlistEntries } from '../../../api/admin';

export default function AdminWaitlist({ setActiveScreen, showToast }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadWaitlist = async () => {
    try {
      setLoading(true);
      const data = await fetchWaitlistEntries(search);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load waitlist entries:', err);
      if (showToast) {
        showToast(err.message || 'Failed to load waitlist entries.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaitlist();
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

  return (
    <div className="w-full text-left animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">
            Admin / Waitlist
          </div>
          <h3 className="font-display font-extrabold text-2xl text-ink mb-1">
            Waitlist Submissions
          </h3>
          <p className="text-ink-dim text-sm leading-relaxed max-w-[580px]">
            Manage and view all community members who have registered for the BOMA platform waitlist.
          </p>
        </div>
        <button
          onClick={loadWaitlist}
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
          <div className="flex items-center gap-2 bg-amber-soft/60 text-teal px-3 py-1.5 rounded-lg border border-amber/15">
            <UserCheck className="w-4 h-4 text-amber" />
            <span className="text-xs font-bold font-mono">
              Total Entries: <span className="text-ink">{entries.length}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-72">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, email, city, or interest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border rounded-lg text-xs px-3.5 py-2 pl-9 focus:outline-none focus:border-amber font-medium"
            />
          </div>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[980px] text-sm text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-ink font-semibold text-xs uppercase tracking-wider">
                <th className="p-4 px-6 whitespace-nowrap">Name</th>
                <th className="p-4 px-6 whitespace-nowrap">Email</th>
                <th className="p-4 px-6 whitespace-nowrap">Phone</th>
                <th className="p-4 px-6 whitespace-nowrap">Location</th>
                <th className="p-4 px-6 whitespace-nowrap">Interest</th>
                <th className="p-4 px-6 whitespace-nowrap">Heard From</th>
                <th className="p-4 px-6 whitespace-nowrap">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-ink-dim font-medium whitespace-nowrap">
                    <span className="inline-block animate-pulse">Loading waitlist entries...</span>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-ink-dim font-medium whitespace-nowrap">
                    No waitlist submissions found matching your search.
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item.id} className="hover:bg-panel-alt/30 transition-colors">
                    <td className="p-4 px-6 font-bold text-ink whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-soft text-teal font-display font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          {((item.first_name || item.last_name || 'W')[0]).toUpperCase()}
                        </div>
                        <div>
                          <span className="block leading-tight text-ink font-bold">
                            {item.first_name} {item.last_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6 font-medium text-ink whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5 text-ink-dim flex-shrink-0" />
                        <a href={`mailto:${item.email}`} className="text-teal hover:underline font-semibold">
                          {item.email}
                        </a>
                      </div>
                    </td>
                    <td className="p-4 px-6 font-medium text-ink-dim whitespace-nowrap text-xs">
                      {item.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-ink-dim flex-shrink-0" />
                          <span className="font-mono text-ink font-semibold">{item.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-4 px-6 font-medium text-ink whitespace-nowrap text-xs">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber flex-shrink-0" />
                        <span className="font-semibold text-ink">
                          {item.city}{item.state ? `, ${item.state}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-soft/70 text-teal border border-teal/10">
                        {item.interest || 'General Interest'}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-xs text-ink-dim font-medium whitespace-nowrap">
                      {item.heard_from || '—'}
                    </td>
                    <td className="p-4 px-6 text-xs font-mono text-ink-dim whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))
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
    </div>
  );
}
