import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const result = await loginMutation.mutateAsync({
      email,
      password,
      companyId,
    });
    
    // Guardar el token en localStorage
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      // Espera un poco para que se guarde el token
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    toast.success("Login successful!");
    // Redirige al dashboard
    setLocation("/");
  } catch (error: any) {
    toast.error(error.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
};



  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    console.log("Registering with:", { name, email, password, companyId });
    
    const result = await registerMutation.mutateAsync({
      name,
      email,
      password,
      companyId,
    });
    
    console.log("Registration result:", result);
    toast.success("Registration successful! Please sign in.");
    setShowRegister(false);
    setEmail("");
    setPassword("");
    setName("");
  } catch (error: any) {
    console.error("Registration error:", error);
    console.error("Error message:", error.message);
    console.error("Error data:", error.data);
    toast.error(error.message || error.data?.message || "Registration failed");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-12" />}
          </div>
          <CardTitle className="text-3xl font-bold">{APP_TITLE}</CardTitle>
          <CardDescription>
            {showRegister ? "Create a new account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
            {showRegister && (
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {showRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : showRegister ? "Register" : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {showRegister ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-blue-600 hover:underline"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
