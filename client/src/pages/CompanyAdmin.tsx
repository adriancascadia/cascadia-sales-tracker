import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Settings, Mail, Shield, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function CompanyAdmin() {
  const { user } = useAuth();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("user");

  // Get company info
  const { data: companyInfo } = trpc.company.getInfo.useQuery();
  const { data: teamMembers } = trpc.company.getTeamMembers.useQuery();

  // Add team member mutation
  const addMemberMutation = trpc.company.addTeamMember.useMutation({
    onSuccess: () => {
      toast.success("Team member added successfully");
      setNewMemberEmail("");
      setNewMemberRole("user");
      setIsAddMemberOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to add team member: " + error.message);
    },
  });

  // Remove team member mutation
  const removeMemberMutation = trpc.company.removeTeamMember.useMutation({
    onSuccess: () => {
      toast.success("Team member removed");
    },
    onError: (error) => {
      toast.error("Failed to remove team member: " + error.message);
    },
  });

  // Update team member role mutation
  const updateMemberRoleMutation = trpc.company.updateTeamMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) {
      toast.error("Please enter an email address");
      return;
    }
    addMemberMutation.mutate({
      email: newMemberEmail,
      role: newMemberRole as "user" | "admin",
    });
  };

  const handleRemoveMember = (memberId: number) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      removeMemberMutation.mutate({ memberId });
    }
  };

  const handleUpdateRole = (memberId: number, newRole: string) => {
    updateMemberRoleMutation.mutate({
      memberId,
      role: newRole as "user" | "admin",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Company Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your company settings and team members
          </p>
        </div>

        {/* Company Info Card */}
        {companyInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Company Name</label>
                <p className="text-lg font-semibold">{companyInfo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Company Domain</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {companyInfo.domain && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {companyInfo.domain}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Team Size</label>
                <p className="text-lg font-semibold">{teamMembers?.length || 0} members</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your sales team and their permissions
              </CardDescription>
            </div>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new team member to your company
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="team@company.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Sales Rep</SelectItem>
                        <SelectItem value="admin">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={addMemberMutation.isPending}>
                      {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {teamMembers && teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-700">
                          {member.name?.charAt(0) || member.email?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name || member.email}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(newRole) =>
                          handleUpdateRole(member.id, newRole)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Sales Rep</SelectItem>
                          <SelectItem value="admin">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                      {member.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No team members yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Data Isolation:</strong> Your company's data is completely isolated from other companies. Team members can only see data for your company.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Role-Based Access:</strong> Managers have full access to team analytics and settings. Sales reps can only view their own data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
