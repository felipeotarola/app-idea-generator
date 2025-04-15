import IdeaGenerator from "@/components/idea-generator"
import NavBar from "@/components/nav-bar"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 flex flex-col items-center justify-center p-4">
      <NavBar />
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-cyan-300">Vibe Coding</span>
        </h1>
        <h2 className="text-xl md:text-2xl text-center text-white/80 mb-6">
          Generate simple web app ideas you can build with AI assistance ✨
        </h2>
        <p className="text-center text-white/60 mb-12">
          Get ideas with ready-to-use AI prompts you can copy directly to v0.dev.{" "}
          <Link href="/explore" className="text-pink-300 hover:underline">
            Explore ideas
          </Link>{" "}
          or sign in to save your favorites.
        </p>
        <IdeaGenerator />
      </div>
      <Toaster />
    </main>
  )
}
