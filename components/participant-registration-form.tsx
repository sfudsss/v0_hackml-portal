"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function ParticipantRegistrationForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
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

  const toggleHowHeard = (option: string) => {
    setFormData({
      ...formData,
      howHeard: formData.howHeard.includes(option)
        ? formData.howHeard.filter((item) => item !== option)
        : [...formData.howHeard, option],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to register",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.from("participants").insert({
        id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        student_number: formData.studentNumber,
        major: formData.major,
        year: formData.year,
        how_heard: formData.howHeard,
        kaggle_username: formData.kaggleUsername,
        dietary_restrictions: formData.dietaryRestrictions,
        tshirt_size: formData.tshirtSize,
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Your registration has been completed",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="data8@sfu.ca"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">Preferred: @sfu.ca email</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentNumber">Student Number *</Label>
        <Input
          id="studentNumber"
          placeholder="300913643"
          value={formData.studentNumber}
          onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">9-digit number listed on your student ID</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="major">Major *</Label>
        <Select value={formData.major} onValueChange={(value) => setFormData({ ...formData, major: value })} required>
          <SelectTrigger id="major">
            <SelectValue placeholder="Select your major" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data-science">Data Science</SelectItem>
            <SelectItem value="computer-science">Computer Science</SelectItem>
            <SelectItem value="statistics">Statistics</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">What year are you in? *</Label>
        <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })} required>
          <SelectTrigger id="year">
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4+">4+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>How did you hear about this event? *</Label>
        <div className="space-y-2">
          {["Instagram", "Discord", "Email", "A friend", "Posters", "Other"].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.howHeard.includes(option)}
                onChange={() => toggleHowHeard(option)}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kaggleUsername">Kaggle Username *</Label>
        <Input
          id="kaggleUsername"
          placeholder="your_kaggle_username"
          value={formData.kaggleUsername}
          onChange={(e) => setFormData({ ...formData, kaggleUsername: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">
          If you haven't already, please create a free Kaggle account at{" "}
          <a
            href="https://www.kaggle.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            kaggle.com
          </a>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dietaryRestrictions">Do you have any dietary restrictions? *</Label>
        <Textarea
          id="dietaryRestrictions"
          placeholder="e.g., Vegetarian, Vegan, Gluten-free, Nut allergy, None"
          value={formData.dietaryRestrictions}
          onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
          required
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tshirtSize">T-shirt Size *</Label>
        <Select
          value={formData.tshirtSize}
          onValueChange={(value) => setFormData({ ...formData, tshirtSize: value })}
          required
        >
          <SelectTrigger id="tshirtSize">
            <SelectValue placeholder="Select your size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">XS</SelectItem>
            <SelectItem value="s">S</SelectItem>
            <SelectItem value="m">M</SelectItem>
            <SelectItem value="l">L</SelectItem>
            <SelectItem value="xl">XL</SelectItem>
            <SelectItem value="2xl">2XL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Registration"}
      </Button>
    </form>
  )
}
