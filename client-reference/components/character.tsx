interface CharacterProps {
  size: "small" | "medium" | "micro"
  tool?: string
}

export default function Character({ size, tool }: CharacterProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    micro: "w-6 h-6",
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <div className="bg-amber-100 rounded-full w-full h-full flex flex-col items-center justify-center">
        <div className="bg-green-800 w-1 h-1 rounded-full absolute -top-1"></div>
        <div className="bg-stone-800 w-1 h-1 rounded-full"></div>
      </div>
    </div>
  )
}
