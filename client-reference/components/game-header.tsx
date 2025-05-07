import Image from "next/image"

export default function GameHeader() {
  return (
    <div className="bg-amber-800 text-amber-100 p-4 border-b border-amber-900">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-32 h-auto self-stretch overflow-hidden">
          <Image
            src="/eko-fortune-teller.png"
            alt="EKO Avatar"
            width={128}
            height={128}
            className="object-cover h-full"
          />
        </div>
        <div className="flex-grow">
          <h1 className="text-xl font-medium mb-2">EKO:</h1>
          <div className="bg-amber-200 text-amber-900 p-3 rounded-md">
            <p className="text-sm leading-relaxed">
              Então, quer dizer que hoje você quer plantar 8 pés de abóbora no quadrante A4... certo. atualmente você
              conseguiria plantar 2 pés de abóbora neste quadrante. mas, pelo o que vejo, os quadrantes B5 e C3 são
              ambos ótimas escolhas, com espaço o suficiente para os 8 pés. deseja escolher algum destes quadrantes ou
              seguimos com apenas 2 pés de abóbora no A4?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
