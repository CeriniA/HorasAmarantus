import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      
      // ✅ MEJORADO: Habilitar en desarrollo
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      
      manifest: {
        name: 'Sistema Horas Hortícola',
        short_name: 'SistemaHoras',
        description: 'Sistema de registro de horas para producción hortícola',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          {
            src: '/icons/launchericon-48x48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/icons/launchericon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/launchericon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/launchericon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        
        // ✅ MEJORADO: Estrategias de caching optimizadas
        runtimeCaching: [
          // API - NetworkFirst (prioriza red, fallback a cache)
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          
          // Imágenes - CacheFirst (prioriza cache)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          },
          
          // Fuentes - CacheFirst
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          },
          
          // CSS y JS - StaleWhileRevalidate
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
