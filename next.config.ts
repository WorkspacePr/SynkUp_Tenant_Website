import path from "path";
import type { NextConfig } from "next";

function getRemoteImagePatterns() {
  const configuredBases = [
    process.env.DJANGO_API_BASE,
    process.env.NEXT_PUBLIC_DJANGO_API_BASE,
  ].filter((value): value is string => Boolean(value));

  const patterns = configuredBases.flatMap((base) => {
    try {
      const url = new URL(base);

      return [
        {
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port || undefined,
          pathname: "/**",
        },
      ];
    } catch {
      return [];
    }
  });

  if (patterns.length > 0) {
    return patterns;
  }

  return [
    {
      protocol: "http" as const,
      hostname: "127.0.0.1",
      port: "8000",
      pathname: "/**",
    },
    {
      protocol: "http" as const,
      hostname: "localhost",
      port: "8000",
      pathname: "/**",
    },
  ];
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: getRemoteImagePatterns(),
  },
};

export default nextConfig;
