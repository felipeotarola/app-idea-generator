import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export const maxDuration = 60 // Increase timeout to 60 seconds

export async function GET() {
  try {
    console.log("🔍 API route called: /api/generate-idea")

    // Make sure we have the OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key is missing")
      return Response.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    console.log("✅ OpenAI API key is configured")
    console.log("🚀 Starting generateText call with model: gpt-4o")

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

    console.log("✅ generateText call completed successfully")

    // Try to parse the response as JSON
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text

      const parsedIdea = JSON.parse(jsonString)
      console.log("✅ Successfully parsed JSON response")

      // Ensure all expected fields are present
      const idea = {
        appName: parsedIdea.appName || "App Idea",
        concept: parsedIdea.concept || "",
        description: parsedIdea.description || "",
        targetAudience: parsedIdea.targetAudience || "",
        problemSolved: parsedIdea.problemSolved || "",
        keyFeatures: Array.isArray(parsedIdea.keyFeatures) ? parsedIdea.keyFeatures : [],
        suggestedTechnologies: Array.isArray(parsedIdea.suggestedTechnologies) ? parsedIdea.suggestedTechnologies : [],
        aiPrompt: parsedIdea.aiPrompt || "",
      }

      return Response.json({ idea })
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError)
      console.log("Raw text response:", text)

      // Fall back to returning the raw text
      return Response.json({
        rawText: text,
        error: "Failed to parse structured response",
      })
    }
  } catch (error) {
    console.error("❌ Error in generate-idea route:", error)
    return Response.json({ error: "Failed to generate idea" }, { status: 500 })
  }
}
