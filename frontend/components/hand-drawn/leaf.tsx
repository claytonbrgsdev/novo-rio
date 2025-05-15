export default function LeafIcon({ className = "w-16 h-16 text-olive-700" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.5,20.5 C40.5,10.5 60.5,15.5 70.5,30.5 C80.5,45.5 75.5,70.5 60.5,80.5 C45.5,90.5 20.5,85.5 10.5,70.5 C0.5,55.5 5.5,30.5 20.5,20.5 C35.5,10.5 60.5,15.5 70.5,30.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="1 3"
      />
      <path d="M40,30 C50,40 60,50 70,60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M35,45 C45,50 55,55 65,60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
