"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Shield, Edit2, Save, X, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";
import Link from "next/link";
import TwoFactorEnableModal from "@/app/components/TwoFactorEnableModal";
import TwoFactorDisableModal from "@/app/components/TwoFactorDisableModal";
import { initEnable2FA, verifyAndEnable2FA, disable2FA } from "@/app/lib/twoFactorAuth";
export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, loading: userLoading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted && !userLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, userLoading, router, mounted]);
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user]);
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
  const handleInitEnable2FA = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await initEnable2FA();
      setSecret(data.secret || "");
      setQrCode(data.qrCode || "");
      setShowEnableModal(true);
    } catch (error: unknown) {
      console.error("Enable 2FA error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to generate 2FA setup");
      }
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyEnable2FA = async (token: string) => {
    try {
      await verifyAndEnable2FA(token);
      updateUser({ twoFactorEnabled: true });
      setSuccess("Two-factor authentication enabled successfully!");
      setShowEnableModal(false);
      setQrCode("");
      setSecret("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      throw error;
    }
  };
  const handleDisable2FA = async (password: string, token: string) => {
    try {
      await disable2FA(password, token);
      updateUser({ twoFactorEnabled: false });
      setSuccess("Two-factor authentication disabled successfully!");
      setShowDisableModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      throw error;
    }
  };
  if (!mounted) {
    return null;
  }
  if (userLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(to bottom right, var(--bg-gradient-start), var(--bg-gradient-end))`,
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--btn-bg)" }} />
      </div>
    );
  }
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
          {}
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
            {}
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
            {}
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
            {}
            <div className="flex justify-center mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                style={{ backgroundColor: "var(--btn-bg)", color: "#fff" }}
              >
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </div>
            </div>
            {}
            <div className="space-y-4">
              {}
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
              {}
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
              {}
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
                  {}
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
      {}
      <TwoFactorEnableModal
        isOpen={showEnableModal}
        onClose={() => {
          setShowEnableModal(false);
          setQrCode("");
          setSecret("");
        }}
        qrCode={qrCode}
        secret={secret}
        onVerify={handleVerifyEnable2FA}
      />
      {}
      <TwoFactorDisableModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onDisable={handleDisable2FA}
      />
    </div>
  );
}