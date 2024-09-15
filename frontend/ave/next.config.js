/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config) => {
    config.plugins.push(new MiniCssExtractPlugin());
    return config;
  },
};

export default config;
