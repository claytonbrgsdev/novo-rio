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
  const [loadedParts, setLoadedParts] = React.useState<Set<CharacterPart>>(new Set())
  const [error, setError] = React.useState<Error | null>(null)

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

  const containerStyles = getContainerStyles();

  // Handle image loading
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

  // Base body (shadow/outline)
  const baseBody = React.useMemo(() => {
    const { baseBodyUrl } = CHARACTER_ASSETS
    return (
      <div
        className="absolute inset-0 w-full h-full flex items-end justify-center"
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          // Reduced padding for better fit
          padding: size === 'small' ? '0.5rem' : '0.75rem',
          boxSizing: 'border-box',
          zIndex: 1,
          // Smooth transitions for resizing
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center">
          <img
            key="base"
            src={baseBodyUrl}
            alt="Character base"
            className="h-auto w-full max-w-full"
            style={{
              objectFit: 'contain',
              objectPosition: 'center bottom',
              display: 'block',
              margin: '0 auto',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              position: 'relative',
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
    if (!bodyId) return null
    const bodyUrl = `/characters/body/${bodyId}.png`

    return (
      <div
        className="absolute inset-0 w-full h-full flex items-end justify-center"
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          padding: '1rem',
          boxSizing: 'border-box',
          zIndex: 2
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center">
          <img
            key={`body-${bodyId}`}
            src={bodyUrl}
            alt={`Character body ${bodyId}`}
            className="h-auto w-full max-w-full"
            style={{
              objectFit: 'contain',
              objectPosition: 'center bottom',
              display: 'block',
              margin: '0 auto',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
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

  // Tool layer
  const tool = React.useMemo(() => {
    if (!showTool || !toolId) return null
    const toolUrl = `/characters/tool/${toolId}.png`

    if (isQuadrantExpanded) {
      return (
        <div className="relative flex justify-center items-center w-full h-full">
          <div style={{
            width: '60%',
            height: '60%',
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: 'translateY(40%)',
            zIndex: 4
          }}>
            <img
              key={`tool-${toolId}-expanded`}
              src={toolUrl}
              alt={`Tool ${toolId}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
                transform: 'rotate(-15deg)'
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
    }

    // Original tool implementation for normal view
    return (
      <div
        className={cn(
          'absolute',
          'transition-all duration-300',
          'z-0=', // Higher z-index to ensure it's above other elements
          {
            'right-0 bottom-0 w-2/5 h-2/5': !isQuadrantExpanded,
          }
        )}
        style={{
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
          transform: 'translateY(-85%) rotate(-95deg) translateY(-50%)',
        }}
      >
        <div className={cn(
          'relative w-full h-full flex items-end justify-end',
          {
            'w-[150%] h-[150%]': !isQuadrantExpanded,
          }
        )}>
          <img
            key={`tool-${toolId}`}
            src={toolUrl}
            alt={`Tool ${toolId}`}
            className={cn(
              'h-auto max-w-full',
              'transition-all duration-300',
              'pointer-events-auto',
              'opacity-100',
              'transform-gpu',
              {
                'scale-150': true, // Increased scale for collapsed state
              }
            )}
            style={{
              maxHeight: '100%',
              objectFit: 'contain',
              objectPosition: 'right bottom',
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
  }, [toolId, showTool, isQuadrantExpanded, handleImageLoad, handleImageError])

  const { player } = usePlayer()

  // Balance display with responsive positioning
  const balanceDisplay = React.useMemo(() => (
    <div className={cn(
      'flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm',
      'shadow-md border border-border/50',
      'transition-all duration-300 z-10',
      {
        'text-xs': isQuadrantExpanded,
      }
    )}>
      <Coins className="w-3 h-3 text-yellow-500" />
      <span className="font-mono font-medium">
        {player?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
      </span>
    </div>
  ), [player?.balance, isQuadrantExpanded]);

  // Aura display with responsive positioning
  const auraDisplay = React.useMemo(() => (
    <div className={cn(
      'flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm',
      'shadow-md border border-border/50',
      'transition-all duration-300 z-10',
      {
        'text-xs': isQuadrantExpanded,
      }
    )}>
      <Zap className="w-3 h-3 text-purple-400" />
      <span className="font-mono font-medium">
        {player?.aura !== undefined ? player.aura.toFixed(1) : '100.0'}
      </span>
    </div>
  ), [player?.aura, isQuadrantExpanded]);

  // Calculate head size and position based on container size and expanded state
  const getHeadStyles = () => {
    // Base size and position values
    const baseValues = {
      small: { size: 22, top: 15 },
      medium: { size: 24, top: 13 },
      large: { size: 26, top: 12 }
    };

    const { size: baseSize, top: baseTop } = baseValues[size] || baseValues.medium;

    // Adjusted scaling when quadrant is expanded
    const scale = isQuadrantExpanded ? 0.68 : 1;

    // When expanded, adjust the top position to bring the head closer to the body
    const topAdjustment = isQuadrantExpanded ? 15 : 0; // Slightly reduced from 20px to 15px

    return {
      size: `${baseSize * scale}%`,
      top: `calc(${baseTop * scale}% + ${topAdjustment}px)`,
      transition: 'all 0.3s ease-in-out'
    };
  };

  // Head layer with responsive positioning
  const head = React.useMemo(() => {
    if (!headId) return null;
    const headUrl = `/characters/head/${headId}.png`;

    const { size: headSize, top: headTop } = getHeadStyles();

    if (isQuadrantExpanded) {
      // Special handling for expanded view
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '60%',
              height: '60%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                key={`head-${headId}-expanded`}
                src={headUrl}
                alt={`Character head ${headId}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center bottom',
                  display: 'block',
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
        </div>
      );
    }

    // Original head implementation for normal view
    return (
      <div
        className="absolute w-full h-full pointer-events-none"
        style={{
          zIndex: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100%',
          width: '100%',
          top: headTop,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: headSize,
            height: 'auto',
            aspectRatio: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <img
            key={`head-${headId}`}
            src={headUrl}
            alt={`Character head ${headId}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center bottom',
              display: 'block',
              position: 'relative',
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
  }, [headId, size, isQuadrantExpanded, handleImageLoad, handleImageError])

  // Aura effect (simplified)
  const auraEffect = React.useMemo(() => {
    if (player?.aura === undefined) return null;

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
    );
  }, [player?.aura]);

  // Get tool display name
  const getToolName = (toolId: string) => {
    const toolNames: Record<string, string> = {
      'shovel': 'Pá',
      'sickle': 'Foice',
      'machete': 'Facão',
      'watering_can': 'Regador'
    }
    return toolNames[toolId] || toolId
  }

  // Stats overlay for balance, aura and tool
  const statsOverlay = React.useMemo(() => (
    <div className={cn(
      'absolute flex flex-col gap-1.5 z-10',
      'transition-all duration-300',
      {
        'bottom-12 left-2': !isQuadrantExpanded,
        'bottom-8 left-1': isQuadrantExpanded,
      }
    )}>
      {/* Balance */}
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
        'bg-background/90 backdrop-blur-sm border border-border/20',
        'shadow-md',
        {
          'scale-95': isQuadrantExpanded,
          'scale-105': !isQuadrantExpanded,
        }
      )}>
        <Coins className="w-4 h-4 text-yellow-500" />
        <span className="font-mono text-sm font-medium">
          {player?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </span>
      </div>

      {/* Aura */}
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
        'bg-background/90 backdrop-blur-sm border border-border/20',
        'shadow-md',
        {
          'scale-95': isQuadrantExpanded,
          'scale-105': !isQuadrantExpanded,
        }
      )}>
        <Zap className="w-4 h-4 text-purple-400" />
        <span className="font-mono text-sm font-medium">
          {player?.aura !== undefined ? player.aura.toFixed(1) : '100.0'}
        </span>
      </div>

      {/* Tool */}
      {showTool && toolId && (
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full',
          'bg-background/90 backdrop-blur-sm border border-border/20',
          'shadow-sm',
          {
            'scale-90': isQuadrantExpanded,
            'scale-100': !isQuadrantExpanded,
          }
        )}>
          <span className="text-xs">🪏</span>
          <span className="font-mono text-xs font-medium">
            {getToolName(toolId)}
          </span>
          <span className="text-xs">- ♾️</span>
        </div>
      )}

      {/* Arrow indicator removed */}
    </div>
  ), [player?.balance, player?.aura, isQuadrantExpanded]);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-end',
        'transition-all duration-300',
        containerStyles[size],
        className,
        'overflow-visible',
        {
          'pb-2': isQuadrantExpanded,
          'pb-4': !isQuadrantExpanded
        }
      )}
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
