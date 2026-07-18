import type { NextConfig } from "next";

/** GitHub Pages publishes this repository at /invitation-sites/. */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/invitation-sites",
  trailingSlash: true,
};

export default nextConfig;
