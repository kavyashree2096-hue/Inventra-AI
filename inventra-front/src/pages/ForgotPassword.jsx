import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } catch {
      // ignore
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
            <div className="w-16 h-16 rounded-2xl bg-white border border-sky-100 p-1 flex items-center justify-center shadow-lg shadow-sky-500/10 group-hover:scale-105 transition-transform overflow-hidden">
              <img
                src="/logo_icon.png"
                alt="Inventra AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900">
                Inventra <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500">AI</span>
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-sky-700">Retail Demand</span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600">&amp; Inventory Optimization</span>
              </div>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your verified email to receive recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-emerald-900 text-sm">Check Your Inbox</h4>
            <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, we have sent a secure password reset link.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@inventra.ai"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Instructions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-sky-600 inline-flex items-center gap-1 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
