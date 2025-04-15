"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIdeasFromSupabase } from "@/lib/supabase-client"
import Link from "next/link"
import { Loader2, LogOut, Plus } from "lucide-react"

// Helper function to format idea text
function formatSavedIdea(ideaText: string) {
  // Extract app name if it exists
  const appNameMatch = ideaText.match(/App Name:?\s*([^\n]+)/i)
  const appName = appNameMatch ? appNameMatch[1].trim() : "App Idea"

  // Format the content
  const formattedContent = ideaText
    .split(/\n+/)
    .map((line, index) => {
      // Check if line has a label
      const labelMatch = line.match(/^([^:]+):\s*(.+)$/)

      if (labelMatch && index > 0) {
        // Skip the app name for labels
        const [, label, content] = labelMatch
        return (
          <div key={index} className="mb-3">
            <h4 className="text-pink-300 font-semibold">{label}</h4>
            <p>{content.trim()}</p>
          </div>
        )
      }

      // If no label and not app name, just render as paragraph
      if (index > 0 || !appNameMatch) {
        return (
          <p key={index} className="mb-2">
            {line}
          </p>
        )
      }

      return null
    })
    .filter(Boolean)

  return { appName, formattedContent }
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth()
  const [ideas, setIdeas] = useState<any[]>([])
  const [loadingIdeas, setLoadingIdeas] = useState(true)

  useEffect(() => {
    // Add a small delay to ensure auth state is checked
    const redirectTimer = setTimeout(() => {
      if (!loading && !user) {
        console.log("No user found, redirecting to auth page")
        window.location.href = "/auth"
      }
    }, 1000)

    return () => clearTimeout(redirectTimer)
  }, [user, loading])

  useEffect(() => {
    const fetchIdeas = async () => {
      if (user) {
        try {
          console.log("Fetching ideas for user:", user.id)
          const data = await getIdeasFromSupabase(user.id)
          console.log("Ideas fetched:", data?.length || 0)
          setIdeas(data || [])
        } catch (error) {
          console.error("Error fetching ideas:", error)
        } finally {
          setLoadingIdeas(false)
        }
      }
    }

    if (user) {
      fetchIdeas()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please sign in to access your dashboard</p>
          <Button
            onClick={() => {
              window.location.href = "/auth"
            }}
          >
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Your Dashboard</h1>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Card className="bg-black/30 border-purple-500/30 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Welcome, {profile?.name || profile?.username || user.email?.split("@")[0] || "User"}!
                </h2>
                <p className="text-white/70">Generate and save your app ideas</p>
              </div>
              <Link href="/" className="mt-4 md:mt-0">
                <Button className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Idea
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-white mb-4">Your Saved Ideas</h2>

        {loadingIdeas ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : ideas.length > 0 ? (
          <div className="grid gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="bg-black/30 border-purple-500/30 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white text-lg">{formatSavedIdea(idea.idea_text).appName}</CardTitle>
                    <span className="text-xs text-white/60">{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-white/90 space-y-1">{formatSavedIdea(idea.idea_text).formattedContent}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-black/30 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-white/70 text-center py-8">
                You haven't saved any app ideas yet. Go to the generator to create and save some ideas!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
