"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import type { JSX } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError("Missing token.");
        return;
      }

      try {
        const res = await fetch(`/api/verify-token?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Token invalid or expired.");
          return;
        }

        setEmail(data.email);
      } catch {
        setError("Error verifying token.");
      }
    };

    checkToken();
  }, [token]);

  const handleReset = async () => {
    setError("");
    if (!token || !email) return setError("Invalid or missing token.");
    if (password !== confirm) return setError("Passwords do not match.");

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(password)) {
      return setError("Password must include uppercase, number, special char, and be 8+ characters.");
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Password reset successfully. Redirecting...");
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("Error resetting password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100 px-4">
      <div className="w-full max-w-md bg-[#111827] border border-white/10 p-6 rounded-xl shadow-2xl">
        <h1 className="text-2xl font-semibold text-white mb-4">Reset Password</h1>
        <p className="text-gray-400 mb-6 text-sm">
          {email ? `Set a new password for ${email}.` : "Unable to verify token or email."}
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/10 text-green-400 text-sm px-3 py-2 rounded mb-4">{success}</div>
        )}

        <div className="space-y-4">
          <InputField
            icon={<LockClosedIcon />}
            type="password"
            placeholder="New password"
            value={password}
            onChange={setPassword}
          />
          <InputField
            icon={<LockClosedIcon />}
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={setConfirm}
          />
          <button
            onClick={handleReset}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium"
            disabled={!email}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

type InputFieldProps = {
  icon: JSX.Element;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
};

const InputField = ({
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
}: InputFieldProps) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-3 bg-black/30 border border-gray-800 rounded-lg text-white"
    />
  </div>
);
