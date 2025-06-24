/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: ["@nocioun/core"],
  webpack: (config, { dev, isServer }) => {
    // webpack 캐시 성능 경고 해결을 위한 설정
    if (dev) {
      // 메모리 캐시 사용으로 성능 향상
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };

      // 큰 문자열 직렬화 성능 개선
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        chunkIds: "deterministic",
        // 큰 모듈의 스플리팅 최적화
        splitChunks: {
          ...config.optimization.splitChunks,
          maxSize: 100000, // 100KB 이상의 청크를 분할
        },
      };

      // 성능 힌트 비활성화 (개발 환경에서만)
      config.performance = {
        hints: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
