import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ArrowLeft, Loader2, Plus, UserPlus, Trash2, Shield, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface TeamMember {
  id: number;
  userId: string;
  role: string;
  joinedAt: string;
}

interface Team {
  id: number;
  name: string;
  ownerId: string;
  createdAt: string;
  memberCount?: number;
  members?: TeamMember[];
}

export default function Teams() {
  const [teamName, setTeamName] = useState("");
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams/my-teams"],
    enabled: isAuthenticated,
    select: (data: any) => data?.teams || data || [],
  });

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/teams/create", { name });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/teams/my-teams"] });
      setTeamName("");
      toast({ title: "Team Created", description: "Your new team workspace is ready." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ teamId, memberUserId, role }: { teamId: number; memberUserId: string; role: string }) => {
      const res = await apiRequest("POST", `/api/teams/${teamId}/invite`, { memberUserId, role });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/teams/my-teams"] });
      setInviteUserId("");
      setInviteRole("member");
      toast({ title: "Member Invited", description: "The user has been added to the team." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: number; userId: string }) => {
      await apiRequest("DELETE", `/api/teams/${teamId}/members/${userId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/teams/my-teams"] });
      toast({ title: "Member Removed", description: "The member has been removed from the team." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({ title: "Name Required", description: "Please enter a team name.", variant: "destructive" });
      return;
    }
    createMutation.mutate(teamName.trim());
  };

  const handleInvite = () => {
    if (!selectedTeamId) {
      toast({ title: "Select a Team", description: "Please select a team first.", variant: "destructive" });
      return;
    }
    if (!inviteUserId.trim()) {
      toast({ title: "User Required", description: "Please enter a user ID or email.", variant: "destructive" });
      return;
    }
    inviteMutation.mutate({ teamId: selectedTeamId, memberUserId: inviteUserId.trim(), role: inviteRole });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
          <Card className="bg-slate-900 border-white/10">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-bold mb-2" data-testid="text-login-prompt">Login Required</h3>
              <p className="text-slate-400 mb-6">Please log in to manage your teams.</p>
              <Link href="/login">
                <Button className="bg-lime-400 text-black" data-testid="button-login">Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-slate-400" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="bg-lime-500/10 p-3 rounded-2xl">
            <Users className="w-8 h-8 text-lime-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Team Workspaces</h1>
            <p className="text-slate-400">Create and manage team workspaces to collaborate on links.</p>
          </div>
        </div>

        <Card className="bg-slate-900 border-white/10 max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-lime-400" /> Create New Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="My Awesome Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="bg-black border-white/10"
                data-testid="input-team-name"
              />
            </div>
            <Button
              className="w-full bg-lime-400 text-black font-bold"
              onClick={handleCreateTeam}
              disabled={createMutation.isPending}
              data-testid="button-create-team"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {createMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold" data-testid="text-teams-heading">Your Teams</h2>
          {teamsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
            </div>
          ) : teams.length === 0 ? (
            <Card className="bg-slate-900 border-white/10">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400" data-testid="text-no-teams">You don't have any teams yet. Create one above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className={`bg-slate-900 border-white/10 cursor-pointer transition-colors ${selectedTeamId === team.id ? "border-lime-400/50" : ""}`}
                  onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)}
                  data-testid={`card-team-${team.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-lime-400/10 p-2 rounded-lg">
                          <Users className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <p className="font-bold" data-testid={`text-team-name-${team.id}`}>{team.name}</p>
                          <p className="text-xs text-slate-400">
                            {team.memberCount ?? team.members?.length ?? 0} member(s)
                            {team.ownerId === user?.id && (
                              <span className="ml-2 text-lime-400">Owner</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeamId(selectedTeamId === team.id ? null : team.id);
                        }}
                        data-testid={`button-expand-team-${team.id}`}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>

                    {selectedTeamId === team.id && (
                      <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-lime-400 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Invite Member
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            <Input
                              placeholder="User ID or email"
                              value={inviteUserId}
                              onChange={(e) => setInviteUserId(e.target.value)}
                              className="bg-black border-white/10 flex-1 min-w-[180px]"
                              data-testid="input-invite-user"
                            />
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger className="w-32 bg-black border-white/10" data-testid="select-invite-role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              className="bg-lime-400 text-black font-bold"
                              onClick={handleInvite}
                              disabled={inviteMutation.isPending}
                              data-testid="button-invite"
                            >
                              {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
                            </Button>
                          </div>
                        </div>

                        {team.members && team.members.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-slate-300">Members</h4>
                            <Table>
                              <TableHeader>
                                <TableRow className="border-white/10">
                                  <TableHead className="text-slate-400">User</TableHead>
                                  <TableHead className="text-slate-400">Role</TableHead>
                                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {team.members.map((member) => (
                                  <TableRow key={member.id} className="border-white/10" data-testid={`row-member-${member.id}`}>
                                    <TableCell className="font-mono text-sm" data-testid={`text-member-user-${member.id}`}>
                                      {member.userId}
                                    </TableCell>
                                    <TableCell>
                                      <span className="flex items-center gap-1 text-sm">
                                        {member.role === "admin" ? (
                                          <Crown className="w-3 h-3 text-yellow-400" />
                                        ) : (
                                          <Shield className="w-3 h-3 text-slate-400" />
                                        )}
                                        {member.role}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400"
                                        onClick={() => removeMutation.mutate({ teamId: team.id, userId: member.userId })}
                                        disabled={removeMutation.isPending}
                                        data-testid={`button-remove-member-${member.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
