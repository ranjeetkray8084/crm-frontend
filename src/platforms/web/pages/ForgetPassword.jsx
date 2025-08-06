import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { customAlert } from "../../../core/utils/alertUtils";
import { useAuth } from "../../../shared/contexts/AuthContext";

const ForgetPassword = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const { sendOtp, verifyOtp, resetPasswordWithOtp } = useAuth();

  const sendOTP = async () => {
    if (!email) return customAlert("❌ Email is required");
    setOtpLoading(true);
    const result = await sendOtp(email);
    setOtpLoading(false);
    customAlert(result.success ? "📨 OTP sent to your email" : `❌ ${result.error}`);
  };

  const verifyOTP = async () => {
    if (!otp) return customAlert("❌ Enter OTP to verify");
    setVerifying(true);
    
    try {
      const result = await verifyOtp(email, otp);
      setVerifying(false);

      if (result.success && result.valid) {
        customAlert("✅ OTP Verified");
      } else {
        customAlert(`❌ ${result.error || "Invalid OTP"}`);
      }
    } catch (error) {
      setVerifying(false);
      console.error('Verify OTP error:', error);
      customAlert(`❌ Network error: ${error.message}`);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) return customAlert("❌ Enter new password");
    setSaving(true);
    
    try {
      const result = await resetPasswordWithOtp(email, newPassword);
      setSaving(false);

      if (result.success) {
        customAlert("✅ Password changed successfully");
        if (onBack) onBack();
      } else {
        customAlert(`❌ ${result.error}`);
      }
    } catch (error) {
      setSaving(false);
      console.error('Reset password error:', error);
      customAlert(`❌ Network error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#1c69ff] text-center mb-4">
        Forget Password?
      </h2>

      {/* Email & Send OTP */}
      <div>
        <label className="text-sm font-semibold text-[#1c69ff] mb-1 block">
          Enter your email
        </label>
        <div className="flex items-center bg-blue-50 rounded px-3 py-2">
          <User size={16} className="mr-2 text-[#1c69ff]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full outline-none bg-transparent text-sm"
          />
          <button
            onClick={sendOTP}
            disabled={otpLoading}
            className={`bg-[#1c69ff] text-white text-xs px-3 py-1 rounded ml-2 transition duration-200 ${
              otpLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {otpLoading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      </div>

      {/* OTP & Verify */}
      <div>
        <label className="text-sm font-semibold text-[#1c69ff] mb-1 block">
          Enter OTP
        </label>
        <div className="flex items-center bg-blue-50 rounded px-3 py-2">
          <Mail size={16} className="mr-2 text-[#1c69ff]" />
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            className="w-full outline-none bg-transparent text-sm"
          />
          <button
            onClick={verifyOTP}
            disabled={verifying}
            className={`bg-[#1c69ff] text-white text-xs px-3 py-1 rounded ml-2 ${
              verifying ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="text-sm font-semibold text-[#1c69ff] mb-1 block">
          Enter New Password
        </label>
        <div className="flex items-center bg-blue-50 rounded px-3 py-2 relative">
          <Lock size={16} className="mr-2 text-[#1c69ff]" />
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full outline-none bg-transparent text-sm pr-6"
            autoComplete="new-password"
          />
          <div
            className="absolute right-3 cursor-pointer text-[#1c69ff]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleChangePassword}
        disabled={saving}
        className={`w-full bg-[#1c69ff] hover:bg-[#1554cc] text-white font-bold py-2 rounded text-sm ${
          saving ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {saving ? "Saving..." : "SAVE CHANGES"}
      </button>

      {/* Back Link */}
      <p
        className="text-center text-xs text-gray-500 mt-4 cursor-pointer hover:underline"
        onClick={onBack}
      >
        Back to Login
      </p>
    </div>
  );
};

export default ForgetPassword;
