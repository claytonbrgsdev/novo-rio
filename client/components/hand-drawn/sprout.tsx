export default function SproutIcon({ className = "w-16 h-16 text-olive-700" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30,80 C30,60 40,50 50,40 C60,30 70,20 80,30 C90,40 80,50 70,55 C60,60 50,60 50,70"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M50,70 C50,60 40,60 30,55 C20,50 10,40 20,30 C30,20 40,30 50,40"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="50" y1="70" x2="50" y2="90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
