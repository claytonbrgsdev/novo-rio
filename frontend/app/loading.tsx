export default function Loading() {
  return (
    <div className="flex flex-col h-screen bg-amber-50 text-stone-800 overflow-hidden items-center justify-center">
      <div className="w-24 h-24 border-t-4 border-amber-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-amber-800 font-medium">Carregando Novo Rio...</p>
    </div>
  )
}
