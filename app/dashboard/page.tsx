import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import { RegistrationStatus } from "@/components/registration-status"
import { TeamManagement } from "@/components/team-management"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user has completed participant registration
  const { data: participant } = await supabase.from("participants").select("*").eq("id", data.user.id).single()

  // Check if user has a team
  const { data: teamMembership } = await supabase
    .from("team_members")
    .select(`
      *,
      teams (
        id,
        team_name,
        team_code,
        university,
        leader_id
      )
    `)
    .eq("participant_id", data.user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">ML</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HackML 2026</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">{data.user.email}</p>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h2>
            <p className="text-muted-foreground">Complete your registration and join a team for HackML 2026</p>
          </div>

          <RegistrationStatus participant={participant} />

          {participant && <TeamManagement userId={data.user.id} teamMembership={teamMembership} />}
        </div>
      </main>
    </div>
  )
}
