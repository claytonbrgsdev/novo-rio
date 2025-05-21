'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/components/auth/auth-context';
import { AudioProvider } from '@/components/audio/audio-context';
import AudioInitializer from '@/components/audio/audio-initializer';
import MusicStartButton from '@/components/audio/music-start-button';
import AudioPlayer from '@/components/audio/audio-player';
import RouteLogger from '@/components/debug/route-logger';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <AuthProvider>
          <RouteLogger />
          <AudioInitializer />
          {children}
          <MusicStartButton />
          <AudioPlayer />
        </AuthProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}
