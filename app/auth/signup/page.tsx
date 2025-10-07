"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { initEnable2FA, verifyAndEnable2FA } from "@/app/lib/twoFactorAuth";

export default function SignupPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 2FA States
  const [step, setStep] = useState<"signup" | "2fa-setup" | "2fa-verify">("signup");
  const [enable2FA, setEnable2FA] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {

        // Check if user wants to enable 2FA
        if (enable2FA) {
            if (data.token) {
                sessionStorage.setItem("authToken", data.token);
            }
            await setup2FA();
        } else {
          // Redirect directly to dashboard
          router.push("/auth/signin?registered=true");
        }
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err: unknown) {
      setError(`Something went wrong. Please try again. ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await initEnable2FA();
      setQrCode(data.qrCode || "");
      setSecret(data.secret || "");
      setStep("2fa-setup");
    } catch (err: unknown) {
      console.error("Setup 2FA error:", err);
      let message = "Failed to setup 2FA. Please try again.";
      if(err instanceof Error){
        message = err.message;
      }
      setError(message || "Failed to setup 2FA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Pass the 6-digit verification token from the authenticator app
      await verifyAndEnable2FA(verificationToken);
      sessionStorage.removeItem("authToken");
      // Redirect to signin
      router.push("/auth/signin?registered=true&twofa=enabled");
    } catch (err: unknown) {
        let message = "Verification failed. Please try again.";
        if(err instanceof Error){
            message = err.message;
        }
      setError(message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const skipTwoFactor = () => {
    // Clear any stored token
    sessionStorage.removeItem("authToken");
    
    // ✅ Redirect to signin
    router.push("/auth/signin?registered=true");
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
            {/* Step 1: Signup Form */}
            {step === "signup" && (
              <>
                <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold mb-2">
                  Create Account
                </h2>
                <p style={{ color: "var(--text-muted)" }} className="mb-6">
                  Join PassGenPro and secure your passwords today
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderColor: "var(--card-border)",
                          color: "var(--text)",
                        }}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderColor: "var(--card-border)",
                          color: "var(--text)",
                        }}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

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
                        className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* 2FA Toggle */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl border transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: enable2FA ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.05)",
                      borderColor: enable2FA ? "var(--btn-bg)" : "var(--card-border)",
                    }}
                    onClick={() => setEnable2FA(!enable2FA)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={{
                          borderColor: enable2FA ? "var(--btn-bg)" : "var(--card-border)",
                          backgroundColor: enable2FA ? "var(--btn-bg)" : "transparent",
                        }}
                      >
                        {enable2FA && <ShieldCheck className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p style={{ color: "var(--text)" }} className="font-medium">
                          Enable Two-Factor Authentication
                        </p>
                        <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5">
                          Recommended for extra security
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 cursor-pointer rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </motion.button>
                </form>

                <p style={{ color: "var(--text-muted)" }} className="mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" style={{ color: "var(--btn-bg)" }} className="font-semibold hover:underline">
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* Step 2: 2FA Setup */}
            {step === "2fa-setup" && (
              <>
                <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold mb-2">
                  Setup 2FA
                </h2>
                <p style={{ color: "var(--text-muted)" }} className="mb-6">
                  Scan this QR code with your authenticator app
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

                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 rounded-2xl bg-white"
                    >
                      <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
                    </motion.div>
                  </div>

                  {/* Secret Key */}
                  <div className="p-4 rounded-xl backdrop-blur-sm border" style={{ borderColor: "var(--card-border)" }}>
                    <p style={{ color: "var(--text-muted)" }} className="text-xs mb-2">
                      Or enter this code manually:
                    </p>
                    <div className="relative">
                        <code
                            className="block text-center font-mono text-xs px-3 py-2 pr-12 rounded-lg break-all"
                            style={{
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            color: "var(--text)",
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                            }}
                        >
                            {secret}
                        </code>
                        <button
                            type="button"
                            onClick={() => {
                            navigator.clipboard.writeText(secret);
                            setCopied(true);
                            setTimeout(()=> setCopied(false), 2000)
                            // Show toast/notification
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70"
                            style={{ 
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                color: "var(--text)" 
                            }}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* copied toast */}
                        {copied && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
                                style={{
                                backgroundColor: "var(--btn-bg)",
                                color: "#fff",
                                }}
                            >
                                ✓ Copied!
                            </motion.div>
                        )}

                        </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <p style={{ color: "var(--text)" }} className="font-medium text-sm">
                      Instructions:
                    </p>
                    <ol style={{ color: "var(--text-muted)" }} className="text-xs space-y-1 list-decimal list-inside">
                      <li>Install Google Authenticator or Authy</li>
                      <li>Scan the QR code or enter the secret key</li>
                      <li>Enter the 6-digit code below to verify</li>
                    </ol>
                  </div>

                  {/* Proceed to Verification */}
                  <motion.button
                    type="button"
                    onClick={() => setStep("2fa-verify")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  >
                    I&apos;ve Scanned the Code
                  </motion.button>

                  <button
                    type="button"
                    onClick={skipTwoFactor}
                    className="w-full text-center text-sm hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Skip for now
                  </button>
                </div>
              </>
            )}

            {/* Step 3: 2FA Verification */}
            {step === "2fa-verify" && (
              <>
                <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold mb-2">
                  Verify 2FA
                </h2>
                <p style={{ color: "var(--text-muted)" }} className="mb-6">
                  Enter the 6-digit code from your authenticator app
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

                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <div>
                    <label style={{ color: "var(--text)" }} className="block text-sm font-medium mb-2">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "var(--card-border)",
                        color: "var(--text)",
                      }}
                      placeholder="123456"
                      autoFocus
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || verificationToken.length !== 6}
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
                      "Verify & Complete"
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setStep("2fa-setup")}
                    className="w-full text-center text-sm hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ← Back to QR code
                  </button>

                  <button
                    type="button"
                    onClick={skipTwoFactor}
                    className="w-full text-center text-sm hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Skip for now
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}