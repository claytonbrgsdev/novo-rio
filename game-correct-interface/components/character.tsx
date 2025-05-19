interface CharacterProps {
  size: "small" | "medium" | "micro"
  tool?: string
  headId?: number
  bodyId?: number
  customStyle?: string
}

export default function Character({ size, tool, headId = 1, bodyId = 1, customStyle = "" }: CharacterProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    micro: "w-6 h-6",
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center ${customStyle}`}>
      <div className="bg-amber-100 rounded-full w-full h-full flex flex-col items-center justify-center">
        {/* Cabeça - varia com headId */}
        <div
          className={`bg-green-800 w-1 h-1 rounded-full absolute -top-1 ${headId === 2 ? "left-1" : headId === 3 ? "right-1" : ""}`}
        ></div>

        {/* Corpo - varia com bodyId */}
        <div
          className={`bg-stone-800 w-1 h-1 rounded-full ${bodyId === 2 ? "scale-125" : bodyId === 3 ? "scale-75" : ""}`}
        ></div>

        {/* Ferramenta - se fornecida */}
        {tool && (
          <div
            className={`absolute ${size === "medium" ? "-right-2 top-2" : "-right-1 top-1"} w-1 h-3 bg-amber-800 rounded-full transform rotate-12`}
          ></div>
        )}
      </div>
    </div>
  )
}
