"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, X, Eye, EyeOff } from "lucide-react";
interface VaultAccessModalProps {
  isOpen: boolean;
  requires2FA: boolean;
  onVerify: (password?: string, twoFactorCode?: string) => Promise<void>;
  onClose: () => void;
}
export default function VaultAccessModal({ 
  isOpen, 
  requires2FA, 
  onVerify, 
  onClose 
}: VaultAccessModalProps) {
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (requires2FA) {
        if (!twoFactorCode || twoFactorCode.length !== 6) {
          setError("Please enter a valid 6-digit code");
          setLoading(false);
          return;
        }
        await onVerify(undefined, twoFactorCode);
      } else {
        if (!password) {
          setError("Please enter your password");
          setLoading(false);
          return;
        }
        await onVerify(password, undefined);
      }
      setPassword("");
      setTwoFactorCode("");
      setError("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Verification failed");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setPassword("");
    setTwoFactorCode("");
    setError("");
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--modal-bg)",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "450px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {requires2FA ? (
                    <KeyRound size={24} color="white" />
                  ) : (
                    <Lock size={24} color="white" />
                  )}
                </div>
                <div>
                  <h2 style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: 0,
                  }}>
                    Verify Access
                  </h2>
                  <p style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    margin: 0,
                  }}>
                    {requires2FA ? "Enter your 2FA code" : "Enter your password"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {requires2FA ? (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}>
                    2FA Code
                  </label>
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setTwoFactorCode(value);
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "1.125rem",
                      letterSpacing: "0.25rem",
                      textAlign: "center",
                      border: "2px solid var(--card-border)",
                      borderRadius: "0.5rem",
                      backgroundColor: "var(--bg)",
                      color: "var(--text)",
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your login password"
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        paddingRight: "3rem",
                        border: "2px solid var(--card-border)",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        backgroundColor: "var(--bg)",
                        color: "var(--text)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    color: "#ef4444",
                    fontSize: "0.875rem",
                  }}
                >
                  {error}
                </motion.div>
              )}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "2px solid var(--card-border)",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    backgroundColor: "transparent",
                    color: "var(--text)",
                    opacity: loading ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (requires2FA ? twoFactorCode.length !== 6 : !password)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: loading || (requires2FA ? twoFactorCode.length !== 6 : !password) ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    opacity: loading || (requires2FA ? twoFactorCode.length !== 6 : !password) ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Verifying..." : "Verify & Access"}
                </button>
              </div>
            </form>
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              backgroundColor: "rgba(59, 130, 246, 0.05)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "0.5rem",
            }}>
              <p style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: 1.5,
              }}>
                <Lock size={12} style={{ display: "inline", marginRight: "0.25rem" }} />
                Your vault contains sensitive information. {requires2FA ? "2FA verification" : "Password verification"} is required for extra security.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
