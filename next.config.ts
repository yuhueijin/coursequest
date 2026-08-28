import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 避免 Turbopack 誤把使用者家目錄下無關的 package-lock.json 當成 workspace root。
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
