/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COACH_API_URL?: string
}

// A-Frame 1.8 ships JavaScript only. The scene file talks to it through the DOM.
declare module 'aframe'
