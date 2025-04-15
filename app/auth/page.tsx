import AuthForm from "@/components/auth/auth-form"
import Link from "next/link"

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center mb-8">
        <Link href="/">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-cyan-300">
              Vibe Coding
            </span>
          </h1>
        </Link>
        <p className="text-white/70">Sign in to save and manage your app ideas</p>
      </div>
      <AuthForm />
    </main>
  )
}
