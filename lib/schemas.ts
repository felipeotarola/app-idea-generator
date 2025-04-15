import { z } from "zod"

export const appIdeaSchema = z.object({
  appName: z.string().describe("A catchy, memorable name for the web app"),
  concept: z.string().describe("A one-sentence summary of what the web app does"),
  description: z.string().describe("A brief explanation of the web app's functionality (2-3 sentences)"),
  targetAudience: z.string().describe("Who would use this web app"),
  problemSolved: z.string().describe("What issue or need this web app addresses"),
  keyFeatures: z.array(z.string()).describe("3-4 specific features of the app"),
  suggestedTechnologies: z.array(z.string()).describe("3-5 specific technologies, libraries, or APIs"),
  aiPrompt: z.string().describe("A ready-to-use prompt for v0.dev or another AI tool"),
})

export type AppIdea = z.infer<typeof appIdeaSchema>
