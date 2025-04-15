"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { getIdeasFromSupabase } from "@/lib/supabase-client"
import NavBar from "@/components/nav-bar"

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

export default function SavedIdeas() {
  const { user, loading } = useAuth()
  const [ideas, setIdeas] = useState<any[]>([])
  const [loadingIdeas, setLoadingIdeas] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchIdeas = async () => {
      if (user) {
        try {
          const data = await getIdeasFromSupabase(user.id)
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 p-4">
      <NavBar />
      <div className="max-w-4xl mx-auto pt-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Your Saved App Ideas</h1>

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
                You haven't saved any app ideas yet. Go back to the generator to create and save some ideas!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
