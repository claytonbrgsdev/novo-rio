"use client"

import { useEffect, useRef } from "react"
import { useAudio } from "./audio-context"

export default function AudioInitializer() {
  const { isPlaying, startPlaying } = useAudio()
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Verificar se o áudio já foi inicializado
    if (hasInitializedRef.current) return

    // Função para verificar se o navegador suporta áudio
    const checkAudioSupport = () => {
      try {
        const audio = new Audio()
        return typeof audio.play === "function"
      } catch (e) {
        console.error("Navegador não suporta áudio:", e)
        return false
      }
    }

    // Verificar suporte a áudio
    const audioSupported = checkAudioSupport()
    if (!audioSupported) {
      console.error("Navegador não suporta áudio HTML5")
      return
    }

    // Criar um áudio silencioso para inicializar o contexto de áudio
    const initAudio = () => {
      if (hasInitializedRef.current) return

      try {
        // Verificar se o AudioContext é suportado
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) {
          console.warn("AudioContext não suportado neste navegador")
          return
        }

        // Criar um contexto de áudio
        const audioCtx = new AudioContext()

        // Criar um oscilador com volume muito baixo
        const oscillator = audioCtx.createOscillator()
        const gainNode = audioCtx.createGain()
        gainNode.gain.value = 0.001 // Volume extremamente baixo

        oscillator.connect(gainNode)
        gainNode.connect(audioCtx.destination)

        // Iniciar e parar rapidamente para inicializar o contexto
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.001)

        console.log("Contexto de áudio inicializado com sucesso")
        hasInitializedRef.current = true

        // Alternativa usando um elemento de áudio com dados de áudio inline
        if (!hasInitializedRef.current) {
          // Criar um elemento de áudio com um data URI de um áudio silencioso
          const silentDataURI =
            "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
          const silentAudio = new Audio(silentDataURI)
          silentAudio.volume = 0.01

          const playPromise = silentAudio.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Contexto de áudio inicializado com sucesso (método alternativo)")
                silentAudio.pause()
                hasInitializedRef.current = true
              })
              .catch((error) => {
                // Ignorar erros de interação do usuário
                if (error.name !== "NotAllowedError") {
                  console.error("Erro ao inicializar contexto de áudio (método alternativo):", error)
                }
              })
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar contexto de áudio:", error)
      }
    }

    // Tentar iniciar o áudio com qualquer interação do usuário
    const handleUserInteraction = () => {
      if (!isPlaying && !hasInitializedRef.current) {
        initAudio()
      }
    }

    // Adicionar event listeners para interação do usuário
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    return () => {
      // Limpar event listeners
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }
  }, [isPlaying, startPlaying])

  return null
}
