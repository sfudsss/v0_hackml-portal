"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, UserPlus } from "lucide-react"
import { ParticipantRegistrationForm } from "@/components/participant-registration-form"

interface RegistrationStatusProps {
  participant: any
}

export function RegistrationStatus({ participant }: RegistrationStatusProps) {
  if (participant) {
    return (
      <Card className="bg-card border-border mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <CardTitle className="text-foreground">Registration Complete</CardTitle>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            Your participant information has been saved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">
                {participant.first_name} {participant.last_name}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Student Number</p>
              <p className="font-medium text-foreground">{participant.student_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Major</p>
              <p className="font-medium text-foreground capitalize">{participant.major.replace("-", " ")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Year</p>
              <p className="font-medium text-foreground">{participant.year}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          <CardTitle className="text-foreground">Complete Your Registration</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Fill out your participant information to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ParticipantRegistrationForm />
      </CardContent>
    </Card>
  )
}
