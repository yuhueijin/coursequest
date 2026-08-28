import type { NextConfig } from "next";
import path from "path";

// 靜態網站發佈在「子路徑」底下時（例如 GitHub Pages 的
// https://<user>.github.io/coursequest/、GitLab Pages 的
// https://<group>.<pages網域>/<專案名稱>/），要加上 basePath / assetPrefix
// 頁面裡的資源路徑才會正確；本機開發 (npm run dev) 不用設，路徑維持根目錄。
//
// 這個子路徑由部署腳本透過 BASE_PATH 環境變數帶入，next.config.ts 本身
// 不用因為換部署平台而修改：
//   - GitHub Actions：見 .github/workflows/deploy.yml（固定 /coursequest）
//   - GitLab CI：見 .gitlab-ci.yml（用 $CI_PROJECT_NAME 動態帶入，
//     詳細說明見 GITLAB_DEPLOY.md）
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // 避免 Turbopack 誤把使用者家目錄下無關的 package-lock.json 當成 workspace root。
  turbopack: {
    root: path.join(__dirname),
  },
  // 純靜態匯出：GitHub Pages / GitLab Pages 都只能放靜態檔案，沒有 Node.js
  // 伺服器可以跑 Next.js 的 SSR。這個專案本來就全部是 client component +
  // localStorage，沒有用到任何伺服器功能，所以可以直接匯出成靜態 HTML/CSS/JS。
  output: "export",
  images: { unoptimized: true },
  ...(basePath && {
    basePath,
    assetPrefix: basePath,
  }),
};

export default nextConfig;
