import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        services: 'services.html',
        portfolio: 'portfolio.html',
        guarantees: 'guarantees.html',
        contact: 'contact.html',
        'privacy-policy': 'privacy-policy.html',
        'terms-of-service': 'terms-of-service.html',
        'cookie-policy': 'cookie-policy.html',
        disclaimer: 'disclaimer.html'
      }
    }
  }
})