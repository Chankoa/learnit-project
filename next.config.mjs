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
