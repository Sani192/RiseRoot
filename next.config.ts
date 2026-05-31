import type { NextConfig } from "next";
import { validateProductionStartupEnv } from "./src/lib/env";

validateProductionStartupEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
