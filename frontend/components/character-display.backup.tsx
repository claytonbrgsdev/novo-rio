"use client"
import * as React from 'react'
import { useState, useEffect, useCallback, useMemo } from 'react'

type CharacterPart = 'base' | 'body' | 'head' | 'tool'
type CharacterSize = 'small' | 'medium' | 'large'
type ToolId = 'shovel' | 'sickle' | 'machete' | 'watering_can'

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
}

interface CharacterAssets {
  baseBodyUrl: string
  dimensions: Record<CharacterSize, { w: number; h: number }>
  bodyUrls: Record<number, string>
  headUrls: Record<number, string>
  toolUrls: Record<ToolId, string>
  headSizes: {
    small: readonly number[]
    large: readonly number[]
    defaultSize: string
    smallSize: string
    largeSize: string
  }
}

// Character assets configuration
const CHARACTER_ASSETS: CharacterAssets = {
  baseBodyUrl: '/characters/base.png',
  dimensions: {
    small: { w: 100, h: 140 },
    medium: { w: 150, h: 200 },
    large: { w: 200, h: 280 },
  },
  bodyUrls: {
    1: "/characters/body/1.png",
    2: "/characters/body/2.png",
    3: "/characters/body/3.png",
    4: "/characters/body/4.png",
    5: "/characters/body/5.png",
    6: "/characters/body/6.png",
    7: "/characters/body/7.png",
    8: "/characters/body/8.png",
    9: "/characters/body/9.png",
    10: "/characters/body/10.png",
    11: "/characters/body/11.png",
    12: "/characters/body/12.png",
  },
  headUrls: {
    1: "/characters/head/1.png",
    2: "/characters/head/2.png",
    3: "/characters/head/3.png",
    4: "/characters/head/4.png",
    5: "/characters/head/5.png",
    6: "/characters/head/6.png",
    7: "/characters/head/7.png",
    8: "/characters/head/8.png",
    9: "/characters/head/9.png",
    10: "/characters/head/10.png",
    11: "/characters/head/11.png",
    12: "/characters/head/12.png",
  },
  toolUrls: {
    shovel: "/characters/tool/shovel.png",
    sickle: "/characters/tool/sickle.png",
    machete: "/characters/tool/machete.png",
    watering_can: "/characters/tool/watering_can.png",
  },
  headSizes: {
    small: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const,
    large: [] as const,
    defaultSize: 'h-24',
    smallSize: 'h-20',
    largeSize: 'h-28',
  },
}

export function CharacterDisplay({
  size = 'medium',
  showName = false,
  showTool = true,
  headId,
  bodyId,
  toolId,
  className = '',
  onLoad,
  onError: onErrorProp,
  createNewCharacter,
}: CharacterDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [loadedParts, setLoadedParts] = useState<Set<CharacterPart>>(new Set())
  const [error, setError] = useState<Error | null>(null)

  const { dimensions, baseBodyUrl, bodyUrls, headUrls, toolUrls, headSizes } = CHARACTER_ASSETS
  const { w: charWidth, h: charHeight } = dimensions[size] || dimensions.medium

  // Get URLs for character parts
  const bodyUrl = useMemo(() => {
    if (!bodyId) return null
    return bodyUrls[bodyId] || null
  }, [bodyId, bodyUrls])

  const headUrl = useMemo(() => {
    if (!headId) return null
    return headUrls[headId] || null
  }, [headId, headUrls])

  const toolUrl = useMemo(() => {
    if (!toolId) return null
    return toolUrls[toolId] || null
  }, [toolId, toolUrls])

  // Single implementation of handleImageLoad
  const handleImageLoad = useCallback((part: CharacterPart, url: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement
    console.log(`[CharacterDisplay] Loaded ${part} image:`, url, {
      natural: `${target.naturalWidth}x${target.naturalHeight}`,
      rendered: `${target.width}x${target.height}`,
      position: { x: target.offsetLeft, y: target.offsetTop }
    })

    setLoadedParts((prev) => {
      const next = new Set(prev)
      next.add(part)
      return next
    })
    setError(null)
  }, [])

  // Single implementation of handleImageError
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>, type: string, url: string | null) => {
    const error = new Error(`Failed to load ${type} image: ${url || 'no url provided'}`)
    console.error(`[CharacterDisplay] Error loading ${type} image:`, error)
    setError(error)
    onErrorProp?.(error)
  }, [onErrorProp])

  // Handle create new character
  const handleCreateCharacter = useCallback(() => {
    createNewCharacter?.()
  }, [createNewCharacter])

  // Time of day based background colors
  const timeClass = useMemo((): string => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 10) return 'from-yellow-100 to-yellow-200' // Morning
    if (hour >= 10 && hour < 16) return 'from-blue-100 to-blue-200' // Midday
    if (hour >= 16 && hour < 19) return 'from-orange-100 to-orange-200' // Evening
    return 'from-indigo-100 to-indigo-200' // Evening/Night
  }, [])

  // Dimensions are already set above using charWidth and charHeight

  // Log the image URLs we're trying to load
  useEffect(() => {
    console.log(`[CharacterDisplay] Using size: ${size} (${charWidth} x ${charHeight})`)
    console.log('[CharacterDisplay] Image URLs:', {
      baseBody: baseBodyUrl,
      body: bodyId !== undefined ? bodyUrl : 'No body ID',
      head: headId !== undefined ? headUrl : 'No head ID',
      tool: toolId ? toolUrl : 'No tool ID'
    })
  }, [size, charWidth, charHeight, bodyId, bodyUrl, headId, headUrl, toolId, toolUrl, baseBodyUrl])

  // Check if all required parts are loaded
  useEffect(() => {
    const requiredParts: CharacterPart[] = ['base', 'body', 'head']
    const allLoaded = requiredParts.every(part => loadedParts.has(part))
    
    if (allLoaded) {
      console.log('[CharacterDisplay] All required parts loaded')
      setIsLoading(false)
      onLoad?.()
    } else {
      console.log(`[CharacterDisplay] Loaded ${loadedParts.size} of ${requiredParts.length} required parts - still waiting`)
    }
  }, [loadedParts, onLoad])

  // Debug grid background
  const gridBackground: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: 'center center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  };

  // Render character with all layers
  const renderCharacterContent = useCallback(() => {
    // If we don't have valid URLs, show an error state
    if (!bodyUrl || !headUrl) {
      const errorMsg = `Missing required character assets. Body: ${bodyUrl ? 'loaded' : 'missing'}, Head: ${headUrl ? 'loaded' : 'missing'}`
      console.error(`[CharacterDisplay] ${errorMsg}`)
      
      if (!error) {
        const newError = new Error(errorMsg)
        setError(newError)
        onErrorProp?.(newError)
      }

      return (
        <div className="h-full flex items-center justify-center p-4">
          <p className="text-center text-red-600">
            Não foi possível carregar o personagem. Por favor, tente novamente.
          </p>
        </div>
      )
    }

      // Use the memoized grid background style

    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-center text-red-600">
          Não foi possível carregar o personagem. Por favor, tente novamente.
        </p>
      </div>
    )
  }

  // Debug grid background
  const gridBackground: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(rgba(200, 200, 200, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200, 200, 200, 0.3) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: 'center center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  };

  const renderCharacter = () => {
    return (
      <div className={`relative w-full h-full ${getTimeClass()} overflow-visible`}>
        {/* Debug grid background */}
        <div style={gridBackgroundStyle}></div>
        
        {/* Container boundary */}
        <div className="absolute inset-0 border-2 border-purple-500 pointer-events-none" style={{ zIndex: 2 }}></div>
        
        <div className="relative w-full h-full flex items-end justify-center" style={{ minHeight: '400px', zIndex: 3 }}>
          {/* Character container - this will hold all character parts */}
          <div className="relative w-full h-full flex items-end justify-center">
            {/* Safe area boundary */}
            <div className="absolute inset-0 border-2 border-blue-500 opacity-50 pointer-events-none" style={{ top: '10%', bottom: '10%', left: '10%', right: '10%' }}></div>
            
            {/* Base layer - positioned at bottom center */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 10 }}>
              <img
                src={baseBodyUrl}
                alt="Base body"
                className="opacity-0 transition-opacity duration-300"
                style={{ 
                  height: '300px',
                  width: 'auto',
                  display: 'block',
                  opacity: loadedParts.has('base') ? 1 : 0.3,
                  border: '2px solid red',
                  backgroundColor: 'rgba(255,0,0,0.1)'
                }}
                onLoad={(e) => handleImageLoad('base', baseBodyUrl, e)}
                onError={(e) => handleImageError(e, 'base', baseBodyUrl)}
              />
              <span className="absolute -top-6 left-0 text-xs text-red-500 font-mono whitespace-nowrap">
                Base Layer
              </span>
            </div>
            
            {/* Body layer - positioned above base */}
            {bodyId && bodyUrl && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 20 }}>
                <img
                  src={bodyUrl}
                  alt="Character body"
                  className="opacity-0 transition-opacity duration-300"
                  style={{
                    height: '280px',
                    width: 'auto',
                    display: 'block',
                    opacity: loadedParts.has('body') ? 1 : 0.3,
                    border: '2px solid blue',
                    backgroundColor: 'rgba(0,0,255,0.1)'
                  }}
                  onLoad={(e) => handleImageLoad('body', bodyUrl, e)}
                  onError={(e) => handleImageError(e, 'body', bodyUrl)}
                />
                <span className="absolute -top-6 left-0 text-xs text-blue-500 font-mono whitespace-nowrap">
                  Body Layer (ID: {bodyId})
                </span>
              </div>
            )}
            
            {/* Head layer - positioned above body */}
            {headId && headUrl && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 30, marginBottom: '140px' }}>
                <img
                  src={headUrl}
                  alt="Character head"
                  className="opacity-0 transition-opacity duration-300"
                  style={{
                    height: '120px',
                    width: 'auto',
                    display: 'block',
                    opacity: loadedParts.has('head') ? 1 : 0.3,
                    border: '2px solid green',
                    backgroundColor: 'rgba(0,255,0,0.1)'
                  }}
                  onLoad={(e) => handleImageLoad('head', headUrl, e)}
                  onError={(e) => handleImageError(e, 'head', headUrl)}
                />
                <span className="absolute -top-6 left-0 text-xs text-green-500 font-mono whitespace-nowrap">
                  Head Layer (ID: {headId})
                </span>
              </div>
            )}
            
            {/* Tool layer - positioned above body but below head */}
            {showTool && toolId && toolUrl && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 25, marginBottom: '180px', marginLeft: '80px' }}>
                <img
                  src={toolUrl}
                  alt={`${toolId} tool`}
                  className="opacity-0 transition-opacity duration-300"
                  style={{
                    height: '80px',
                    width: 'auto',
                    display: 'block',
                    opacity: loadedParts.has('tool') ? 1 : 0.3,
                    border: '2px solid orange',
                    backgroundColor: 'rgba(255,165,0,0.1)'
                  }}
                  onLoad={(e) => handleImageLoad('tool', toolUrl, e)}
                  onError={(e) => handleImageError(e, 'tool', toolUrl)}
                />
                <span className="absolute -top-6 left-0 text-xs text-orange-500 font-mono whitespace-nowrap">
                  Tool Layer ({toolId})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Character name */}
        {showName && bodyId && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Personagem {bodyId}
          </div>
        )}
      </div>
    )
  }

  // Get time of day based background colors
  const getTimeClass = useCallback((): string => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 10) return 'from-yellow-100 to-yellow-200' // Morning
    if (hour >= 10 && hour < 16) return 'from-blue-100 to-blue-200' // Midday
    if (hour >= 16 && hour < 19) return 'from-orange-100 to-orange-200' // Evening
    return 'from-indigo-100 to-indigo-200' // Evening/Night
  }, [])

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{
        width: charWidth,
        height: charHeight,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Debug grid */}
      <div style={gridBackgroundStyle} />

      {/* Character container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {renderCharacterContent()}
      </div>

      {/* Character name */}
      {showName && (
        <div className="mt-2 text-sm font-medium text-center">
          Character Name
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <div className="animate-pulse text-gray-400">Carregando…</div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/70">
          <p className="text-center text-red-600">
            Erro ao carregar o personagem.<br />
            {error.message}
          </p>
        </div>
      )}

      {/* No-character fallback */}
      {!bodyId || !headId ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-600 mb-4">Nenhum personagem encontrado</p>
          {createNewCharacter && (
            <button
              onClick={createNewCharacter}
              className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Criar Personagem
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default CharacterDisplay;
