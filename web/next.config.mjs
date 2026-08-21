

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/api/:path*'
      }
    ]
  },
  allowedDevOrigins: ['qswarm.local', 'weak-worlds-sing.loca.lt', 'happy-pianos-travel.loca.lt'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
