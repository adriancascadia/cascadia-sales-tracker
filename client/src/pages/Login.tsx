import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MapPin,
  Package,
  FileText,
  TrendingUp,
  Clock,
  Bell,
  BarChart3,
  Map,
  Image,
  Gauge,
  Brain,
  Smartphone,
} from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyId, setCompanyId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const utils = trpc.useUtils();

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
        localStorage.setItem("auth_token", result.token);

        // Invalida el cache de tRPC para que se refresque useAuth()

        await utils.auth.me.invalidate();
      }

      toast.success("Login successful!");

      // Redirige inmediatamente
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Registering with:", { name, email, password, companyId, role });

      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
        companyId,
        role,
      });

      console.log("Registration result:", result);
      toast.success("Registration successful! Please sign in.");
      setShowRegister(false);
      setEmail("");
      setPassword("");
      setName("");
      setRole("user");
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error message:", error.message);
      console.error("Error data:", error.data);
      toast.error(
        error.message || error.data?.message || "Registration failed"
      );
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Real-time GPS tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Check-in/Check-out logging</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Order management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Photo documentation</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">{APP_TITLE}</CardTitle>
          <CardDescription>
            {showRegister ? "Create a new account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={showRegister ? handleRegister : handleLogin}
            className="space-y-4"
          >
            {showRegister && (
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {showRegister && (
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={role} onValueChange={(val: "user" | "admin") => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Salesperson</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {showRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : showRegister ? (
                "Register"
              ) : (
                "Sign In"
              )}
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
