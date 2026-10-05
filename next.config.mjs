/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  // Math & ML moved from a Foundations pillar to its own section; keep old links working.
  async redirects() {
    const moved = {
      "linear-algebra-for-ai": "linear-algebra",
      "probability-statistics-for-ai": "probability-statistics",
      "calculus-for-optimization": "calculus",
      "machine-learning-fundamentals": "machine-learning",
      "neural-networks": "neural-networks",
      "transformers-attention": "transformers",
      "evaluation-metrics": "evaluation",
    };
    return [
      { source: "/foundations/math-ml-core", destination: "/math", permanent: true },
      ...Object.entries(moved).map(([slug, track]) => ({
        source: `/foundations/math-ml-core/${slug}`,
        destination: `/math/${track}/${slug}`,
        permanent: true,
      })),
    ];
  },
  // Browsers ask for /favicon.ico on their own; serve the generated icon there.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
};

export default nextConfig;
