"use client"

import { useEffect, useRef, useState } from "react"
import { useAudio } from "./audio-context"

export default function AudioPlayer() {
  const {
    isPlaying,
    volume,
    muted,
    currentTrack,
    nextTrack,
    setCurrentTrack,
    setAudioError: setContextAudioError,
  } = useAudio()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const silentAudioRef = useRef<HTMLAudioElement | null>(null)
  const [localAudioError, setLocalAudioError] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Data URI para áudio silencioso - usado como fallback garantido
  const silentDataURI =
    "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"

  // Lista de músicas com data URIs como fallback garantido
  const playlist = [
    {
      name: "Trilha Original",
      formats: [
        { type: "audio/mpeg", path: "/audio/trilha-oficial-novo-rio.mp3" },
        { type: "audio/mp3", path: silentDataURI }, // Fallback garantido
      ],
    },
    {
      name: "Trilha Novo Rio",
      formats: [
        { type: "audio/mpeg", path: "/audio/trilha-novo-rio.mp3" },
        { type: "audio/mp3", path: silentDataURI }, // Fallback garantido
      ],
    },
    {
      name: "Trilha Novo Rio 2",
      formats: [
        { type: "audio/mpeg", path: "/audio/trilha-novo-rio-2.mp3" },
        { type: "audio/mp3", path: silentDataURI }, // Fallback garantido
      ],
    },
  ]

  // Função para propagar erros para o contexto
  const setAudioError = (error: string | null) => {
    setLocalAudioError(error)
    setContextAudioError(error)
  }

  // Verificar se o navegador suporta um formato específico
  const canPlayType = (type: string): boolean => {
    if (typeof Audio === "undefined") return false

    try {
      const audio = new Audio()
      const canPlay = audio.canPlayType(type)
      return canPlay !== "" && canPlay !== "no"
    } catch (e) {
      console.error("Erro ao verificar suporte ao formato:", e)
      return false
    }
  }

  // Criar um contexto de áudio programaticamente
  const createAudioContext = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        console.warn("AudioContext não suportado neste navegador")
        return null
      }
      return new AudioContext()
    } catch (error) {
      console.error("Erro ao criar contexto de áudio:", error)
      return null
    }
  }

  // Inicializar o áudio silencioso para manter o contexto de áudio ativo
  useEffect(() => {
    if (!silentAudioRef.current) {
      try {
        // Criar um elemento de áudio com o data URI
        const silent = new Audio(silentDataURI)
        silent.loop = true
        silent.volume = 0.001
        silentAudioRef.current = silent

        console.log("Áudio silencioso criado com sucesso usando data URI")
      } catch (error) {
        console.error("Erro ao criar áudio silencioso com data URI:", error)

        // Método alternativo: criar um oscilador silencioso
        try {
          if (!audioContextRef.current) {
            audioContextRef.current = createAudioContext()
          }

          if (audioContextRef.current) {
            const oscillator = audioContextRef.current.createOscillator()
            const gainNode = audioContextRef.current.createGain()

            // Configurar um volume extremamente baixo
            gainNode.gain.value = 0.0001

            oscillator.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)

            // Iniciar o oscilador
            oscillator.start()
            oscillator.stop(audioContextRef.current.currentTime + 1) // Tocar por 1 segundo

            console.log("Áudio silencioso criado com sucesso usando oscilador")
          }
        } catch (oscError) {
          console.error("Erro ao criar oscilador silencioso:", oscError)
        }
      }
    }

    return () => {
      if (silentAudioRef.current) {
        silentAudioRef.current.pause()
        silentAudioRef.current = null
      }

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close()
        } catch (error) {
          console.error("Erro ao fechar contexto de áudio:", error)
        }
      }
    }
  }, [silentDataURI])

  // Inicializar o player de áudio principal
  useEffect(() => {
    if (!audioRef.current) {
      try {
        const audio = new Audio()

        // Configurar eventos
        audio.onended = () => {
          console.log("Música terminou, avançando para a próxima")
          nextTrack()
        }

        audio.onerror = (e) => {
          const error = audio.error
          let errorMsg = "Erro desconhecido ao carregar áudio"

          if (error) {
            switch (error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMsg = "Carregamento do áudio foi abortado"
                break
              case MediaError.MEDIA_ERR_NETWORK:
                errorMsg = "Erro de rede ao carregar áudio"
                break
              case MediaError.MEDIA_ERR_DECODE:
                errorMsg = "Erro ao decodificar áudio"
                break
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMsg = "Formato de áudio não suportado"
                break
            }
          }

          console.error(`Erro ao carregar áudio: ${errorMsg}`, e)
          setAudioError(errorMsg)

          // Tentar a próxima faixa em caso de erro
          console.log("Erro detectado, avançando para a próxima faixa")
          setTimeout(() => nextTrack(), 1000)
        }

        audioRef.current = audio
      } catch (error) {
        console.error("Erro ao criar elemento de áudio:", error)
        setAudioError("Erro ao inicializar player de áudio")
      }
    }

    return () => {
      if (audioRef.current) {
        const audio = audioRef.current
        audio.onended = null
        audio.onerror = null
        audio.pause()
        audio.src = ""
        audioRef.current = null
      }
    }
  }, [nextTrack, setAudioError])

  // Gerenciar a reprodução do áudio silencioso
  useEffect(() => {
    if (isPlaying && silentAudioRef.current) {
      try {
        const playPromise = silentAudioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Erro ao reproduzir áudio silencioso:", error)
          })
        }
      } catch (error) {
        console.error("Erro ao iniciar áudio silencioso:", error)
      }
    } else if (!isPlaying && silentAudioRef.current) {
      try {
        silentAudioRef.current.pause()
      } catch (error) {
        console.error("Erro ao pausar áudio silencioso:", error)
      }
    }
  }, [isPlaying])

  // Gerenciar a mudança de faixa
  useEffect(() => {
    if (!audioRef.current) return
    setAudioError(null)

    const audio = audioRef.current

    // Parar a reprodução atual
    try {
      audio.pause()
    } catch (error) {
      console.error("Erro ao pausar áudio atual:", error)
    }

    // Verificar se a faixa atual é válida
    if (currentTrack < 0 || currentTrack >= playlist.length) {
      console.error("Índice de faixa inválido:", currentTrack)
      setAudioError("Índice de faixa inválido")
      return
    }

    try {
      // Encontrar o primeiro formato suportado
      const track = playlist[currentTrack]
      console.log(`Tentando carregar faixa: ${track.name}`)

      let formatFound = false

      for (const format of track.formats) {
        if (canPlayType(format.type)) {
          console.log(`Formato suportado encontrado: ${format.type}, carregando: ${format.path}`)
          audio.src = format.path
          formatFound = true
          break
        }
      }

      if (!formatFound) {
        console.error("Nenhum formato suportado encontrado para a faixa:", track.name)
        setAudioError("Formato de áudio não suportado")

        // Usar o data URI silencioso como último recurso
        audio.src = silentDataURI
      }

      // Carregar o áudio
      audio.load()

      // Reproduzir se estiver no estado de reprodução
      if (isPlaying) {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Erro ao reproduzir após mudança de faixa:", error)
            setAudioError(`Erro ao reproduzir: ${error.message}`)

            // Se houver erro, tentar a próxima faixa
            if (error.name !== "NotAllowedError") {
              console.log("Erro ao reproduzir, tentando próxima faixa")
              setTimeout(() => nextTrack(), 1000)
            }
          })
        }
      }
    } catch (error) {
      console.error("Erro ao configurar faixa:", error)
      setAudioError(`Erro ao configurar faixa: ${error}`)

      // Tentar a próxima faixa em caso de erro
      setTimeout(() => nextTrack(), 1000)
    }
  }, [currentTrack, isPlaying, nextTrack, playlist, setAudioError, silentDataURI])

  // Gerenciar volume e mudo
  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.volume = volume / 100
        audioRef.current.muted = muted
      } catch (error) {
        console.error("Erro ao ajustar volume/mudo:", error)
      }
    }
  }, [volume, muted])

  // Gerenciar reprodução/pausa
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      try {
        const playPromise = audioRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Erro ao reproduzir áudio:", error)
            setAudioError(`Erro ao reproduzir: ${error.message}`)

            // Ignorar erros de interação do usuário
            if (error.name !== "NotAllowedError") {
              // Tentar a próxima faixa em caso de erro
              console.log("Erro ao reproduzir, tentando próxima faixa")
              nextTrack()
            }
          })
        }
      } catch (error) {
        console.error("Exceção ao tentar reproduzir:", error)
        setAudioError(`Exceção ao reproduzir: ${error}`)
      }
    } else {
      try {
        audioRef.current.pause()
      } catch (error) {
        console.error("Erro ao pausar áudio:", error)
      }
    }
  }, [isPlaying, nextTrack, setAudioError])

  // Verificar formatos de áudio suportados sem usar fetch
  useEffect(() => {
    // Criar um contexto de áudio para uso futuro
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext()
    }

    // Verificar os formatos de áudio suportados
    const checkAudioFormats = () => {
      const formats = ["audio/mpeg", "audio/wav", "audio/ogg"]

      formats.forEach((format) => {
        const supported = canPlayType(format)
        console.log(`Formato ${format} ${supported ? "é suportado" : "não é suportado"}`)
      })
    }

    checkAudioFormats()

    return () => {
      // Limpar recursos
    }
  }, [])

  // Este componente não renderiza nada visualmente
  return null
}
