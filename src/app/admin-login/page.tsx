"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/components/AdminAuthContext";
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotSuccess, setShowForgotSuccess] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/admin-dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowForgotSuccess(false);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password, remember);
      if (result.success) {
        router.push(redirectUrl);
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address to reset password.");
      return;
    }
    // Simulate password reset request
    setShowForgotSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-indigo-50 flex items-center justify-center px-4 py-12 mesh-grid">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-700 px-8 py-6 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2.5 mb-1">
                <span className="bg-white/10 p-1.5 rounded-lg">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <span className="text-xl font-bold tracking-tight">WithYours</span>
              </div>
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">
                Operations &amp; Admin Console
              </p>
            </div>
            <span className="bg-indigo-500/20 text-indigo-100 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/20">
              Admin Portal
            </span>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Authentication</h1>
            <p className="text-sm text-gray-500 mb-6">Access restricted to authorized operations personnel.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {showForgotSuccess && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                A password reset link has been simulated &amp; sent to <strong>{email}</strong>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@withyours.in"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none text-gray-900 text-sm bg-gray-50 transition-all focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none text-gray-900 text-sm bg-gray-50 transition-all focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600 select-none">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary font-medium hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-indigo-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Secure Login</span>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-5">
              Warning: Unauthorized access is strictly logged and audited.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © {new Date().getFullYear()} WithYours Admin Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
