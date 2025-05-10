import ProfileForm from "@/components/profile/profile-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-800 to-amber-900 text-amber-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="bg-amber-700 hover:bg-amber-600 p-2 rounded-full mr-4 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold">Perfil do Jogador</h1>
        </div>

        <ProfileForm />
      </div>
    </div>
  )
}
