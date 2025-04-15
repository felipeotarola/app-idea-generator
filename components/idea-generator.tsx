"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Save, RefreshCw, ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveIdeaToSupabase, savePublicIdea } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import type { AppIdea } from "@/lib/schemas"

export default function IdeaGenerator() {
  const [idea, setIdea] = useState<AppIdea | null>(null)
  const [rawText, setRawText] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Convert structured idea to text format for saving to database
  const convertIdeaToText = (idea: AppIdea): string => {
    if (!idea) return ""

    // Format key features as a list
    const formattedFeatures = idea.keyFeatures.map((feature) => `• ${feature}`).join("\n")

    // Format technologies as a list
    const formattedTechnologies = idea.suggestedTechnologies.map((tech) => `• ${tech}`).join("\n")

    return `App Name: ${idea.appName}

Concept: ${idea.concept}

Description: ${idea.description}

Target Audience: ${idea.targetAudience}

Problem Solved: ${idea.problemSolved}

Key Features:
${formattedFeatures}

Suggested Technologies:
${formattedTechnologies}

AI Prompt:
${idea.aiPrompt}
`
  }

  // Handle copy prompt function
  const handleCopyPrompt = () => {
    if (!idea?.aiPrompt) return

    navigator.clipboard.writeText(idea.aiPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateIdea = async () => {
    console.log("🚀 Starting idea generation")
    setIsGenerating(true)
    setError(null)

    try {
      console.log("🔍 Fetching from /api/generate-idea")
      // Add a cache-busting query parameter
      const response = await fetch(`/api/generate-idea?t=${Date.now()}`)
      console.log("✅ Response received:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API error:", errorText)
        throw new Error(`API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Data parsed successfully")

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.rawText) {
        // Handle case where we got raw text instead of structured data
        console.log("⚠️ Received raw text instead of structured data")
        setRawText(data.rawText)
        setIdea(null)
      } else if (data.idea) {
        console.log("✅ Received structured idea data")
        setIdea(data.idea)
        setRawText(null)

        // Only save to public collection if user is logged in
        if (user) {
          try {
            console.log("🔍 Saving idea to public collection")
            await savePublicIdea(convertIdeaToText(data.idea), user.id)
            console.log("✅ Saved to public collection")
          } catch (error) {
            console.error("❌ Error saving to public collection:", error)
          }
        }
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("❌ Error generating idea:", error)
      setError(error instanceof Error ? error.message : "Failed to generate idea")
      toast({
        title: "Error",
        description: "Failed to generate idea. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveIdea = async () => {
    if (!idea && !rawText) return

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save ideas to your collection",
      })
      window.location.href = "/auth"
      return
    }

    setIsSaving(true)
    try {
      console.log("🔍 Saving idea to Supabase")
      const textToSave = idea ? convertIdeaToText(idea) : rawText!
      await saveIdeaToSupabase(textToSave, user.id)
      console.log("✅ Idea saved successfully")
      toast({
        title: "Success!",
        description: "Your idea has been saved to your personal collection.",
      })
    } catch (error) {
      console.error("❌ Error saving idea:", error)
      toast({
        title: "Error",
        description: "Failed to save idea. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Render the structured idea
  const renderStructuredIdea = (idea: AppIdea) => {
    return (
      <>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300 mb-6">
          {idea.appName}
        </h3>

        <div className="mb-4">
          <h4 className="text-pink-300 font-semibold mb-1">Concept</h4>
          <p className="text-white">{idea.concept}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-pink-300 font-semibold mb-1">Description</h4>
          <p className="text-white">{idea.description}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-pink-300 font-semibold mb-1">Target Audience</h4>
          <p className="text-white">{idea.targetAudience}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-pink-300 font-semibold mb-1">Problem Solved</h4>
          <p className="text-white">{idea.problemSolved}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-pink-300 font-semibold mb-1">Key Features</h4>
          <ul className="list-disc pl-5 space-y-1 text-white">
            {idea.keyFeatures.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="text-pink-300 font-semibold mb-1">Suggested Technologies</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {idea.suggestedTechnologies.map((tech, index) => (
              <span key={index} className="bg-purple-500/20 px-2 py-1 rounded text-sm font-mono text-white">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-pink-300 font-semibold">AI Prompt</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-white/70 hover:text-white hover:bg-purple-500/20"
              onClick={handleCopyPrompt}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>
          <pre className="bg-black/40 p-3 rounded-md border border-purple-500/20 font-mono text-sm text-white/90 whitespace-pre-wrap overflow-auto">
            <code>{idea.aiPrompt}</code>
          </pre>
        </div>
      </>
    )
  }

  // Render raw text as fallback
  const renderRawText = (text: string) => {
    // Split the idea into sections based on numbered format or line breaks
    const sections = text.split(/\d+\.\s+|\n\n/g).filter(Boolean)

    // Extract app name if it exists (usually the first section after "App Name:")
    const appNameMatch = text.match(/App Name:?\s*([^\n]+)/i)
    const appName = appNameMatch ? appNameMatch[1].trim() : "New App Idea"

    return (
      <>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-cyan-300 mb-6">
          {appName}
        </h3>

        {sections.map((section, index) => {
          // Check if this section has a label (like "Concept:", "Description:", etc.)
          const labelMatch = section.match(/^([^:]+):\s*(.+)$/s)

          if (labelMatch) {
            const [, label, content] = labelMatch
            return (
              <div key={index} className="mb-4">
                <h4 className="text-pink-300 font-semibold mb-1">{label}</h4>
                <div className="text-white">
                  {content.includes("•") || content.includes("-") ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {content
                        .split(/•|-/)
                        .filter(Boolean)
                        .map((item, i) => (
                          <li key={i}>{item.trim()}</li>
                        ))}
                    </ul>
                  ) : (
                    <p>{content.trim()}</p>
                  )}
                </div>
              </div>
            )
          }

          // If no label, just render as paragraph
          return (
            <p key={index} className="text-white mb-4">
              {section.trim()}
            </p>
          )
        })}
      </>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="bg-black/30 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          {idea || rawText ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-5 rounded-lg border border-white/10">
                {idea ? renderStructuredIdea(idea) : renderRawText(rawText!)}
              </div>
              <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={handleSaveIdea}
                    disabled={isSaving}
                  >
                    {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {user ? "Save to My Collection" : "Sign in to Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={handleGenerateIdea}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Another"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              {error && (
                <div className="bg-red-500/20 p-4 rounded-md mb-6 text-white">
                  <p>Error generating idea: {error}. Please try again.</p>
                </div>
              )}
              <p className="text-white/70 text-center mb-6">
                Click the button below to generate a random app idea using AI
              </p>
              <Button
                size="lg"
                onClick={handleGenerateIdea}
                disabled={isGenerating}
                className={cn(
                  "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white",
                  isGenerating && "animate-pulse",
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate App Idea
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(idea || rawText) && (
        <div className="flex justify-center">
          <Button
            variant="link"
            className="text-white/70 hover:text-white"
            onClick={handleGenerateIdea}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate New Idea
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
