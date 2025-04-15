"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { LogIn, User, Compass } from "lucide-react"

export default function NavBar() {
  const { user, loading } = useAuth()

  return (
    <nav className="absolute top-0 left-0 right-0 p-4 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-bold text-xl">
            Vibe Coding
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Compass className="h-4 w-4 mr-2" />
              Explore Ideas
            </Button>
          </Link>
        </div>
        <div>
          {!loading &&
            (user ? (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            ))}
        </div>
      </div>
    </nav>
  )
}
