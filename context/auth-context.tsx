"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in fetchProfile:", error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true)
        console.log("Getting initial session...")

        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Initial session:", session ? "Found" : "Not found")

        if (session?.user) {
          console.log("User found in session:", session.user.email)
          setUser(session.user)

          // Fetch user profile
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          console.log("No user in session")
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")

      if (session?.user) {
        console.log("User in auth change:", session.user.email)
        setUser(session.user)

        // Fetch user profile
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else {
        console.log("No user in auth change")
        setUser(null)
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      // Use direct navigation for more reliable redirect
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>
}
