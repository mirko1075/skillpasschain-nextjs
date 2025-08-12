/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // For Netlify deployment - don't use static export for dynamic apps
  trailingSlash: true,
  
  // Webpack config to handle the Progress component issue
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-progress': false,
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@radix-ui/react-progress': false,
    }
    
    return config
  },
  
  swcMinify: true,
  
  // Images optimization for Netlify
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig