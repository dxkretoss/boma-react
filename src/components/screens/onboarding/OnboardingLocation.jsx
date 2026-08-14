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

export default function OnboardingLocation({ 
  locationCity, 
  setLocationCity, 
  locationRadius, 
  setLocationRadius, 
  settingPreference, 
  setSettingPreference, 
  setActiveScreen, 
  stepProgressBar,
  settingOptions
}) {
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

  const finalSettingOptions = (settingOptions && settingOptions.length > 0)
    ? settingOptions.map(opt => ({
        id: opt.label.toLowerCase(),
        label: opt.label
      }))
    : [
        { id: 'urban', label: 'Urban' },
        { id: 'suburban', label: 'Suburban' },
        { id: 'rural', label: 'Rural' }
      ];

  return (
    <div className="max-w-[660px] mx-auto " ref={containerRef}>
      <div className="text-xs font-mono uppercase tracking-wider text-ink-dim font-bold mb-1.5">
        Step 4 of 9 — Location &amp; Search Radius
      </div>
      {stepProgressBar(4)}

      <h1 className="font-display text-[26px] font-extrabold text-ink mb-6">
        Where are you looking to buy or live?
      </h1>

      <div className="mb-5 text-left relative">
        <label className="block text-xs font-mono uppercase tracking-wider text-ink-dim mb-1.5 font-bold">
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
            placeholder="Search city (e.g. Austin, New York...)"
            className="w-full bg-panel border border-border rounded-lg pl-9.5 pr-3.5 py-2 text-sm text-ink focus:outline-none focus:border-amber transition-colors font-medium"
          />
          <MapPin className="w-4 h-4 text-ink-dim absolute left-3 top-2.5" />
          <ChevronDown className="w-4 h-4 text-ink-dim absolute right-3.5 top-2.5 cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)} />

          {dropdownOpen && filteredCities.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
              {filteredCities.map(city => (
                <div
                  key={city}
                  onClick={() => handleSelect(city)}
                  className="px-4 py-2.5 text-xs text-ink font-semibold hover:bg-slate-50 cursor-pointer text-left border-b border-border/40 last:border-0"
                >
                  {city}
                </div>
              ))}
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
        {finalSettingOptions.map(opt => (
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
