import DashboardLayout from "@/components/DashboardLayout";
import AISalesCoach from "@/components/AISalesCoach";
import { useAuth } from "@/_core/hooks/useAuth";
import { Brain } from "lucide-react";

export default function SalesCoach() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <AISalesCoach />
    </DashboardLayout>
  );
}
