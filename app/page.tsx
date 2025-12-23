"use client"

import { useState } from "react"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Trophy, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast" // Import useToast hook

export default function HackMLPortal() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [activeTab, setActiveTab] = useState("register")
  const [teamCode, setTeamCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast() // Declare useToast hook

  const [individualData, setIndividualData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentNumber: "",
    major: "",
    year: "",
    howHeard: [] as string[],
    kaggleUsername: "",
    dietaryRestrictions: "",
    tshirtSize: "",
  })

  const [teamData, setTeamData] = useState({
    teamName: "",
    teamLeaderName: "",
    teamLeaderEmail: "",
    university: "",
  })

  const [joinData, setJoinData] = useState({
    name: "",
    email: "",
    code: "",
  })

  const handleIndividualRegistration = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Individual registration:", individualData)

    toast({
      title: "Registration Complete!",
      description: "You can now create or join a team.",
    })

    setIsRegistered(true)
  }

  const generateTeamCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
    return code
  }

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    const code = generateTeamCode()

    console.log("[v0] Creating team:", { ...teamData, code })

    toast({
      title: "Team Created!",
      description: `Your team "${teamData.teamName}" has been created. Share your team code with members.`,
    })

    setActiveTab("manage")
  }

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] Joining team:", joinData)

    toast({
      title: "Successfully Joined!",
      description: `You've joined the team. Check your email for details.`,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: "Copied!",
      description: "Team code copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareableLink = generatedCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${generatedCode}`
    : ""

  const toggleHowHeard = (value: string) => {
    setIndividualData((prev) => ({
      ...prev,
      howHeard: prev.howHeard.includes(value)
        ? prev.howHeard.filter((item) => item !== value)
        : [...prev.howHeard, value],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">ML</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HackML 2026</h1>
              <p className="text-xs text-muted-foreground">Team Registration Portal</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent text-accent-foreground">Registration Open</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground text-balance">Join HackML 2026</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
              The Data Science Student Society (DSSS) is excited to host HackML 2026 this January! Join us for a 12-hour
              model-building competition where students work in teams to solve problems through appropriate machine
              learning model applications.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-card border-border">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Calendar className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">January 31, 2026</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Clock className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold text-foreground">12 Hours</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Users className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="font-semibold text-foreground">1-4 Members</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Trophy className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-semibold text-foreground">Kaggle-based</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2 text-foreground">Sign Up</h4>
                <p className="text-sm text-muted-foreground">
                  Create an account and complete your participant registration
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2 text-foreground">Form a Team</h4>
                <p className="text-sm text-muted-foreground">Create or join a team using a team code (1-4 members)</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2 text-foreground">Compete</h4>
                <p className="text-sm text-muted-foreground">Build ML models and compete on January 31, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8 bg-card">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Hosted by the Data Science Student Society (DSSS) at SFU</p>
        </div>
      </footer>
    </div>
  )
}
