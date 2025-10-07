"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import Header from "@/app/components/Header";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const twofa = searchParams.get("twofa");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 2FA States
  const [step, setStep] = useState<"signin" | "2fa-verify">("signin");
  const [tempToken, setTempToken] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Check if 2FA is required
        if (data.require2FA) {
          setTempToken(data.tempToken);
          setStep("2fa-verify");
        } else {
          // No 2FA required, redirect to dashboard
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: twoFactorToken,
          tempToken: tempToken,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Store user info and redirect
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid 2FA code");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const backToSignin = () => {
    setStep("signin");
    setTwoFactorToken("");
    setTempToken("");
    setError("");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
      }}
    >

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div
            className="backdrop-blur-lg rounded-2xl shadow-2xl p-8 border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "var(--card-border)",
            }}
          >
            {/* ✅ Success Message After Registration */}
            {registered && step === "signin" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-500 text-sm flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {twofa ? (
                  <span>Account created & 2FA enabled! Please sign in.</span>
                ) : (
                  <span>Account created successfully! Please sign in.</span>
                )}
              </motion.div>
            )}

            {/* Step 1: Sign In Form */}
            {step === "signin" && (
              <>
                <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold mb-2">
                  Welcome Back
                </h2>
                <p style={{ color: "var(--text-muted)" }} className="mb-6">
                  Sign in to access your password vault
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "var(--card-border)",
                        color: "var(--text)",
                      }}
                      placeholder="john@example.com"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderColor: "var(--card-border)",
                          color: "var(--text)",
                        }}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </motion.button>
                </form>

                <p style={{ color: "var(--text-muted)" }} className="mt-6 text-center text-sm">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" style={{ color: "var(--btn-bg)" }} className="font-semibold hover:underline">
                    Sign Up
                  </Link>
                </p>
              </>
            )}

            {/* Step 2: 2FA Verification */}
            {step === "2fa-verify" && (
              <>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: "var(--btn-bg)" }}
                  >
                    <ShieldCheck className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p style={{ color: "var(--text-muted)" }} className="text-sm">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <div>
                    <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2 text-center">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-4 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-3xl tracking-[0.5em] font-mono"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "var(--card-border)",
                        color: "var(--text)",
                      }}
                      placeholder="000000"
                      autoFocus
                    />
                    <p style={{ color: "var(--text-muted)" }} className="text-xs mt-2 text-center">
                      Enter the code from Google Authenticator or Authy
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || twoFactorToken.length !== 6}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Verify & Sign In
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={backToSignin}
                    className="w-full text-center text-sm hover:underline transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ← Back to sign in
                  </button>
                </form>

                {/* Help Text */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 rounded-xl backdrop-blur-sm border"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    borderColor: "var(--btn-bg)",
                  }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="text-xs">
                    💡 <strong style={{ color: "var(--text)" }}>Tip:</strong> Open your authenticator app and enter the 6-digit code shown for PassGenPro.
                  </p>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}