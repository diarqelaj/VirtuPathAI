"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Footer from "@/components/Footer";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import { Spotlight } from "@/components/ui/Spotlight";
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { auth } from "@/lib/firebase";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { navItems } from "@/data";
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
  }
}
const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (session?.user?.email) {
        try {
          const response = await api.get("/Users");
          const users = response.data;

          let foundUser = users.find((user: any) => user.email === session.user.email);

          if (!foundUser) {
            const newUser = {
              fullName: session.user.name || "",
              email: session.user.email,
              passwordHash: "",
              registrationDate: new Date().toISOString(),
            };
            const createResponse = await api.post("/Users", newUser);
            foundUser = createResponse.data;
          }

          localStorage.setItem("user", JSON.stringify(foundUser));
          localStorage.setItem("userID", foundUser.userID.toString());

          const pending = localStorage.getItem("pendingEnrollment");
          if (pending) {
            router.push("/payment");
          } else {
            router.push("/");
          }
        } catch {
          setError("Google authentication failed.");
        }
      }
    };

    handleGoogleAuth();
  }, [session]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    const pending = localStorage.getItem("pendingEnrollment");

    if (isLogin) {
      try {
        const response = await api.get("/Users");
        const users = response.data;

        const foundUser = users.find(
          (user: any) => user.email === email && user.passwordHash === password
        );

        if (foundUser) {
          localStorage.setItem("user", JSON.stringify(foundUser));
          localStorage.setItem("userID", foundUser.userID.toString());

          pending ? router.push("/payment") : router.push("/");
        } else {
          setError("Invalid email or password");
        }
      } catch {
        setError("Failed to fetch users");
      }
    } else {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        const newUser = {
          fullName: name,
          email,
          passwordHash: password,
          registrationDate: new Date().toISOString(),
        };

        const response = await api.post("/Users", newUser);
        const registeredUser = response.data;

        localStorage.setItem("user", JSON.stringify(registeredUser));
        localStorage.setItem("userID", registeredUser.userID.toString());

        pending ? router.push("/payment") : router.push("/");
      } catch {
        setError("Registration failed. Email might already exist.");
      }
    }
  };

  const setupRecaptcha = () => {
    if (typeof window === "undefined" || window.recaptchaVerifier) return;
  
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response: any) => {
          console.log("✅ reCAPTCHA solved:", response);
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired, please try again.");
        },
      }
    );
  
    window.recaptchaVerifier.render().then((widgetId: number) => {
      window.recaptchaWidgetId = widgetId;
    });
  };

  const handleSendOTP = async () => {
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier!;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      setSuccess("OTP sent! Check your phone.");
    } catch (err: any) {
      console.error("📲 Firebase Phone Auth Error:", err);
      setError(err.message || "Failed to send OTP.");
    }
  };
  

  const handleVerifyOTP = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;
      const response = await api.get("/Users");

      let foundUser = response.data.find((u: any) => u.phone === phone);

      if (!foundUser) {
        const newUser = {
          fullName: "Phone User",
          email: `${phone}@virtupath.ai`,
          phone,
          passwordHash: "",
          registrationDate: new Date().toISOString(),
        };
        const createResponse = await api.post("/Users", newUser);
        foundUser = createResponse.data;
      }

      localStorage.setItem("user", JSON.stringify(foundUser));
      localStorage.setItem("userID", foundUser.userID.toString());

      setShowPhoneModal(false);
      const pending = localStorage.getItem("pendingEnrollment");
      pending ? router.push("/payment") : router.push("/");
    } catch {
      setError("Invalid OTP");
    }
  };

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-50 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-2 text-gray-400">
                {isLogin ? "Please sign in to continue" : "Start your learning journey"}
              </p>
            </div>

            {(error || success) && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${error ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                {error || success}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                {!isLogin && (
                  <div className="group relative">
                    <UserCircleIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800"
                    />
                  </div>
                )}
                <div className="group relative">
                  <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800"
                  />
                </div>
                <div className="group relative">
                  <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800"
                  />
                </div>
                {!isLogin && (
                  <div className="group relative">
                    <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800"
                    />
                  </div>
                )}
              </div>

              <button onClick={handleSubmit} className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium">
                {isLogin ? "Sign In" : "Sign Up"}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              <button onClick={() => signIn("google")} className="w-full py-3.5 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium">
                <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.4-34.1-4-50.3H272v95.1h146.9c-6.3 33.7-25 62.2-53.1 81.2v67.3h85.9c50.2-46.3 81.8-114.5 81.8-193.3z" />
                  <path fill="#34A853" d="M272 544.3c72.6 0 133.5-24.1 178-65.3l-85.9-67.3c-23.9 16-54.4 25.4-92.1 25.4-70.8 0-130.9-47.8-152.5-112.1H30.8v70.7c44.8 88.1 137.6 148.6 241.2 148.6z" />
                  <path fill="#FBBC05" d="M119.5 324.9c-10.4-30.3-10.4-62.9 0-93.2v-70.7H30.8c-36.6 72.9-36.6 161 0 233.9l88.7-70z" />
                  <path fill="#EA4335" d="M272 107.7c39.5 0 75.1 13.6 103.1 40.2l77.1-77.1C405.5 25 344.6 0 272 0 168.4 0 75.6 60.5 30.8 148.6l88.7 70.7c21.6-64.3 81.7-111.6 152.5-111.6z" />
                </svg>
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </button>

              <button onClick={() => setShowPhoneModal(true)} className="w-full py-3.5 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium">
                <PhoneIcon className="w-5 h-5" />
                {isLogin ? "Sign in with Phone" : "Sign up with Phone"}
              </button>

              <p className="text-center text-gray-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button onClick={() => setIsLogin(!isLogin)} className="text-purple-400 hover:text-purple-300 transition-colors">
                  {isLogin ? "Create account" : "Sign in instead"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-black border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-white">Phone Verification</h2>
            <input
              type="tel"
              placeholder="+38344XXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 mb-3 bg-black/30 rounded-lg border border-gray-800 text-white"
            />
            <button onClick={handleSendOTP} className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700 mb-3">
              Send the Verification Code
            </button>
            {confirmationResult && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 mb-3 bg-black/30 rounded-lg border border-gray-800 text-white"
                />
                <button onClick={handleVerifyOTP} className="w-full py-2 bg-green-600 rounded hover:bg-green-700">
                  Verify the code
                </button>
              </>
            )}
            <div id="recaptcha-container"></div>
            <button onClick={() => setShowPhoneModal(false)} className="mt-4 text-sm text-gray-400 hover:underline text-center w-full">
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AuthPage;
