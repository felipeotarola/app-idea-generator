"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { AppIdea } from "@/lib/schemas"

export async function generateAppIdea(): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Generate a creative, innovative, and specific web application idea.

I need a structured response in JSON format with the following fields:
{
  "appName": "Name of the app",
  "concept": "One-sentence summary",
  "description": "2-3 sentences explaining functionality",
  "targetAudience": "Who would use this app",
  "problemSolved": "What problem this solves",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "suggestedTechnologies": ["Technology 1", "Technology 2", "Technology 3"],
  "aiPrompt": "A prompt for v0.dev to generate the UI"
}

IMPORTANT GUIDELINES:
- Make sure the description is a single paragraph, not bullet points
- Each key feature should be a separate item in the array, not a long string with bullet points
- Each technology should be a separate item in the array
- Focus ONLY on web applications (no VR or AR apps)
- Make it sound exciting and viable for a weekend project
- Be creative and think outside the box - avoid generic ideas like todo lists or weather apps`,
      temperature: 0.9,
      maxTokens: 1000,
    })

    // Try to parse the JSON response
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text

      const parsedIdea = JSON.parse(jsonString)

      // Convert the structured data back to text format for saving
      const idea: AppIdea = {
        appName: parsedIdea.appName || "App Idea",
        concept: parsedIdea.concept || "",
        description: parsedIdea.description || "",
        targetAudience: parsedIdea.targetAudience || "",
        problemSolved: parsedIdea.problemSolved || "",
        keyFeatures: Array.isArray(parsedIdea.keyFeatures) ? parsedIdea.keyFeatures : [],
        suggestedTechnologies: Array.isArray(parsedIdea.suggestedTechnologies) ? parsedIdea.suggestedTechnologies : [],
        aiPrompt: parsedIdea.aiPrompt || "",
      }

      // Format key features as a list
      const formattedFeatures = idea.keyFeatures.map((feature) => `• ${feature}`).join("\n")

      // Format technologies as a list
      const formattedTechnologies = idea.suggestedTechnologies.map((tech) => `• ${tech}`).join("\n")

      // Convert to text format
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
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      // Return the raw text as fallback
      return text.trim()
    }
  } catch (error) {
    console.error("Error generating app idea:", error)
    throw new Error("Failed to generate app idea")
  }
}
