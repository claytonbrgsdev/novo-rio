export default function SunIcon({ className = "w-16 h-16 text-amber-700" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="50" y1="15" x2="50" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="75" x2="50" y2="85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="15" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="75" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="25" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="68" x2="75" y2="75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="75" x2="32" y2="68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="68" y1="32" x2="75" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
