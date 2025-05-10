export default function CharacterIcon({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="50" cy="30" r="20" stroke="#5D4037" strokeWidth="2" fill="#F5E9D6" />

      {/* Eyes */}
      <circle cx="42" cy="28" r="2" fill="#5D4037" />
      <circle cx="58" cy="28" r="2" fill="#5D4037" />

      {/* Mouth */}
      <line x1="42" y1="38" x2="58" y2="38" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />

      {/* Body */}
      <rect x="35" y="50" width="30" height="40" stroke="#5D4037" strokeWidth="2" fill="#F5E9D6" rx="2" ry="2" />

      {/* Buttons */}
      <circle cx="42" cy="60" r="2" fill="#5D4037" />
      <circle cx="58" cy="60" r="2" fill="#5D4037" />
      <circle cx="42" cy="75" r="2" fill="#5D4037" />
      <circle cx="58" cy="75" r="2" fill="#5D4037" />

      {/* Shovel */}
      <line x1="70" y1="50" x2="70" y2="90" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
      <rect x="65" y="90" width="10" height="15" fill="#8D6E63" rx="2" ry="2" />
    </svg>
  )
}
