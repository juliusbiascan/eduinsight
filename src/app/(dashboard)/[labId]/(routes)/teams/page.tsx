"use client";

import { TeamButton } from "@/components/team/team-button";
import { currentUser } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

interface TeamUser {
  id: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  role: string;
  createdAt: string;
}

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const params = useParams();

  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoading(true);
        toast({
          title: "Loading team members",
          description: "Please wait while we fetch the team members...",
        });

        const response = await fetch(`/api/team/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ labId: params.labId }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to fetch team members");
        }

        const data = await response.json();
        setTeamUsers(data.members || []);
        
        toast({
          title: "Success",
          description: "Team members loaded successfully",
        });
      } catch (error) {
        console.error("Error fetching team members:", error);
        setTeamUsers([]); // Set empty array on error
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load team members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.labId) {
      fetchTeamMembers();
    }
  }, [params.labId, toast]);

  const getRoleBadgeStyles = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";
      case "MEMBER":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10";
      case "GUEST":
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20";
      default:
        return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20";
    }
  };

  const filteredUsers = teamUsers.filter(
    (teamUser) =>
      teamUser.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teamUser.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members and their roles.
              </CardDescription>
            </div>
            <TeamButton />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9121F]" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No team members found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((teamUser) => (
                  <TableRow 
                    key={teamUser.id}
                    className={teamUser.id === session?.user.id ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          {teamUser.user.image ? (
                            <img
                              className="aspect-square h-full w-full"
                              alt={teamUser.user.name}
                              src={teamUser.user.image}
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                              {teamUser.user.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {teamUser.user.name}
                            {teamUser.id === session?.user.id && (
                              <span className="ml-2 text-xs text-muted-foreground">(Me)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{teamUser.user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getRoleBadgeStyles(teamUser.role)}`}>
                        {teamUser.role.toLowerCase()}
                        {teamUser.id === session?.user.id && (
                          <span className="ml-1.5">(you)</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(teamUser.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}