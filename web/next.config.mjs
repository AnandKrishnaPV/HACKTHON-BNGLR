const nextConfig = {
  async rewrites() {
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
