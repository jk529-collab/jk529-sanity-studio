# JK529 自訂 Sanity Studio

此專案是獨立部署於 `studio.jk529.com.tw` 的內容工作台，使用 Sanity project `qn9shm4c` 與 dataset `production`。它不會覆寫既有 `jk529.com.tw` 前台或其 Vercel 301 redirects。

## 編輯流程

編輯員在「網站頁面／文章／商品」中找到文件，在「編輯」分頁填入結構化內容，切換「內容畫布」檢查區塊層級，最後於「SEO」檢查標題、slug 與 meta description。草稿與發布使用 Sanity 內建工作流。

## 商務邊界

Sanity 管理內容、商品文案、圖片與 SEO。會員、價格真相、庫存、購物車、訂單、付款與物流事件必須放在獨立商務後端。商品文件以 `commerceProductId` 對應後端，方便日後接入數位鎏或其他支付／物流 adapter。

## 本機與 Vercel

```bash
npm install
npm run dev
```

第一次執行 CLI 時，請使用有 `qn9shm4c` project 存取權的 Sanity 帳號登入。將資料夾推送至新 GitHub repo 後，Vercel 匯入 repo、執行 `npm run build`、發佈 `dist`，再將 `studio.jk529.com.tw` 綁定到 Vercel project。
