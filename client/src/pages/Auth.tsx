import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Mail, User, Phone, FileText, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

type AuthMode = "login" | "signup" | "reset";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    nationalId: "",
    phoneNumber: "",
  });
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    // Redirect to Manus OAuth login
    window.location.href = getLoginUrl();
  };

  const handleSignup = () => {
    // In a real app, you would call an API to register the user
    // For now, redirect to login
    console.log("Signup data:", formData);
    setMode("login");
  };

  const handleReset = () => {
    // In a real app, you would call an API to reset password
    console.log("Reset email:", formData.email);
    setMode("login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">ZimPass Flow</h1>
          <p className="text-muted-foreground text-lg">Smart Toll Payment System</p>
        </div>

        {/* Auth Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur">
          {mode === "login" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
                <p className="text-muted-foreground">Sign in to manage your toll payments</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-12 input-elegant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 input-elegant"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-foreground">Remember me</span>
                </label>
                <button
                  onClick={() => setMode("reset")}
                  className="text-accent hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                onClick={handleLogin}
                className="w-full btn-primary"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">New to ZimPass Flow?</span>
                </div>
              </div>

              <Button
                onClick={() => setMode("signup")}
                className="w-full btn-secondary"
              >
                Create Account
              </Button>
            </div>
          )}

          {mode === "signup" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
                <p className="text-muted-foreground">Join ZimPass Flow to manage your toll payments</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-12 input-elegant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">National ID</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="nationalId"
                      placeholder="12345678"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      className="pl-12 input-elegant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      name="phoneNumber"
                      placeholder="+263 712 345 678"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="pl-12 input-elegant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-12 input-elegant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 input-elegant"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 input-elegant"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" className="rounded border-border mt-1" />
                <span className="text-sm text-muted-foreground">
                  I agree to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>
                </span>
              </div>

              <Button
                onClick={handleSignup}
                className="w-full btn-primary"
              >
                Create Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                onClick={() => setMode("login")}
                className="w-full btn-ghost"
              >
                Back to Login
              </Button>
            </div>
          )}

          {mode === "reset" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
                <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 input-elegant"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                We'll send you a link to reset your password. Check your email for instructions.
              </p>

              <Button
                onClick={handleReset}
                className="w-full btn-primary"
              >
                Send Reset Link
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                onClick={() => setMode("login")}
                className="w-full btn-ghost"
              >
                Back to Login
              </Button>
            </div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 ZimPass Flow. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
