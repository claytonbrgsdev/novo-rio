"use client"
import * as React from 'react'
import { Coins, Zap } from "lucide-react"
import { usePlayer } from "@/hooks/usePlayer"
import { cn } from "@/lib/utils"

export type CharacterSize = 'small' | 'medium' | 'large'
export type ToolId = 'shovel' | 'sickle' | 'machete' | 'watering_can'
type CharacterPart = 'base' | 'body' | 'head' | 'tool'

interface CharacterDisplayProps {
  size?: CharacterSize
  showName?: boolean
  showTool?: boolean
  headId?: number
  bodyId?: number
  toolId?: ToolId
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  createNewCharacter?: () => void
  isQuadrantExpanded?: boolean
}

// Character assets configuration
const CHARACTER_ASSETS = {
  baseBodyUrl: '/characters/base.png',
  dimensions: {
    small: { w: 100, h: 140 },
    medium: { w: 150, h: 200 },
    large: { w: 200, h: 280 },
  },
  // We'll add other assets as we implement them
}

export function CharacterDisplay({
  size = 'medium',
  showName = false,
  showTool = true,
  headId = 1,
  bodyId = 1,
  toolId = 'shovel',
  className = '',
  onLoad,
  onError,
  createNewCharacter,
  isQuadrantExpanded = false,
}: CharacterDisplayProps) {
  // All hooks must be called unconditionally at the top level
  const [loadedParts, setLoadedParts] = React.useState<Set<CharacterPart>>(new Set())
  const [error, setError] = React.useState<Error | null>(null)
  const { player } = usePlayer()
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleImageLoad = React.useCallback((part: CharacterPart, url: string) => {
    console.log(`[CharacterDisplay] Loaded ${part} image:`, url)
    setLoadedParts(prev => {
      const next = new Set(prev)
      next.add(part)
      return next
    })
    setError(null)

    // Notify parent when all parts are loaded
    if (part === 'base' && onLoad) {
      onLoad()
    }
  }, [onLoad])


  // Handle image loading errors
  const handleImageError = React.useCallback((error: Error, type: string, url: string) => {
    console.error(`[CharacterDisplay] Error loading ${type} image:`, error)
    setError(error)
    onError?.(error)
  }, [onError])

  // Container dimensions based on size with responsive adjustments
  const getContainerStyles = () => {
    if (isQuadrantExpanded) {
      return {
        small: 'w-full max-w-[60px] aspect-[5/7]',  // Slightly larger for better visibility
        medium: 'w-full max-w-[90px] aspect-[3/4]',  // Adjusted for better proportions
        large: 'w-full h-full max-h-[35vh] aspect-[5/7]', // Increased max height for better visibility
      };
    }

    return {
      small: 'w-full max-w-[100px] aspect-[5/7]',  // Default small size
      medium: 'w-full max-w-[150px] aspect-[3/4]', // Default medium size
      large: 'w-full h-full max-h-[60vh] aspect-[5/7]', // Default large size
    };
  };

  // Base body layer
  const baseBody = React.useMemo(() => {
    const { baseBodyUrl } = CHARACTER_ASSETS
    return (
      <div
        className="absolute inset-0 w-full h-full flex items-end justify-center"
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          padding: '0',
          boxSizing: 'border-box',
          zIndex: 1
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center" style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformOrigin: 'center bottom',
          transform: 'scale(1)',
          transition: 'transform 0.3s ease-in-out'
        }}>
          <img
            key="base"
            src={baseBodyUrl}
            alt="Character base"
            className="h-full w-auto mx-auto"
            style={{
              objectFit: 'contain',
              objectPosition: 'center bottom',
              display: 'block',
              height: '100%',
              width: 'auto',
              maxWidth: '100%',
              position: 'relative'
            }}
            onLoad={() => handleImageLoad('base', baseBodyUrl)}
            onError={(e) => handleImageError(
              new Error(`Failed to load base body image`),
              'base body',
              baseBodyUrl
            )}
          />
        </div>
      </div>
    )
  }, [handleImageLoad, handleImageError])

  // Body layer
  const body = React.useMemo(() => {
    if (!bodyId) return <div className="hidden" />
    const bodyUrl = `/characters/body/${bodyId}.png`

    return (
      <div
        className="absolute inset-0 w-full h-full flex items-end justify-center"
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          padding: '0',
          boxSizing: 'border-box',
          zIndex: 2
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center" style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformOrigin: 'center bottom',
          transform: 'scale(1) translateY(0)'
        }}>
          <img
            key={`body-${bodyId}`}
            src={bodyUrl}
            alt={`Character body ${bodyId}`}
            className="h-full w-auto mx-auto"
            style={{
              objectFit: 'contain',
              objectPosition: 'center bottom',
              display: 'block',
              height: '100%',
              width: 'auto',
              maxWidth: '100%',
              position: 'relative'
            }}
            onLoad={() => handleImageLoad('body', bodyUrl)}
            onError={(e) => handleImageError(
              new Error(`Failed to load body image ${bodyId}`),
              'body',
              bodyUrl
            )}
          />
        </div>
      </div>
    )
  }, [bodyId, handleImageLoad, handleImageError])

  // Head layer
  const head = React.useMemo(() => {
    if (!headId) return <div className="hidden" />
    const headUrl = `/characters/head/${headId}.png`
    
    // Head size and position adjustments - minimal size
    const headStyles = {
      small: { scale: 'scale(0.2)', y: '-38%' },
      medium: { scale: 'scale(0.25)', y: '-36%' },
      large: { scale: 'scale(0.3)', y: '-34%' }
    }[size] || { scale: 'scale(0.25)', y: '-36%' }

    return (
      <div
        className="absolute inset-0 w-full h-full flex items-start justify-center"
        style={{
          zIndex: 30,
          overflow: 'hidden',
          padding: 0,
          boxSizing: 'border-box',
          pointerEvents: 'none',
          opacity: loadedParts.has('head') ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          paddingTop: 'calc(5% + 5px)',
        }}
      >
        <div style={{
          position: 'relative',
          width: '25%', // Minimal width for the head
          height: 'auto',
          transform: `${headStyles.scale} ${headStyles.y}`,
          transformOrigin: 'top center',
          zIndex: 30
        }}>
          <img
            key={`head-${headId}`}
            src={headUrl}
            alt={`Character head ${headId}`}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              objectPosition: 'center top',
              animation: 'float 3s ease-in-out infinite'
            }}
            onLoad={() => handleImageLoad('head', headUrl)}
            onError={(e) => handleImageError(
              new Error(`Failed to load head image ${headId}`),
              'head',
              headUrl
            )}
          />
        </div>
      </div>
    )
  }, [headId, size, loadedParts, handleImageLoad, handleImageError])

  // Tool layer
  const tool = React.useMemo(() => {
    if (!showTool || !toolId) return <div className="hidden" />
    const toolUrl = `/characters/tool/${toolId}.png`

    return (
      <div
        className="absolute inset-0 w-full h-full flex items-end justify-center"
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          padding: '0',
          boxSizing: 'border-box',
          zIndex: 4
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center" style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformOrigin: 'center bottom',
          transform: 'scale(1)'
        }}>
          <img
            key={`tool-${toolId}`}
            src={toolUrl}
            alt={`Tool ${toolId}`}
            className="h-full w-auto mx-auto"
            style={{
              objectFit: 'contain',
              objectPosition: 'center bottom',
              display: 'block',
              height: '100%',
              width: 'auto',
              maxWidth: '100%',
              position: 'relative',
              transform: 'rotate(-10deg) translateX(10%)',
              transformOrigin: 'bottom center'
            }}
            onLoad={() => handleImageLoad('tool', toolUrl)}
            onError={(e) => handleImageError(
              new Error(`Failed to load tool image ${toolId}`),
              'tool',
              toolUrl
            )}
          />
        </div>
      </div>
    )
  }, [toolId, showTool, handleImageLoad, handleImageError])

  // Aura effect
  const auraEffect = React.useMemo(() => {
    if (player?.aura === undefined) return <div className="hidden" />

    return (
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(168,85,247,0) 70%)',
          zIndex: 0,
          transform: 'scale(1.1)',
          transition: 'all 0.3s ease-in-out',
          opacity: 1
        }}
      />
    )
  }, [player?.aura])

  // Stats overlay with balance and aura - Only show in character panel
  const statsOverlay = React.useMemo(() => {
    // Only show indicators in the character panel (when isQuadrantExpanded is false)
    const isCharacterPanel = typeof window !== 'undefined' && 
      (window.location.pathname.includes('/game') || 
       window.location.pathname.includes('/character'));
    
    if (isQuadrantExpanded || !isCharacterPanel) {
      return null;
    }
    
    return (
      <>
        {/* Balance - Top Left */}
        <div className={cn(
          'absolute left-2 top-6',
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
          'bg-background/90 backdrop-blur-sm border border-yellow-200/30',
          'shadow-md',
          'transition-transform duration-200 hover:scale-105',
          'text-yellow-300',
          'pointer-events-none z-50',
          'drop-shadow-lg'
        )}>
          <Coins className="w-4 h-4 text-yellow-300" />
          <span className="font-mono text-sm font-medium">
            {player?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
          </span>
        </div>

        {/* Aura - Top Right */}
        <div className={cn(
          'absolute right-2 top-6',
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
          'bg-background/90 backdrop-blur-sm border border-purple-200/30',
          'shadow-md',
          'transition-transform duration-200 hover:scale-105',
          'text-purple-300',
          'pointer-events-none z-50',
          'drop-shadow-lg'
        )}>
          <Zap className="w-4 h-4 text-purple-300" />
          <span className="font-mono text-sm font-medium">
            {player?.aura !== undefined ? player.aura.toFixed(1) : '100.0'}
          </span>
        </div>
      </>
    )
  }, [player?.balance, player?.aura, isQuadrantExpanded]);

  // Main container with proper aspect ratio and scaling
  return (
    <div
      className={cn(
        'relative',
        'flex flex-col items-center justify-end',
        'overflow-hidden',
        className
      )}
      style={{
        aspectRatio: '3/4',
        minWidth: size === 'small' ? '48px' : size === 'medium' ? '64px' : '96px',
        width: '100%',
        height: 'auto',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        // Prevent the character from becoming too small
        minHeight: size === 'small' ? '64px' : size === 'medium' ? '85px' : '128px',
        ...(isQuadrantExpanded && {
          transform: 'scale(1.2)',
        })
      }}
    >
      {/* Character container */}
      <div className="relative w-full h-full">
        {isQuadrantExpanded ? (
          // Expanded quadrant view - show only head and tool
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative" style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {head}
              </div>
            </div>
            {statsOverlay}
          </div>
        ) : (
          // Normal view - show full character
          <div className="relative w-full h-full">
            <div className="relative w-full h-full" style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              paddingBottom: '20%' // Move container 20% closer to bottom edge
            }}>
              <div className="relative w-full" style={{
                transform: 'translateY(7%)',
                height: '100%'
              }}>
                {baseBody}
                {body}
                {head}
                {showTool && tool}
                {auraEffect}
              </div>
            </div>
            {statsOverlay}
          </div>
        )}
      </div>

      {/* Character name */}
      {showName && (
        <div className={cn(
          'font-medium text-center',
          'transition-all duration-300',
          {
            'text-xs mt-1': isQuadrantExpanded,
            'text-sm mt-2': !isQuadrantExpanded,
            'text-foreground/80': true
          }
        )}>
          {player?.name || 'Sem Nome'}
        </div>
      )}
    </div>
  )
}

export default CharacterDisplay
