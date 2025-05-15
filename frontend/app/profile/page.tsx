import { PlayerProfileCard } from "@/components/player/profile-card"
import { PlayerSettingsCard } from "@/components/player/settings-card"
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
        
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {/* Componentes que usam os dados mockados do Supabase */}
          <div>
            <PlayerProfileCard />
          </div>
          
          <div>
            <PlayerSettingsCard />
          </div>
          
          {/* Componente antigo que já estava em uso */}
          <div className="mt-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Editar Perfil (Versão Antiga)</h2>
            <ProfileForm />
          </div>
        </div>
      </div>
    </div>
  )
}
