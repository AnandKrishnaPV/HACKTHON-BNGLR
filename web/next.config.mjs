const nextConfig = {
  async rewrites() {
    // Determine the backend API URL. 
    // Fall back to localhost:8081 if not provided (for local development).
    // Ensure we strip any trailing slash or `/api` suffix if the user included it by mistake,
    // or just use it as the base.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8081/api';
    const destination = apiUrl.endsWith('/api') ? `${apiUrl}/:path*` : `${apiUrl}/api/:path*`;
    
    return [
      {
        source: '/api/:path*',
        destination: destination
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
