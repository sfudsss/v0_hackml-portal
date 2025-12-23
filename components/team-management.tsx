"use client"

import type React from "react"

import { useEffect, useState } from "react"
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

type RosterRow = {
  joined_at: string | null
  participant: {
    id: string
    first_name: string | null
    last_name: string | null
    discord_username: string | null
  } | null
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

  // NEW: roster state
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [rosterLoading, setRosterLoading] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "Team code copied to clipboard",
    })
  }

  // NEW: load roster when user has a team
  useEffect(() => {
    const loadRoster = async () => {
      const teamId = teamMembership?.teams?.id
      if (!teamId) return

      setRosterLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("team_members")
        .select(
          `
          joined_at,
          participant:participants (
            id,
            first_name,
            last_name,
            discord_username
          )
        `
        )
        .eq("team_id", teamId)
        .order("joined_at", { ascending: true })

      if (error) {
        // Don't block UI; show a toast once and keep going
        toast({
          title: "Could not load team members",
          description: error.message,
          variant: "destructive",
        })
      } else if (data) {
        setRoster(data as any)
      }

      setRosterLoading(false)
    }

    loadRoster()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamMembership?.teams?.id])

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

          {/* NEW: Team Members list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Team Members</Label>
              <span className="text-xs text-muted-foreground">{roster.length}/4</span>
            </div>

            <div className="space-y-2">
              {rosterLoading ? (
                <div className="text-sm text-muted-foreground">Loading members…</div>
              ) : roster.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No members found. (If you know members exist, this is likely an RLS policy issue.)
                </div>
              ) : (
                roster.map((m) => {
                  const p = m.participant
                  const isMe = p?.id === userId
                  const fullName = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Unnamed participant"

                  return (
                    <div
                      key={p?.id ?? `${m.joined_at}-${Math.random()}`}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <span>{fullName}</span>
                          {isMe && <Badge variant="secondary">You</Badge>}
                          {p?.id === team.leader_id && <Badge variant="outline">Leader</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">Discord: {p?.discord_username ?? "—"}</div>
                      </div>
                    </div>
                  )
                })
              )}
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
          <TabsList cl
