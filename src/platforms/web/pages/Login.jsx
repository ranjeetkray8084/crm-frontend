import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import ForgetPassword from "./ForgetPassword";
import { AuthService } from "../../../core/services/auth.service";
import DeactivatedUserModal from "../components/modals/DeactivatedUserModal";


const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [deactivatedUserEmail, setDeactivatedUserEmail] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  // Auto-clear error message after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000); // 4 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await AuthService.login(formData);

      if (result.success) {
        // Update auth context with both user data and token
        login(result.user, result.token);
        
        // Verify data is available
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        // Navigate to dashboard or redirect URL
        const redirectUrl = localStorage.getItem("redirectUrl");
        
        if (redirectUrl) {
          localStorage.removeItem("redirectUrl");
          navigate(redirectUrl);
        } else {
          navigate("/dashboard");
        }
      } else {
        // Check if user is deactivated
        if (result.isDeactivated) {
          setDeactivatedUserEmail(result.userEmail || formData.email);
          setShowDeactivatedModal(true);
          setError(""); // Clear error since we're showing the modal
        } else {
          setError(result.error || "Login failed");
        }
      }
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex flex-col items-center justify-center pt-8 pb-4 text-[#1c69ff]">
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">LEADS TRACKER</h1>
        <p className="text-xs tracking-wider mt-1">Track Leads, Close Faster</p>
      </div>
      {/* LEFT SECTION */}
      <motion.div
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center text-[#1c69ff]"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-extrabold tracking-wide mb-2 uppercase">
          LEADS TRACKER
        </h1>
        <p className="text-sm tracking-wider mb-10">Track Leads, Close Faster</p>
        <img src="/images/building-logo.jpeg" alt="Logo" className="w-48 sm:w-72 md:w-[420px] h-auto" />
      </motion.div>

      {/* RIGHT SECTION with Flip Animation */}
      <motion.div className="w-full md:w-1/2 flex flex-1 justify-center items-center px-4 py-8 md:py-0 perspective-[1200px]">
        <motion.div
          className="relative w-full max-w-[500px] min-h-[520px] md:h-[600px] rounded-xl shadow-xl"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Login Form */}
          <motion.div
            className="absolute w-full h-full backface-hidden bg-white border border-gray-200 rounded-xl p-6 sm:p-8 md:p-10 overflow-y-auto"
            initial={{ opacity: 1 }}
            animate={{ opacity: isFlipped ? 0 : 1 }}
            style={{ backfaceVisibility: "hidden" }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#1c69ff] text-center mb-8">
              Welcome Back!
            </h2>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 shadow-sm"
              >
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1c69ff] mb-1">
                  Your Email
                </label>
                <div className="flex items-center border border-black rounded px-3 py-3 bg-gray-100">
                  <Mail size={18} className="mr-2 text-black" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Username"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full outline-none text-sm bg-transparent"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#1c69ff] mb-1">
                  Password
                </label>
                <div className="flex items-center border border-black rounded px-3 py-3 bg-gray-100 relative">
                  <Lock size={18} className="mr-2 text-black" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full outline-none text-sm bg-transparent pr-6"
                    required
                  />
                  <div
                    className="absolute right-3 cursor-pointer text-black"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              {/* Forgot password */}
              <div
                className="text-right text-xs text-black hover:underline cursor-pointer"
                onClick={() => setIsFlipped(true)}
              >
                Forgot Password?
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#1c69ff] hover:bg-[#1554cc] text-white font-bold py-3 rounded text-sm transition-all duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </form>
          </motion.div>

          {/* Forget Password Component */}
          <motion.div
            className="absolute w-full h-full bg-white border border-gray-200 rounded-xl p-6 sm:p-8 md:p-10 overflow-y-auto"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <ForgetPassword onBack={() => setIsFlipped(false)} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Deactivated User Modal */}
      <DeactivatedUserModal
        isOpen={showDeactivatedModal}
        onClose={() => setShowDeactivatedModal(false)}
        userEmail={deactivatedUserEmail}
      />
    </div>
  );
};

export default Login;
