import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { updateUserPreferencesAndScore } from '../../api/users';

export default function ProfileEdit({
  currentUser,
  setCurrentUser,
  editCity,
  setEditCity,
  editSetting,
  setEditSetting,
  editIntent,
  setEditIntent,
  editCityDropdownOpen,
  setEditCityDropdownOpen,
  cityDropdownRef,
  setActiveScreen,
  showToast
}) {
  return (
    <div className="pad py-12 px-6 md:px-8 text-left">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber mb-1 font-bold">Profile / Edit Preferences</div>
      <h3 className="font-display font-extrabold text-2xl text-ink mb-5">Edit preferences</h3>

      <div className="border border-border rounded-2xl p-6 bg-white shadow-sm max-w-[520px]">
        {/* Preferred City */}
        <div className="mb-4" ref={cityDropdownRef}>
          <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Preferred city or metro</label>
          <div className="relative">
            <input
              type="text"
              value={editCity}
              onChange={(e) => {
                setEditCity(e.target.value);
                setEditCityDropdownOpen(true);
              }}
              onFocus={() => setEditCityDropdownOpen(true)}
              placeholder="e.g. Austin, TX"
              className="w-full bg-panel border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-semibold pr-9"
            />
            <button
              type="button"
              onClick={() => setEditCityDropdownOpen(!editCityDropdownOpen)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${editCityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {editCityDropdownOpen && (() => {
              const EDIT_CITIES = [
                'Austin, TX', 'Atlanta, GA', 'Boston, MA', 'Charlotte, NC', 'Chicago, IL',
                'Dallas, TX', 'Denver, CO', 'Detroit, MI', 'Houston, TX', 'Las Vegas, NV',
                'Los Angeles, CA', 'Miami, FL', 'Minneapolis, MN', 'Nashville, TN',
                'New York, NY', 'Orlando, FL', 'Philadelphia, PA', 'Phoenix, AZ',
                'Portland, OR', 'Salt Lake City, UT', 'San Antonio, TX', 'San Diego, CA',
                'San Francisco, CA', 'Seattle, WA', 'Tampa, FL', 'Washington, DC'
              ];
              const filtered = EDIT_CITIES.filter(c => c.toLowerCase().includes(editCity.toLowerCase()));
              return (
                <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white border border-border rounded-xl shadow-lg overflow-hidden animate-fade">
                  <div className="max-h-[200px] overflow-y-auto">
                    {filtered.length > 0 ? filtered.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => { setEditCity(city); setEditCityDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${editCity === city ? 'bg-amber-soft text-ink font-bold' : 'text-ink hover:bg-panel-alt'
                          }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-ink-dim shrink-0" />
                        {city}
                      </button>
                    )) : (
                      <div className="px-4 py-6 text-center text-xs text-ink-dim font-medium">
                        No cities match "{editCity}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Setting preference</label>
            <select
              value={editSetting}
              onChange={(e) => setEditSetting(e.target.value)}
              className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
            >
              <option value="Urban">Urban</option>
              <option value="Suburban">Suburban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">Primary housing intent</label>
            <select
              value={editIntent}
              onChange={(e) => setEditIntent(e.target.value)}
              className="w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-amber cursor-pointer font-semibold"
            >
              <option value="Purchase primary residence">Purchase primary residence</option>
              <option value="Co-develop property">Co-develop property</option>
              <option value="Investment hold">Investment hold</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveScreen('profile')}
            className="bg-transparent border border-border text-ink rounded-lg py-2 px-5 text-sm font-bold hover:bg-panel-alt transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (currentUser?.id) {
                try {
                  const updates = {
                    location_city: editCity,
                    setting_preference: editSetting.toLowerCase(),
                    housing_intent: editIntent === 'Purchase primary residence' ? 'purchase' : editIntent === 'Co-develop property' ? 'co-develop' : 'investment'
                  };
                  const updatedUser = await updateUserPreferencesAndScore(currentUser.id, updates);
                  if (setCurrentUser) {
                    setCurrentUser(updatedUser);
                  }
                  showToast("Preferences updated successfully!", "success");
                } catch (err) {
                  console.error('Error updating preferences:', err);
                  showToast("Failed to save preference changes.", "error");
                }
              }
              setActiveScreen('profile');
            }}
            className="bg-ink text-white rounded-lg py-2 px-5 text-sm font-bold hover:bg-[#2450C4] transition-all cursor-pointer shadow-md"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
