import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const mdxLoader = require.resolve("./lib/mdx-rs-loader.cjs");
const mdxOptions = {
  providerImportSource: "@/mdx-components",
  mdxType: "gfm"
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
          }
        ]
      }
    ];
  },
  experimental: {
    mdxRs: mdxOptions
  },
  turbopack: {
    rules: {
      "*.mdx": {
        loaders: [
          {
            loader: mdxLoader,
            options: mdxOptions
          }
        ],
        as: "*.tsx"
      }
    }
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mdx$/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: mdxLoader,
          options: mdxOptions
        }
      ]
    });

    return config;
  }
};

export default nextConfig;
