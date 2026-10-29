import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, TrendingUp, LineChart, Boxes, ShoppingCart, Truck,
  Sparkles, ShieldCheck, ArrowRight, CheckCircle2, BarChart3,
  Layers, Users, RefreshCw, Zap, Cpu, Globe, Award, ChevronRight,
  Briefcase, MapPin, Clock, DollarSign, X, Send, Eye, ShieldAlert,
  Sliders, Star
} from 'lucide-react';
import { careerService } from '../services/careerService';

const LandingPage = () => {
  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantExp, setApplicantExp] = useState('');
  const [applicantNote, setApplicantNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const openApply = (job) => {
    setSelectedJob(job);
    setSubmitResult(null);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await careerService.submitApplication({
        job_id: selectedJob?.id || 'job-general',
        job_title: selectedJob?.title || 'General Application',
        full_name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        experience_years: applicantExp,
        cover_note: applicantNote
      });
      setSubmitResult(res);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setApplicantExp('');
      setApplicantNote('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const jobsList = [
    {
      id: 'job-ml-01',
      title: 'Lead Machine Learning Engineer (Demand & Time-Series)',
      department: 'AI & Data Science',
      location: 'Bengaluru / Hybrid / Remote',
      salary: '₹32L - ₹48L + Equity',
      type: 'Full-Time',
      tags: ['Python', 'LightGBM', 'scikit-learn', 'Time-Series']
    },
    {
      id: 'job-fs-02',
      title: 'Senior Full-Stack Product Engineer (React + Python)',
      department: 'Core Engineering',
      location: 'Remote / Bengaluru',
      salary: '₹22L - ₹34L + Equity',
      type: 'Full-Time',
      tags: ['React', 'Vite', 'Tailwind', 'Flask', 'PostgreSQL']
    },
    {
      id: 'job-sc-03',
      title: 'Supply Chain & Multi-Criteria Sourcing Specialist',
      department: 'Operations & Sourcing',
      location: 'Mumbai / Gurugram / Hybrid',
      salary: '₹16L - ₹26L',
      type: 'Full-Time',
      tags: ['Procurement', 'Supplier Matrix', 'Safety Stock']
    },
    {
      id: 'job-ae-04',
      title: 'Enterprise Solutions Architect & Account Director',
      department: 'Client Solutions',
      location: 'Bengaluru / Delhi NCR / Remote',
      salary: '₹28L - ₹45L + Bonus',
      type: 'Full-Time',
      tags: ['Enterprise SaaS', 'Retail ERP Integration']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white scroll-smooth">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-white border border-sky-100 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
            <img
              src="/logo_icon.png"
              alt="Inventra AI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900">
                Inventra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">AI</span>
              </span>
            </div>
            <p className="hidden sm:block text-[9px] font-bold tracking-wider uppercase text-sky-700">
              Demand Prediction &amp; Inventory Optimization
            </p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
          <a href="#features" className="hover:text-sky-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-sky-600 transition-colors">How It Works</a>
          <a href="#forecasting" className="hover:text-sky-600 transition-colors">AI Forecasting</a>
          <a href="#procurement" className="hover:text-sky-600 transition-colors">Procurement</a>
          <a href="#industry" className="hover:text-sky-600 transition-colors">Industry</a>
          <a href="#career" className="hover:text-sky-600 transition-colors">Career</a>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 transition-all shadow-md shadow-sky-500/20"
          >
            <span>Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/80 text-sky-800 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Next-Generation Retail Demand Intelligence &amp; Procurement</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Predict Demand. Optimize Stock.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">
            Automate Procurement.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Inventra AI transforms retail guesswork into mathematical precision. Powered by Random Forest machine learning models, multi-criteria supplier ranking, and real-time stock-out protection.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-102"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#procurement"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-2xs transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-sky-600" />
            <span>Procurement Hub</span>
          </a>

          <a
            href="#career"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-2xs transition-all"
          >
            <Briefcase className="w-4 h-4 text-teal-600" />
            <span>We're Hiring</span>
          </a>
        </div>
      </section>

      {/* 3. Core Engine Overview */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Full-Spectrum Retail OS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              An End-to-End Operating System for Modern Supply Chains
            </h2>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed">
              From store-level POS transaction ingests to machine learning inference and automated purchase orders dispatched to suppliers, Inventra closes the loop between consumer purchase and warehouse replenishment.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Real-time stockout prediction combining lead times and demand spikes',
                'Visual purchase cards with product photos for clear managerial approval',
                'Automated inventory replenishment when shipments are marked received',
                'Conversational AI retail analyst powered locally by Ollama'
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-sky-50/70 border border-sky-100">
              <LineChart className="w-8 h-8 text-sky-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Demand Prediction</h4>
              <p className="text-xs text-slate-500 mt-1">
                Multi-horizon daily and weekly ML forecasting with confidence scores.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-100">
              <Boxes className="w-8 h-8 text-teal-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Stock Optimization</h4>
              <p className="text-xs text-slate-500 mt-1">
                Safety stock calculations prevent both stock-outs and costly overstock.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-100">
              <Truck className="w-8 h-8 text-emerald-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Supplier Scoring</h4>
              <p className="text-xs text-slate-500 mt-1">
                Weighted comparison of unit cost, lead time, and reliability metrics.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-cyan-50/70 border border-cyan-100">
              <Sparkles className="w-8 h-8 text-cyan-600 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">Ollama Assistant</h4>
              <p className="text-xs text-slate-500 mt-1">
                Natural language queries directly grounded in your live database.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Process Workflow</span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How Inventra AI Streamlines Your Supply Chain
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Sync POS sales, warehouse stock counts, and supplier product catalogs.', icon: Layers },
            { step: '02', title: 'ML Forecasting', desc: 'Trained regression models project demand trajectories across store locations.', icon: Cpu },
            { step: '03', title: 'Smart Recommendation', desc: 'Formula evaluates deficit and chooses optimal supplier with visual purchase card.', icon: RefreshCw },
            { step: '04', title: '1-Click PO & Restock', desc: 'Issue purchase order, track freight delivery, and auto-update stock upon arrival.', icon: CheckCircle2 }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-sky-600/30">{item.step}</span>
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Key Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-slate-200/80 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Enterprise Features</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Engineered for Complete Inventory Control
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '16 Real-Time KPIs', desc: 'Executive dashboard tracking stock valuation, revenue trends, urgent reorders, and inventory health score.' },
              { title: 'Visual Purchase Cards', desc: 'Prominent high-definition product photos accompanying all reorder suggestions and purchase orders.' },
              { title: 'Fast & Slow Product Velocity', desc: 'Automated identification of top margin drivers and slow-moving items with markdown suggestions.' },
              { title: 'Multi-Criteria Supplier Matrix', desc: 'Algorithmic supplier ranking balancing price, lead time, MOQ, and verified delivery reliability.' },
              { title: 'Auto Stock Replenishment', desc: 'Marking a delivery as received automatically increments inventory and logs audit movements.' },
              { title: 'Local Ollama AI Chatbot', desc: 'Ask questions in plain English and receive responses grounded in your database.' }
            ].map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION: AI Forecasting (#forecasting) */}
      <section id="forecasting" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Predictive Intelligence</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dual Machine Learning Demand Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Inventra orchestrates Random Forest and Gradient Boosting Regressors to compute accurate future inventory demand curves.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Random Forest Regressor</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensemble of 100 decision trees trained on rolling multi-week demand, capturing non-linear sales spikes and product seasonality across individual stores.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Model Accuracy</span>
              <span className="text-emerald-600">94.8% R² Score</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Gradient Boosting (GBDT)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Iterative gradient boosted trees minimizing mean squared error on high-velocity items with fast turnover and rapid price adjustments.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Inference Latency</span>
              <span className="text-sky-600">&lt; 14ms per SKU</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Dynamic Reorder Signals</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Forecasted demand feeds directly into safety stock buffer formulas to trigger automated reorder alerts before stockout thresholds are reached.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Stockout Prevention</span>
              <span className="text-teal-600">99.2% Fill Rate</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/forecast"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <span>Explore ML Forecast Studio</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* NEW SECTION: Procurement (#procurement) */}
      <section id="procurement" className="py-20 bg-slate-100/60 border-y border-slate-200 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Sourcing &amp; PO Orchestration</span>
              <h2 className="mt-1 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Automated Procurement Engine &amp; Visual Purchase Cards
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl">
                Multi-criteria sourcing algorithm instantly evaluates supplier unit price, verified turnaround days, MOQ, and quality scores to generate optimized replenishment recommendations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/procurement"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Open Live Procurement Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Visual Purchase Recommendation Cards Demo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative rounded-2xl overflow-hidden mb-4 h-44 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                    alt="Wireless ANC Headphones Pro"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                    Critical Deficit
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs">
                    Current: 8 units
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">Wireless ANC Headphones Pro</h4>
                <p className="text-[11px] text-slate-500">SKU-TECH-001 • Electronics &amp; Gadgets</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Top Supplier:</span>
                    <span className="font-bold text-slate-800">ZenFlow Eco Goods</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Turnaround:</span>
                    <span className="font-semibold text-slate-700">8 Days (96.0% On-Time)</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Optimal Unit Cost:</span>
                    <span>₹139.20</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Reorder 67 units</span>
                <Link
                  to="/procurement"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold"
                >
                  Review Order
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative rounded-2xl overflow-hidden mb-4 h-44 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
                    alt="Smart Fitness Watch Series 9"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                    Stockout Zero
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs">
                    Current: 0 units
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">Smart Fitness Watch Series 9</h4>
                <p className="text-[11px] text-slate-500">SKU-TECH-004 • Electronics &amp; Gadgets</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Top Supplier:</span>
                    <span className="font-bold text-slate-800">Nexa Logistics Group</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Turnaround:</span>
                    <span className="font-semibold text-slate-700">7 Days (93.8% On-Time)</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Optimal Unit Cost:</span>
                    <span>₹105.60</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Reorder 73 units</span>
                <Link
                  to="/procurement"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold"
                >
                  Review Order
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="relative rounded-2xl overflow-hidden mb-4 h-44 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
                    alt="Ergonomic Mechanical Keyboard"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                    High Priority
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-800 backdrop-blur-xs">
                    Current: 14 units
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">Ergonomic Mechanical Keyboard</h4>
                <p className="text-[11px] text-slate-500">SKU-TECH-002 • Office Equipment</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Top Supplier:</span>
                    <span className="font-bold text-slate-800">PrimeSource Wholesale</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Turnaround:</span>
                    <span className="font-semibold text-slate-700">4 Days (91.2% On-Time)</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Optimal Unit Cost:</span>
                    <span>₹68.00</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Reorder 56 units</span>
                <Link
                  to="/procurement"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold"
                >
                  Review Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Industry Use Cases */}
      <section id="industry" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Versatile Deployment</span>
          <h2 className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            Tailored for Modern Retail Verticals
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Consumer Electronics', icon: '🎧', desc: 'High unit values, fast product cycles, and strict supplier lead time tracking.' },
            { title: 'Fashion & Apparel', icon: '👕', desc: 'Seasonal demand surges, fast-turnover SKUs, and clearance markdown guidance.' },
            { title: 'Home & Ergonomics', icon: '🪑', desc: 'Bulky warehouse footprints, safety stock buffers, and storage optimization.' },
            { title: 'Gourmet & Grocery', icon: '☕', desc: 'Freshness monitoring, frequent batch replenishments, and supplier reliability.' }
          ].map((ind, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center">
              <span className="text-3xl block mb-3">{ind.icon}</span>
              <h4 className="font-bold text-slate-900 text-sm">{ind.title}</h4>
              <p className="text-xs text-slate-500 mt-2">{ind.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW SECTION: Career (#career) */}
      <section id="career" className="py-20 bg-white border-t border-slate-200 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Careers at Inventra AI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Shape the Autonomous Supply Chain
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl">
                We are building the intelligent algorithms and cloud systems that predict retail commerce. Join our mission.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/careers"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>View Full Career Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {jobsList.map((job) => (
              <div
                key={job.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-100/70 text-sky-800 text-[10px] font-bold">
                      {job.department}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {job.location}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {job.salary}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900">{job.title}</h4>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {job.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => openApply(job)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-102 flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call To Action */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-tr from-slate-900 via-sky-950 to-teal-950 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Transform Your Retail Inventory?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-sky-100 max-w-xl mx-auto">
            Experience complete end-to-end demand prediction, supplier comparison, and smart reordering.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-sky-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
            >
              Launch Live Application
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm border border-sky-400/40 shadow-lg shadow-sky-500/20 transition-all"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-white border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-100 p-1 flex items-center justify-center shadow-xs">
              <img
                src="/logo_icon.png"
                alt="Inventra AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900">
                Inventra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Retail Demand Prediction &amp; Inventory Optimization
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-semibold text-slate-600">
            <a href="#features" className="hover:text-sky-600">Features</a>
            <a href="#forecasting" className="hover:text-sky-600">AI Forecasting</a>
            <a href="#procurement" className="hover:text-sky-600">Procurement</a>
            <Link to="/careers" className="hover:text-sky-600">Careers</Link>
            <Link to="/login" className="hover:text-sky-600">Portal Login</Link>
          </div>

          <p>© 2026 Inventra AI. Commercial Retail Demand Prediction &amp; Procurement.</p>
        </div>
      </footer>

      {/* In-page Job Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Apply to Inventra AI</span>
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
                  <h4 className="text-xl font-black text-slate-900">Application Received!</h4>
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
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Years of Relevant Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Years"
                    value={applicantExp}
                    onChange={(e) => setApplicantExp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-sky-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Introduction or LinkedIn Profile</label>
                  <textarea
                    rows="3"
                    placeholder="Tell us what you've built and why you'd like to work with Inventra AI..."
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
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
                    <span>{submitting ? 'Sending...' : 'Submit Application'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
