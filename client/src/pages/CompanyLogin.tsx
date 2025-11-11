import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CompanyLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [companyInfo, setCompanyInfo] = useState<{ name: string; logo?: string } | null>(null);

  // Get company by email domain
  const getCompanyQuery = trpc.auth.getCompanyByEmail.useQuery(
    { email },
    { enabled: false }
  );

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await getCompanyQuery.refetch();
      if (result.data) {
        setCompanyInfo(result.data);
        setStep("password");
      } else {
        setError("No company found for this email domain");
      }
    } catch (err) {
      setError("Failed to find company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call company-specific login endpoint
      const response = await fetch("/api/auth/company-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Redirect to dashboard
        setLocation("/");
      } else {
        const data = await response.json();
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          {/* Company Logo */}
          {companyInfo?.logo ? (
            <img
              src={companyInfo.logo}
              alt={companyInfo.name}
              className="h-12 w-auto mx-auto"
            />
          ) : (
            <div className="h-12 w-12 mx-auto bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          )}

          {step === "email" ? (
            <>
              <CardTitle>Welcome to SalesForce Tracker</CardTitle>
              <CardDescription>
                Enter your email to find your company
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle>{companyInfo?.name || "Company"}</CardTitle>
              <CardDescription>
                Enter your credentials to sign in
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finding company...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                We'll find your company based on your email domain
              </p>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError("");
                }}
              >
                Use Different Email
              </Button>

              <p className="text-xs text-center text-slate-500">
                Your data is secure and isolated to your company
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
