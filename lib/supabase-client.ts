"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Save idea to user's personal collection
export async function saveIdeaToSupabase(idea: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase.from("app_ideas").insert([
      {
        idea_text: idea,
        created_at: new Date().toISOString(),
        user_id: userId,
      },
    ])

    if (error) throw error
  } catch (error) {
    console.error("Error saving to Supabase:", error)
    throw new Error("Failed to save idea")
  }
}

// Save idea to public collection (no user_id required)
export async function savePublicIdea(idea: string, userId?: string): Promise<void> {
  try {
    // Create the base object without user_id
    const ideaObject: any = {
      idea_text: idea,
      created_at: new Date().toISOString(),
    }

    // Only add user_id if it exists
    if (userId) {
      ideaObject.user_id = userId
    }

    const { error } = await supabase.from("public_ideas").insert([ideaObject])

    if (error) throw error
  } catch (error) {
    console.error("Error saving public idea:", error)
    throw new Error("Failed to save public idea")
  }
}

// Get user's personal ideas
export async function getIdeasFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from("app_ideas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching from Supabase:", error)
    throw new Error("Failed to fetch ideas")
  }
}

// Get all public ideas
export async function getPublicIdeas(limit = 50) {
  try {
    const { data, error } = await supabase
      .from("public_ideas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching public ideas:", error)
    throw new Error("Failed to fetch public ideas")
  }
}
