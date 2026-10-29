import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, DollarSign, Sparkles, CheckCircle2,
  ArrowRight, ChevronRight, X, Send, Award, Heart, Cpu, ShieldCheck,
  Search, Users, Building, HelpCircle
} from 'lucide-react';
import { careerService } from '../services/careerService';

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experienceYears: '',
    portfolioUrl: '',
    coverNote: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const fetchCareers = async () => {
      setLoading(true);
      try {
        const data = await careerService.getJobs();
        setJobs(data.jobs || []);
        setPerks(data.perks || []);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        // Fallback jobs if backend is cold
        setJobs([
          {
            id: 'job-ml-01',
            title: 'Lead Machine Learning Engineer (Demand & Time-Series)',
            department: 'AI & Data Science',
            location: 'Bengaluru / Hybrid / Remote',
            type: 'Full-Time',
            experience: '4 - 8 Years',
            salary_range: '₹32,00,000 - ₹48,00,000 + Equity',
            tags: ['Python', 'scikit-learn', 'LightGBM', 'Time-Series', 'FastAPI'],
            description: 'Architect and advance Inventra\'s proprietary retail demand forecasting models.',
            requirements: ['Strong track record deploying production ML models', 'Python, PyTorch/scikit-learn, Pandas']
          },
          {
            id: 'job-fs-02',
            title: 'Senior Full-Stack Product Engineer (React + Python)',
            department: 'Core Platform Engineering',
            location: 'Remote / Bengaluru',
            type: 'Full-Time',
            experience: '3 - 6 Years',
            salary_range: '₹22,00,000 - ₹34,00,000 + Stock Options',
            tags: ['React', 'Vite', 'Tailwind CSS', 'Flask', 'PostgreSQL'],
            description: 'Craft intuitive, blazing-fast interfaces and robust backend APIs for modern retail operators.',
            requirements: ['Modern React, Hooks, Tailwind CSS', 'Python web frameworks & relational databases']
          },
          {
            id: 'job-sc-03',
            title: 'Supply Chain & Multi-Criteria Sourcing Specialist',
            department: 'Operations & Sourcing',
            location: 'Mumbai / Gurugram / Hybrid',
            type: 'Full-Time',
            experience: '2 - 5 Years',
            salary_range: '₹16,00,000 - ₹26,00,000',
            tags: ['Procurement', 'Supplier Matrix', 'Vendor Management'],
            description: 'Guide our algorithmic multi-criteria supplier ranking matrix.',
            requirements: ['Procurement / supply chain experience', 'Inventory replenishment formulas']
          },
          {
            id: 'job-ae-04',
            title: 'Enterprise Solutions Architect & Account Director',
            department: 'Client Growth & Solutions',
            location: 'Bengaluru / Delhi NCR / Remote',
            type: 'Full-Time',
            experience: '5 - 10 Years',
            salary_range: '₹28,00,000 - ₹45,00,000 + Bonus',
            tags: ['Enterprise SaaS', 'Retail ERP Integration', 'Pre-Sales'],
            description: 'Lead technical integrations with Tier-1 retail chains migrating to autonomous replenishment.',
            requirements: ['B2B enterprise software experience', 'Retail POS/ERP understanding']
          }
        ]);
        setPerks([
          { title: "Competitive Pay & Equity", desc: "Top-tier compensation benchmarks with high-upside stock grants." },
          { title: "Remote-First Flexibility", desc: "Work wherever you do your best thinking with home office setup stipends." },
          { title: "GPU & ML Compute Budget", desc: "Dedicated cloud compute clusters for experiments and prototyping." },
          { title: "Comprehensive Healthcare", desc: "100% health coverage for you and your dependents with mental wellness support." },
          { title: "Learning & Conferences", desc: "₹1,50,000 annual budget for workshops, books, and international AI summits." }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const departments = ['All', ...new Set(jobs.map((j) => j.department))];

  const filteredJobs = jobs.filter((j) => {
    const matchesDept = selectedDept === 'All' || j.department === selectedDept;
    const matchesSearch =
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      j.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setSubmitResult(null);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        experience_years: formData.experienceYears,
        portfolio_url: formData.portfolioUrl,
        cover_note: formData.coverNote
      };
      const res = await careerService.submitApplication(payload);
      setSubmitResult(res);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        experienceYears: '',
        portfolioUrl: '',
        coverNote: ''
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white border border-sky-100 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <img src="/logo_icon.png" alt="Inventra AI Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Inventra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">AI</span>
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Careers Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors">
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition-all shadow-md shadow-sky-500/20"
          >
            <span>Live App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200 text-sky-800 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>We're Hiring • Autonomous Supply Chain & AI Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Build the Neural Core of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">
            Global Commerce
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          At Inventra AI, we combine time-series machine learning, multi-criteria sourcing algorithms, and real-time inventory telemetry to eliminate trillions in retail waste.
        </p>

        {/* Quick Highlights */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-2xl font-black text-sky-600">4+</span>
            <p className="text-xs font-semibold text-slate-700 mt-1">Open Positions</p>
            <p className="text-[10px] text-slate-400">Engineering &amp; Ops</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-2xl font-black text-emerald-600">100%</span>
            <p className="text-xs font-semibold text-slate-700 mt-1">Remote-Friendly</p>
            <p className="text-[10px] text-slate-400">Flexible Workflows</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-2xl font-black text-indigo-600">₹1.5L</span>
            <p className="text-xs font-semibold text-slate-700 mt-1">Learning Stipend</p>
            <p className="text-[10px] text-slate-400">Annual Growth Budget</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-2xl font-black text-amber-600">Top 10%</span>
            <p className="text-xs font-semibold text-slate-700 mt-1">Industry Pay</p>
            <p className="text-[10px] text-slate-400">High-Upside Equity</p>
          </div>
        </div>
      </section>

      {/* 3. Perks & Culture */}
      <section className="py-14 bg-white border-y border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Why Inventra AI</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Benefits Built for Peak Innovators</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((p, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-100/60 text-sky-700 flex items-center justify-center font-bold mb-3">
                  {idx === 0 && '💰'}
                  {idx === 1 && '🌍'}
                  {idx === 2 && '⚡'}
                  {idx === 3 && '🏥'}
                  {idx === 4 && '📚'}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Open Positions Directory */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto" id="open-roles">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Current Job Openings</h2>
            <p className="text-xs text-slate-500 mt-1">Explore available opportunities and find your next breakthrough role</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search roles or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-500 focus:outline-none w-56 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Department Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDept === dept
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700">No positions found matching your criteria</h4>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200/60">
                      {job.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-bold border border-teal-200/60">
                      {job.type}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Exp: {job.experience}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-emerald-600">
                      <span>{job.salary_range}</span>
                    </div>
                  </div>

                  {job.tags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center lg:items-end gap-3 shrink-0">
                  <button
                    onClick={() => handleOpenApply(job)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-sky-500/15 flex items-center justify-center gap-1.5 transition-all hover:scale-102"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Application</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedJob?.title}</h3>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitResult ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                    {submitResult.message}
                  </p>
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-sky-700 inline-block">
                    Reference ID: {submitResult.application_id}
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setApplyModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700"
                  >
                    Close &amp; Continue Browsing
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="priya@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 Years"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Portfolio / LinkedIn URL</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Note or Cover Summary</label>
                  <textarea
                    rows="3"
                    placeholder="Briefly describe what excites you about building autonomous retail intelligence..."
                    value={formData.coverNote}
                    onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold disabled:opacity-50 flex items-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. Footer */}
      <footer className="py-10 px-6 lg:px-12 bg-white border-t border-slate-200/80 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Inventra AI Careers. Equal Opportunity Employer.</p>
          <div className="flex items-center gap-4 text-sky-600 font-semibold">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/login" className="hover:underline">Employee Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CareersPage;
