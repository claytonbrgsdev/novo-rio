"use client"

import type { ReactNode } from "react"

interface HandDrawnButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary" | "accent" | "disabled"
}

export default function HandDrawnButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
}: HandDrawnButtonProps) {
  const getVariantClasses = () => {
    if (disabled) return "bg-gray-300 text-gray-600 cursor-not-allowed"

    switch (variant) {
      case "primary":
        return "bg-olive-200 text-olive-900 hover:bg-olive-300"
      case "secondary":
        return "bg-amber-200 text-amber-900 hover:bg-amber-300"
      case "accent":
        return "bg-red-200 text-red-900 hover:bg-red-300"
      default:
        return "bg-olive-200 text-olive-900 hover:bg-olive-300"
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        hand-drawn-button
        py-3 px-6 
        rounded-md 
        font-medium 
        text-lg
        transition-all
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
