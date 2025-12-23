"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface TeamManagementProps {
  userId: string
  teamMembership: any
}

export function TeamManagement({ userId, teamMembership }: TeamManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("join")
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [createTeamData, setCreateTeamData] = useState({
    teamName: "",
    university: "",
  })

  const [joinTeamCode, setJoinTeamCode] = useState("")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "Team code copied to clipboard",
    })
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      // Generate team code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_team_code")

      if (codeError) throw codeError

      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          team_name: createTeamData.teamName,
          team_code: codeData,
          university: createTeamData.university,
          leader_id: userId,
        })
        .select()
        .single()

      if (teamError) throw teamError

      // Add creator as first team member
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: team.id,
        participant_id: userId,
      })

      if (memberError) throw memberError

      toast({
        title: "Team Created!",
        description: `Your team code is ${codeData}`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      // Find team by code
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("team_code", joinTeamCode.toUpperCase())
        .single()

      if (teamError || !team) {
        throw new Error("Team not found. Please check the code and try again.")
      }

      // Check team size
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", team.id)

      if (membersError) throw membersError

      if (members && members.length >= 4) {
        throw new Error("This team is full (maximum 4 members)")
      }

      // Join team
      const { error: joinError } = await supabase.from("team_members").insert({
        team_id: team.id,
        participant_id: userId,
      })

      if (joinError) throw joinError

      toast({
        title: "Success!",
        description: "You've joined the team",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join team",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (teamMembership) {
    const team = teamMembership.teams
    const isLeader = team.leader_id === userId
    const shareableLink = `${window.location.origin}/dashboard?code=${team.team_code}`

    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-foreground">{team.team_name}</CardTitle>
            </div>
            {isLeader && <Badge variant="secondary">Team Leader</Badge>}
          </div>
          <CardDescription className="text-muted-foreground">{team.university}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Team Code</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <code className="text-3xl font-bold font-mono tracking-wider text-foreground">{team.team_code}</code>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(team.team_code)}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Share this code with your team members</p>
          </div>

          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input value={shareableLink} readOnly className="font-mono text-sm" />
              <Button type="button" variant="secondary" onClick={() => copyToClipboard(shareableLink)}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Team Registration</CardTitle>
        <CardDescription className="text-muted-foreground">Create a new team or join an existing one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create">Create Team</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  placeholder="Neural Ninjas"
                  value={createTeamData.teamName}
                  onChange={(e) => setCreateTeamData({ ...createTeamData, teamName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University / Institution *</Label>
                <Input
                  id="university"
                  placeholder="Simon Fraser University"
                  value={createTeamData.university}
                  onChange={(e) => setCreateTeamData({ ...createTeamData, university: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="join">
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code *</Label>
                <Input
                  id="teamCode"
                  placeholder="ABC123"
                  value={joinTeamCode}
                  onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
                  required
                  className="font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">Enter the 6-character code shared by your team leader</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Joining..." : "Join Team"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
