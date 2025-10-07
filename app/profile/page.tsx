"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Shield, Edit2, Save, X, Loader2, AlertTriangle, ArrowLeft, Eye, EyeOff, QrCode, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import Link from "next/link";
import QRCode from "qrcode";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const [disableData, setDisableData] = useState({
    password: "",
    token: "",
  });

  const [enableData, setEnableData] = useState({
    token: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } else {
      router.push("/auth/signin");
    }
  }, [user, router]);

  const handleSave = () => {
    updateUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
    setIsEditing(false);
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      setIsEditing(false);
    }
  };

  // ✅ Enable 2FA - Step 1: Generate QR Code
  const handleInitEnable2FA = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/enable-2fa", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setSecret(data.secret);

        // ✅ Generate QR Code from qrCodeUrl
        const qrCodeDataUrl = await QRCode.toDataURL(data.qrCodeUrl);
        setQrCode(qrCodeDataUrl);
        setShowEnableModal(true);
      } else {
        setError(data.message || "Failed to generate 2FA setup");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      console.error("Enable 2FA error:", err);
      setError("Something went wrong. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enable 2FA - Step 2: Verify Token
  const handleVerifyEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-enable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: enableData.token,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        updateUser({ twoFactorEnabled: true });
        setSuccess("Two-factor authentication enabled successfully!");
        setShowEnableModal(false);
        setEnableData({ token: "" });
        setQrCode("");
        setSecret("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Invalid 2FA code");
      }
    } catch (err) {
      console.error("Verify 2FA error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/disable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: disableData.password,
          token: disableData.token,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        updateUser({ twoFactorEnabled: false });
        setSuccess("Two-factor authentication disabled successfully!");
        setShowDisableModal(false);
        setDisableData({ password: "", token: "" });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to disable 2FA");
      }
    } catch (err) {
      console.error("Disable 2FA error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Copy Secret to Clipboard
  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen flex flex-col pt-20"
      style={{
        background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
      }}
    >
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {/* Back to Dashboard Button */}
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "var(--text)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </motion.button>
          </Link>

          <div
            className="backdrop-blur-lg rounded-2xl shadow-2xl p-8 border"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "var(--card-border)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ color: "var(--text)" }} className="text-3xl font-bold">
                Profile
              </h2>
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </motion.button>
              ) : (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                    style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "var(--text)",
                    }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-500 text-sm"
              >
                ✓ {success}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Profile Avatar */}
            <div className="flex justify-center mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
              >
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    style={{ color: "var(--text)" }}
                    className="block text-sm font-medium mb-2"
                  >
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "var(--card-border)",
                        color: "var(--text)",
                      }}
                    />
                  ) : (
                    <p
                      className="px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text)",
                      }}
                    >
                      {user.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{ color: "var(--text)" }}
                    className="block text-sm font-medium mb-2"
                  >
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "var(--card-border)",
                        color: "var(--text)",
                      }}
                    />
                  ) : (
                    <p
                      className="px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "var(--text)",
                      }}
                    >
                      {user.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  style={{ color: "var(--text)" }}
                  className="block text-sm font-medium mb-2"
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <p
                  className="px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-muted)",
                  }}
                >
                  {user.email}
                </p>
              </div>

              {/* 2FA Status */}
              <div>
                <label
                  style={{ color: "var(--text)" }}
                  className="block text-sm font-medium mb-2"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Two-Factor Authentication
                </label>
                <div
                  className="px-4 py-3 rounded-xl flex items-center justify-between"
                  style={{
                    backgroundColor: user.twoFactorEnabled
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        color: user.twoFactorEnabled ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {user.twoFactorEnabled ? "✓ Enabled" : "✗ Disabled"}
                    </span>
                    {user.twoFactorEnabled && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        - Extra layer of security active
                      </span>
                    )}
                  </div>

                  {/* Enable/Disable Button */}
                  {user.twoFactorEnabled ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDisableModal(true)}
                      className="px-3 py-1 rounded-lg text-sm transition-all duration-300 text-red-500 hover:bg-red-500/10"
                    >
                      Disable
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleInitEnable2FA}
                      disabled={loading}
                      className="px-3 py-1 rounded-lg text-sm transition-all duration-300 text-green-500 hover:bg-green-500/10 disabled:opacity-50 flex items-center gap-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Enable"
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✅ Enable 2FA Modal */}
      {showEnableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-2xl shadow-2xl p-6 border"
            style={{
              backgroundColor: "var(--bg-gradient-start)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 style={{ color: "var(--text)" }} className="text-xl font-bold">
                  Enable 2FA
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Scan QR code with your authenticator app
                </p>
              </div>
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

            <form onSubmit={handleVerifyEnable2FA} className="space-y-4">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                {qrCode && (
                  <img
                    src={qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48 mb-4 rounded-lg bg-white p-2"
                  />
                )}

                {/* Manual Entry */}
                <div
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <p style={{ color: "var(--text-muted)" }} className="text-xs mb-2">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <code
                      style={{ color: "var(--text)" }}
                      className="text-sm font-mono break-all"
                    >
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: "var(--text)" }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div>
                <label
                  style={{ color: "var(--text)" }}
                  className="block text-sm font-medium mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={enableData.token}
                  onChange={(e) =>
                    setEnableData({ token: e.target.value.replace(/\D/g, "") })
                  }
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest font-mono"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "var(--card-border)",
                    color: "var(--text)",
                  }}
                  placeholder="000000"
                  autoFocus
                />
                <p style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || enableData.token.length !== 6}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Enable 2FA"
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowEnableModal(false);
                    setError("");
                    setEnableData({ token: "" });
                    setQrCode("");
                    setSecret("");
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "var(--text)",
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-2xl shadow-2xl p-6 border"
            style={{
              backgroundColor: "var(--bg-gradient-start)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 style={{ color: "var(--text)" }} className="text-xl font-bold">
                  Disable 2FA?
                </h3>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Verify your identity to proceed
                </p>
              </div>
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

            <form onSubmit={handleDisable2FA} className="space-y-4">
              {/* Password Field */}
              <div>
                <label
                  style={{ color: "var(--text)" }}
                  className="block text-sm font-medium mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={disableData.password}
                    onChange={(e) =>
                      setDisableData({ ...disableData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderColor: "var(--card-border)",
                      color: "var(--text)",
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 2FA Token Field */}
              <div>
                <label
                  style={{ color: "var(--text)" }}
                  className="block text-sm font-medium mb-2"
                >
                  2FA Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={disableData.token}
                  onChange={(e) =>
                    setDisableData({
                      ...disableData,
                      token: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest font-mono"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderColor: "var(--card-border)",
                    color: "var(--text)",
                  }}
                  placeholder="000000"
                />
                <p style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={
                    loading ||
                    !disableData.password ||
                    disableData.token.length !== 6
                  }
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    "Disable 2FA"
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowDisableModal(false);
                    setError("");
                    setDisableData({ password: "", token: "" });
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "var(--text)",
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}