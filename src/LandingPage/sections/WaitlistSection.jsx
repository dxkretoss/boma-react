import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, MapPin, Lock, Mail, Ban, AlertCircle, Loader2 } from 'lucide-react';
import RawPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SectionLabel from '../components/SectionLabel';

const PhoneInput = RawPhoneInput.default || RawPhoneInput;

export const WaitlistSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: 'WA',
    interest: '',
    heardFrom: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data = formData) => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.firstName || data.firstName.trim().length < 2) {
      errs.firstName = "First name must be at least 2 characters.";
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errs.lastName = "Last name must be at least 2 characters.";
    }

    if (!data.email) {
      errs.email = "Email address is required.";
    } else if (!emailRegex.test(data.email)) {
      errs.email = "Please enter a valid email address.";
    }

    if (data.phone && data.phone.replace(/\D/g, '').length > 0 && data.phone.replace(/\D/g, '').length < 7) {
      errs.phone = "Please enter a valid phone number with dial code.";
    }

    if (!data.city || data.city.trim().length < 2) {
      errs.city = "City is required.";
    }

    if (!data.state || data.state.trim().length < 2) {
      errs.state = "State is required (e.g. WA).";
    }

    if (!data.interest) {
      errs.interest = "Please select your primary interest.";
    }

    return errs;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  const handlePhoneChange = (phone) => {
    const updated = { ...formData, phone };
    setFormData(updated);
    if (touched.phone) {
      setErrors(validate(updated));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    // Mark all fields touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      interest: true
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const bullets = [
    { icon: MapPin, text: "Pilot launching in King County, WA" },
    { icon: Lock, text: "Your information is private and never sold" },
    { icon: Mail, text: "We'll reach out as matching opens in your area" },
    { icon: Ban, text: "No commitment — just a conversation starter" }
  ];

  const interestOptions = [
    "I want to join the matching pool",
    "I have an existing group to register",
    "I'm a real estate professional or vendor",
    "I'm a lender or financial institution",
    "I represent a municipality or nonprofit",
    "Just keeping an eye on things"
  ];

  const heardFromOptions = [
    "Social media",
    "Friend or colleague",
    "Search engine",
    "News or media",
    "Real estate professional",
    "Other"
  ];

  return (
    <section id="waitlist" className="bg-[#F5F1EA] py-12 md:py-16 relative overflow-hidden border-t border-[#2E2330]/10">
      
      {/* Light Theme Phone Input CSS Overrides */}
      <style>{`
        .waitlist-phone-input .react-tel-input .form-control {
          width: 100% !important;
          background-color: rgba(245, 241, 234, 0.5) !important;
          color: #2E2330 !important;
          border: 1px solid rgba(46, 35, 48, 0.15) !important;
          border-radius: 0.75rem !important;
          font-size: 0.875rem !important;
          height: 46px !important;
          padding-left: 48px !important;
          transition: all 0.2s ease !important;
        }
        .waitlist-phone-input.has-error .react-tel-input .form-control {
          border-color: #EF4444 !important;
          background-color: #FEF2F2 !important;
        }
        .waitlist-phone-input .react-tel-input .form-control:focus {
          border-color: #C46A4A !important;
          background-color: #FFFFFF !important;
        }
        .waitlist-phone-input .react-tel-input .flag-dropdown {
          background-color: rgba(245, 241, 234, 0.5) !important;
          border: 1px solid rgba(46, 35, 48, 0.15) !important;
          border-top-left-radius: 0.75rem !important;
          border-bottom-left-radius: 0.75rem !important;
        }
        .waitlist-phone-input .react-tel-input .country-list {
          background-color: #FFFFFF !important;
          color: #2E2330 !important;
          border: 1px solid rgba(46, 35, 48, 0.15) !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        .waitlist-phone-input .react-tel-input .country-list .country:hover,
        .waitlist-phone-input .react-tel-input .country-list .country.highlight {
          background-color: #F5F1EA !important;
          color: #C46A4A !important;
        }
        .waitlist-phone-input .react-tel-input .search-box {
          background-color: #F5F1EA !important;
          color: #2E2330 !important;
          border: 1px solid rgba(46, 35, 48, 0.15) !important;
          border-radius: 0.5rem !important;
          padding: 6px 10px !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column Info */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <SectionLabel>Join the Waitlist</SectionLabel>

            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#2E2330] leading-tight">
              Be part of what comes next
            </h2>

            <p className="text-[#7A746B] text-base leading-relaxed">
              BOMA is in early development. The pilot is launching in King County, WA — and the waitlist is where it starts. Whether you're looking to join a Pod, bring your own group, or explore a partnership, this is your first step.
            </p>

            <div className="space-y-4 pt-4 border-t border-[#2E2330]/10">
              {bullets.map((b, idx) => {
                const IconComponent = b.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-[#2E2330]">
                    <div className="p-2 rounded-xl bg-white text-[#C46A4A] shadow-xs border border-[#2E2330]/10 flex-shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span>{b.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-[#2E2330]/10 shadow-xl"
          >
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#C46A4A]/20 text-[#C46A4A] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-3xl font-bold text-[#2E2330]">You're on the list!</h3>
                <p className="text-sm text-[#7A746B] max-w-md mx-auto leading-relaxed">
                  Thank you for joining the BOMA Living early community. We will be in touch as matching opens in your area.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                
                {/* ROW 1: FIRST NAME & LAST NAME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstName')}
                      placeholder="Amara"
                      className={`w-full bg-[#F5F1EA]/50 border rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none transition-colors ${
                        errors.firstName && touched.firstName
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                          : 'border-[#2E2330]/15 focus:border-[#C46A4A] focus:bg-white'
                      }`}
                    />
                    {errors.firstName && touched.firstName && (
                      <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.firstName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastName')}
                      placeholder="Smith"
                      className={`w-full bg-[#F5F1EA]/50 border rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none transition-colors ${
                        errors.lastName && touched.lastName
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                          : 'border-[#2E2330]/15 focus:border-[#C46A4A] focus:bg-white'
                      }`}
                    />
                    {errors.lastName && touched.lastName && (
                      <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                {/* ROW 2: EMAIL ADDRESS & PHONE NUMBER (REACT-PHONE-INPUT-2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@email.com"
                      className={`w-full bg-[#F5F1EA]/50 border rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none transition-colors ${
                        errors.email && touched.email
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                          : 'border-[#2E2330]/15 focus:border-[#C46A4A] focus:bg-white'
                      }`}
                    />
                    {errors.email && touched.email && (
                      <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className={`waitlist-phone-input ${errors.phone && touched.phone ? 'has-error' : ''}`}>
                    <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                      Phone <span className="text-[#7A746B] font-normal">(optional)</span>
                    </label>
                    <PhoneInput
                      country={'us'}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur('phone')}
                      enableSearch={true}
                      placeholder="+1 (555) 000-0000"
                      searchPlaceholder="Search country..."
                    />
                    {errors.phone && touched.phone && (
                      <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* ROW 3: CITY & STATE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      onBlur={() => handleBlur('city')}
                      placeholder="Seattle"
                      className={`w-full bg-[#F5F1EA]/50 border rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none transition-colors ${
                        errors.city && touched.city
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                          : 'border-[#2E2330]/15 focus:border-[#C46A4A] focus:bg-white'
                      }`}
                    />
                    {errors.city && touched.city && (
                      <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.city}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      onBlur={() => handleBlur('state')}
                      placeholder="WA"
                      className={`w-full bg-[#F5F1EA]/50 border rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none transition-colors ${
                        errors.state && touched.state
                          ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                          : 'border-[#2E2330]/15 focus:border-[#C46A4A] focus:bg-white'
                      }`}
                    />
                    {errors.state && touched.state && (
                      <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors.state}
                      </span>
                    )}
                  </div>
                </div>

                {/* ROW 4: INTEREST */}
                <div>
                  <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                    I'm interested as… *
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    onBlur={() => handleBlur('interest')}
                    className={`w-full bg-[#F5F1EA]/50 border rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none transition-colors ${
                      errors.interest && touched.interest
                        ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                        : 'border-[#2E2330]/15 focus:border-[#C46A4A] focus:bg-white'
                    }`}
                  >
                    <option value="">Select one</option>
                    {interestOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors.interest && touched.interest && (
                    <span className="text-[11px] font-medium text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.interest}
                    </span>
                  )}
                </div>

                {/* ROW 5: HOW DID YOU HEAR */}
                <div>
                  <label className="block text-xs font-bold text-[#2E2330] uppercase tracking-wider mb-1.5">
                    How did you hear about BOMA?
                  </label>
                  <select
                    name="heardFrom"
                    value={formData.heardFrom}
                    onChange={handleChange}
                    className="w-full bg-[#F5F1EA]/50 border border-[#2E2330]/15 rounded-xl px-4 py-3 text-sm text-[#2E2330] focus:outline-none focus:border-[#C46A4A] focus:bg-white transition-colors"
                  >
                    <option value="">Select one</option>
                    {heardFromOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C46A4A] hover:bg-[#b05d3e] text-white font-semibold px-6 py-4 rounded-full text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving your spot...</span>
                    </>
                  ) : (
                    <>
                      <span>Join the Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#7A746B] text-center font-medium">
                  Free to join. No commitment. Your information stays private.
                </p>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
