import type { NextConfig } from "next";
import path from "path";

// GitHub Pages 把這個 repo 發佈在 https://<user>.github.io/coursequest/
// 這種「子路徑」底下，所以部署時（GITHUB_PAGES=true）要加上 basePath，
// 本機開發 (npm run dev) 則維持原樣，路徑還是根目錄。
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoBasePath = "/coursequest";

const nextConfig: NextConfig = {
  // 避免 Turbopack 誤把使用者家目錄下無關的 package-lock.json 當成 workspace root。
  turbopack: {
    root: path.join(__dirname),
  },
  // 純靜態匯出：GitHub Pages 只能放靜態檔案，沒有 Node.js 伺服器可以跑
  // Next.js 的 SSR。這個專案本來就全部是 client component + localStorage，
  // 沒有用到任何伺服器功能，所以可以直接匯出成靜態 HTML/CSS/JS。
  output: "export",
  images: { unoptimized: true },
  ...(isGithubPages && {
    basePath: repoBasePath,
    assetPrefix: repoBasePath,
  }),
};

export default nextConfig;
