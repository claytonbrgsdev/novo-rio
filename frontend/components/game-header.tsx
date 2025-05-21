import { Save, FolderOpen, Home } from 'lucide-react';

interface GameHeaderProps {
  onSave?: () => void;
  onLoad?: () => void;
  onHome?: () => void;
  message?: string;
}

export default function GameHeader({ 
  onSave, 
  onLoad, 
  onHome,
  message = "Então, quer dizer que hoje você quer plantar 8 pés de abóbora no quadrante A4... certo, atualmente você conseguiria plantar 2 pés de abóbora neste quadrante, mas, pelo o que vejo, os quadrantes B5 e C3 são ambos ótimas escolhas."
}: GameHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-olive-800 to-olive-700 text-olive-100 p-3 border-b-2 border-olive-900 font-handwritten relative shadow-md">
      {/* Action buttons - only render if handlers are provided */}
      {(onSave || onLoad || onHome) && (
        <div className="absolute right-3 top-3 flex space-x-3 z-10">
          {onSave && (
            <button
              onClick={onSave}
              title="Salvar Jogo"
              className="bg-olive-600 hover:bg-olive-500 text-white px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow border border-olive-500"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar</span>
            </button>
          )}
          {onLoad && (
            <button
              onClick={onLoad}
              title="Carregar Jogo"
              className="bg-olive-600 hover:bg-olive-500 text-white px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow border border-olive-500"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Carregar</span>
            </button>
          )}
          {onHome && (
            <button
              onClick={onHome}
              title="Menu Principal"
              className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow border border-amber-500"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
          )}
        </div>
      )}
      
      <div className="flex items-stretch gap-3 max-w-5xl">
        <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-full border-2 border-amber-400 shadow-md hover:scale-105 transition-transform duration-200">
          <img 
            src="/eko-avatar.png" 
            alt="EKO" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-grow flex flex-col">
          <div className="bg-olive-700/50 text-white p-3 rounded-lg shadow-inner flex-grow relative">
            <div className="absolute -left-2 top-1/3 transform w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-olive-700/50"></div>
            <p className="text-md leading-relaxed">
              <span className="font-bold text-amber-300">EKO:</span> {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
