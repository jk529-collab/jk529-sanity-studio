# JK529 Sanity Studio 部署交接

這份交接包對應 Sanity project `qn9shm4c` 與 dataset `production`。Studio 是獨立後台，目標正式網址為 `studio.jk529.com.tw`；它不會覆寫目前的 `jk529.com.tw` Astro 前台。

## 已完成的技術驗證

| 項目 | 狀態 |
|---|---|
| Sanity 預覽來源 CORS | 已加入暫時預覽網址，且已開啟 credentials |
| TypeScript 檢查 | 通過 |
| Vitest | 4/4 通過 |
| Sanity production build | 通過，輸出資料夾為 `dist/` |
| Git 版本 | `main`，最新提交 `90c3a3f` |

## 由專案帳號完成的最少操作

請使用**擁有 GitHub repository 與 Vercel project 權限的帳號**，而非 Manus 的登入帳號，依序完成以下步驟。

1. 在 GitHub 建立空白的 private repository，名稱建議為 `jk529-sanity-studio`。將本交接包解壓後的內容推送到 `main` 分支；不要上傳 `node_modules`、`dist` 或 `.sanity`。
2. 在 Vercel 使用 **Add New → Project** 匯入該 GitHub repository。設定 Build Command 為 `npm run build`，Output Directory 為 `dist`，然後部署。此 Studio 不需要新增環境變數。
3. 在 Vercel 的 Domains 將 `studio.jk529.com.tw` 綁定到此 project，依 Vercel 顯示的 DNS 記錄完成網域驗證。
4. 在 Sanity Manage 的 project `jk529 cms` 前往 **API → CORS origins**，新增 `https://studio.jk529.com.tw` 並勾選 **Allow credentials**。接著在 **Studios** 將同一正式網址登記為 Studio。
5. 以編輯員帳號開啟正式 Studio，建立一筆測試文章，確認「編輯」、「內容畫布」及「SEO」三個視圖可使用。驗證完成後刪除測試文章。
6. 正式網址無誤後，回到 **API → CORS origins** 刪除暫時的 `https://3333-iuh4uqqgqyitg9rkbarf4-51195bad.sg1.manus.computer` 來源。

## 商務整合邊界

Sanity Studio 只管理內容、商品文案、媒體與 SEO。會員、庫存、價格真相、購物車、訂單、付款與超商／宅配物流事件應由獨立商務後端負責。商品 schema 已保留 `commerceProductId`、規格與配送方式欄位，讓後續可接入數位鎏或其他可替換的金流／物流 adapter。
