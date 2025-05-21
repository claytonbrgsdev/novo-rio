import Image from "next/image"

export default function GameHeader() {
  return (
    <div className="bg-olive-800 text-olive-100 p-2 border-b-2 border-olive-900 font-handwritten">
      <div className="flex items-stretch gap-2">
        <div className="flex-shrink-0 w-24 h-auto self-stretch overflow-hidden">
          <Image
            src="/eko-fortune-teller.png"
            alt="EKO Avatar"
            width={96}
            height={96}
            className="object-cover h-full rounded-md border-2 border-olive-600"
          />
        </div>
        <div className="flex-grow flex flex-col">
          <div className="bg-paper-200 text-olive-900 p-3 rounded-md shadow-inner border-2 border-olive-600 flex-grow">
            <p className="text-lg leading-relaxed">
              <span className="font-bold">EKO:</span> Então, quer dizer que hoje você quer plantar 8 pés de abóbora no
              quadrante A4... certo. atualmente você conseguiria plantar 2 pés de abóbora neste quadrante. mas, pelo o
              que vejo, os quadrantes B5 e C3 são ambos ótimas escolhas, com espaço o suficiente para os 8 pés. deseja
              escolher algum destes quadrantes ou seguimos com apenas 2 pés de abóbora no A4?
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
