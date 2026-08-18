# Cursor 快速推送 GitHub

這個專案壓縮包已保留 `.git` 資料夾、`main` 分支與既有提交紀錄。解壓後不要執行 `git init`，直接以 Cursor 開啟資料夾即可。

## 只需三步

1. 在擁有 `JK529-合作` 權限的 GitHub 帳號建立一個**空白** repository，建議名稱為 `jk529-sanity-studio`。建立時不要勾選 README、`.gitignore` 或 License。
2. 將壓縮包解壓後，用 Cursor 開啟 `jk529-sanity-studio` 資料夾，按 ``Ctrl+` `` 開啟 Cursor 終端機。
3. 將下列兩行貼到終端機。把 `<GITHUB_OWNER>` 換成 GitHub 網址上的擁有者名稱。

```bash
git remote add origin https://github.com/<GITHUB_OWNER>/jk529-sanity-studio.git
git push -u origin main
```

若 GitHub 要求登入，依畫面選擇擁有 `JK529-合作` 權限的帳號即可。推送成功後，到 Vercel 以 **Add New → Project** 匯入這個 repository；設定 Build Command 為 `npm run build`、Output Directory 為 `dist`。

詳細的網域、Sanity CORS 與收尾操作請看同一資料夾的 `DEPLOYMENT_HANDOFF.md`。
