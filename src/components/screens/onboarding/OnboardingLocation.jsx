import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown, MapPin } from 'lucide-react';

const US_CITIES = [
  'Austin, TX', 'Atlanta, GA', 'Boston, MA', 'Charlotte, NC', 'Chicago, IL',
  'Dallas, TX', 'Denver, CO', 'Detroit, MI', 'Houston, TX', 'Las Vegas, NV',
  'Los Angeles, CA', 'Miami, FL', 'Minneapolis, MN', 'Nashville, TN',
  'New York, NY', 'Orlando, FL', 'Philadelphia, PA', 'Phoenix, AZ',
  'Portland, OR', 'Salt Lake City, UT', 'San Antonio, TX', 'San Diego, CA',
  'San Francisco, CA', 'Seattle, WA', 'Tampa, FL', 'Washington, DC'
];

export default function OnboardingLocation({ locationCity, setLocationCity, locationRadius, setLocationRadius, settingPreference, setSettingPreference, setActiveScreen, stepProgressBar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState(locationCity || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setSearchText(locationCity || '');
  }, [locationCity]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCities = US_CITIES.filter(city =>
    city.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (city) => {
    setLocationCity(city);
    setSearchText(city);
    setDropdownOpen(false);
  };

  return (
    <div className="max-w-[660px] mx-auto ">
      <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
        Step 4 of 9 — Location
      </div>
      {stepProgressBar(4)}

      <div className="mb-5" ref={containerRef}>
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-semibold">
          Preferred city or metro area
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setLocationCity(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="e.g. Austin, TX"
            className="w-full bg-panel border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium pr-9"
          />
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink cursor-pointer"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white border border-border rounded-xl shadow-lg overflow-hidden animate-fade">
              <div className="max-h-[200px] overflow-y-auto">
                {filteredCities.length > 0 ? (
                  filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${locationCity === city
                          ? 'bg-amber-soft text-ink font-bold'
                          : 'text-ink hover:bg-panel-alt'
                        }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-ink-dim shrink-0" />
                      {city}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-ink-dim font-medium">
                    No cities match "{searchText}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-col">
        <div className="flex justify-between items-center text-sm font-semibold text-ink mb-1.5">
          <span>Relocation radius</span>
          <span className="font-mono text-xs">{locationRadius} mi</span>
        </div>
        <input
          type="range"
          min="5"
          max="150"
          value={locationRadius}
          onChange={(e) => setLocationRadius(parseInt(e.target.value))}
          className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-amber"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-2 font-semibold">
          Setting preference
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
        {[
          { id: 'urban', label: 'Urban' },
          { id: 'suburban', label: 'Suburban' },
          { id: 'rural', label: 'Rural' }
        ].map(opt => (
          <div
            key={opt.id}
            onClick={() => setSettingPreference(opt.id)}
            className={`flex flex-col items-center text-center p-4 rounded-xl border cursor-pointer shadow-sm transition-all duration-150 ${settingPreference === opt.id
                ? 'border-amber bg-amber-soft/85'
                : 'border-border bg-white hover:border-amber hover:-translate-y-[1px]'
              }`}
          >
            <div className="text-[13px] font-extrabold text-ink leading-tight  uppercase tracking-wide">
              {opt.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3.5">
        <button
          onClick={() => setActiveScreen('onboarding-community')}
          className="bg-transparent border border-border text-ink font-bold text-sm px-5 py-3 rounded-xl flex items-center gap-1.5 hover:bg-panel-alt transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => setActiveScreen('onboarding-budget')}
          className="bg-ink text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2450C4] active:scale-95 transition-all cursor-pointer"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
