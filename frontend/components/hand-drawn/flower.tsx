export default function FlowerIcon({ className = "w-16 h-16 text-olive-700" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50,50 C55,40 65,35 75,40 C85,45 85,55 80,65 C75,75 65,80 55,75 C45,70 45,60 50,50 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M50,50 C45,40 35,35 25,40 C15,45 15,55 20,65 C25,75 35,80 45,75 C55,70 55,60 50,50 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M50,50 C60,45 70,35 65,25 C60,15 50,15 40,20 C30,25 25,35 30,45 C35,55 45,55 50,50 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M50,50 C40,45 30,35 35,25 C40,15 50,15 60,20 C70,25 75,35 70,45 C65,55 55,55 50,50 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="50" cy="50" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}
