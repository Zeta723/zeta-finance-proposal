# Zeta 財務提案生成器

> Zeta｜錢與人生的整理室 — 讓財務顧問快速製作客戶專屬提案，並匯出可繼續編輯的 PowerPoint。

一套純前端（React + TypeScript + Vite）的財務提案編輯工具。目前資料儲存在瀏覽器 localStorage，
不需要後端伺服器即可使用；程式架構已預留未來串接 Supabase / Firebase / 自建 API 的擴充空間
（見 `src/services/storageService.ts` 的 `IProposalStorage` 介面）。

---

## 功能總覽（v2 更新）

- 建立、搜尋、複製、重新命名、刪除多份提案
- **7 種頁面類型**：封面、資產配置圖、Before & After、**收入與帳戶分配圖（新）**、建議書／方案、結論／下一步、自訂主題頁
- 每種頁面類型的模板現在都是**真正獨立的版面**（獨立 React 元件、獨立 PPT/PDF 匯出邏輯），不是換色或換名的同一份排版：
  - 資產配置圖：左圖右表／上圖下卡片／數據儀表板
  - Before & After：雙圓餅圖對照／左右卡片對照／**資產成長折線比較圖（新，真正的XY折線圖）**
  - 收入與帳戶分配圖（新）：資金流向圖／樹狀帳戶圖／分配卡片圖
  - 建議書：數據重點版／顧問建議卡片版
  - 結論：三步驟行動版／溫暖結語與聯絡資訊版
  - 模板選擇畫面顯示「即時渲染」的縮圖（不是通用圖示），確保縮圖與實際版面一致
- 折線比較圖支援自動試算（起始資產／報酬率／投入金額／複利）與手動輸入兩種模式，可加入目標參考線
- 收入與帳戶分配圖支援大項目＋小項目兩層結構，自動計算尚未分配／超額分配金額（不會因為金額不相等而報錯）
- 拖曳調整頁面順序（`@dnd-kit`）、複製頁面、隱藏頁面（隱藏頁不會被匯出）；切換模板只改變排版、絕不清空已輸入的文字/圖片/數據
- 結構化 Rich Text 編輯（`Tiptap`）：粗體、斜體、底線、刪除線、顏色、背景標記、對齊、清單、「設為重點」快捷鍵 — 局部格式完整保留到可編輯PPT／Keynote相容PPT／PDF
- 即時 16:9 預覽、完整簡報播放模式、縮放
- 復原／重做（最近 20 步）
- 自動儲存 + 手動儲存，儲存中／已儲存／儲存失敗狀態顯示
- **三種匯出選項**：
  1. **可編輯PowerPoint** — 文字/形狀/表格保持可編輯，資產配置圖、雙圓餅圖等使用 PowerPoint 原生圖表
  2. **Keynote相容PowerPoint** — 標題/文字/簡單形狀仍可編輯；圓餅圖、環形圖、長條圖、折線圖、資金流向圖／樹狀圖一律轉為高解析度 PNG（2.5–3倍解析度），避免 Keynote 匯入原生 Chart Part 時圖表消失
  3. **PDF** — 使用離螢幕 16:9 高解析度容器（非畫面上縮小的預覽截圖）逐頁渲染後產生，含匯出進度顯示
- 匯出前資料檢查 Modal：列出缺少的內容，可選擇返回補充或仍然繼續匯出
- 匯出／匯入單一提案 JSON、匯出／匯入全部備份 JSON
- 圖片上傳自動壓縮，避免 localStorage 容量爆滿
- 資料格式版本化（schemaVersion）與升級前自動備份，舊提案不會因為新增欄位而消失或損毀
- 內建可刪除的示範提案（王小明．個人資產配置與退休規劃），涵蓋全部 7 種頁面類型與新版型
- 響應式：手機/平板以分頁（頁面／預覽／編輯）取代三欄式版面


## 技術架構

| 用途 | 套件 |
| --- | --- |
| 框架 | React 18 + TypeScript + Vite |
| 樣式 | Tailwind CSS（品牌色已註冊為 theme tokens，見 `tailwind.config.ts` / `src/styles/theme.ts`） |
| PDF 匯出 | jsPDF + html-to-image（離螢幕高解析度渲染） |
| 圖表匯出（Keynote相容） | Canvas 2D 手繪渲染（`export/chartRenderer.ts`），輸出高解析度 PNG |
| 拖曳排序 | @dnd-kit |
| 結構化文字編輯 | Tiptap |
| 圖表預覽 | Recharts |
| 圖示 | lucide-react |
| 本機儲存 | localStorage（封裝於 `storageService.ts`） |

### 資料夾結構

```
src/
  types/            # 所有 TypeScript 介面（Proposal, ProposalSlide, RichTextContent...）
  styles/theme.ts   # 品牌 Theme Tokens，網頁與 PPT 匯出共用
  services/         # storageService（localStorage 封裝）、imageService（圖片壓縮）
  store/            # useProposalEditor：提案編輯狀態、復原/重做、自動儲存
  hooks/            # useUndoRedo
  data/             # 各頁面類型的預設資料、Template Registry（LAYOUTS_BY_TYPE）、示範提案
  services/
    storageService.ts        # localStorage 封裝 + 資料版本遷移
    imageService.ts           # 圖片壓縮
    lineComparisonCalc.ts     # 折線比較圖自動試算引擎
    accountAllocationLayout.ts # 資金流向圖／樹狀圖的純座標計算（網頁SVG與PNG匯出共用）
  components/
    common/         # Modal / Toast / ConfirmDialog / EmptyState / ErrorBoundary
    richtext/       # RichTextEditor（Tiptap）、RichTextView（唯讀渲染）
    home/           # 提案列表首頁
    editor/         # 三欄式編輯器、Template縮圖、匯出選單、匯出進度視窗
    slides/<type>/  # 各頁面類型的網頁預覽元件 —— 每個 templateId 對應一個獨立元件檔案
    preview/        # SlideRenderer：依 slide.type 分派到對應頁面類型的分派器元件
  export/
    pptxHelpers.ts        # 共用 PPT 工具（RichText 轉換、金額格式、頁首頁尾…）
    pptxExport.ts         # 匯出流程主控：exportProposalToPptx（可編輯）／exportProposalToKeynotePptx
    pdfExport.ts           # PDF 匯出：離螢幕渲染 + jsPDF 分頁
    chartRenderer.ts       # Canvas 圖表轉 PNG 工具（Keynote相容匯出、PDF共用）
    ExportRenderContext.tsx # 標記「匯出離螢幕渲染中」，讓圖表元件關閉動畫
    slideExporters/<type>.ts  # 各頁面類型對應的 PptxGenJS 匯出函式，內部依 layoutId 分派到對應版面
```

## 模板架構（Template Registry）

每個頁面類型底下的模板定義集中在 `src/data/slideDefaults.ts` 的 `LAYOUTS_BY_TYPE`，每筆包含
`id`／`name`／`description`／`useCase`／`features`。這個 `id`（存在資料裡的欄位名稱是
`layoutId`）是整個系統唯一用來決定「要 render 哪個版面」的依據：

- 網頁預覽：`components/preview/SlideRenderer.tsx` 依 `slide.type` 分派到對應頁面類型的
  分派器元件（例如 `AssetAllocationSlide.tsx`），分派器再依 `slide.layoutId` switch 到
  真正獨立的版面元件（例如 `AssetAllocationLeftChartRightTable.tsx`）。
- PPT／PDF 匯出：`export/slideExporters/<type>.ts` 內部同樣依 `slide.layoutId` switch 到
  獨立的匯出函式，版面座標、圖表位置、卡片數量都是各自獨立撰寫，不共用同一份 render 邏輯。
- 模板縮圖：`components/editor/TemplateThumbnail.tsx` 直接用該頁面類型的預設範例資料即時
  渲染出縮小版真實畫面，不是通用圖示，新增/修改版型時縮圖會自動同步更新。

切換模板只會更新 `layoutId` 這一個欄位，`slide.data`（使用者輸入的文字/圖片/數據）完全不受影響。

---

## 安裝與啟動

需要 Node.js 18 以上版本。

```bash
# 1. 安裝套件
npm install

# 2. 啟動開發伺服器（預設 http://localhost:5173）
npm run dev

# 3. 建置正式版
npm run build

# 4. 本機預覽建置結果
npm run preview
```

> **注意**：此專案是在沒有網路存取權限的沙盒環境中撰寫完成，因此無法在該環境內執行
> `npm install` 實際下載套件與完整 `npm run build` 驗證。程式碼已逐檔案通過語法檢查
> （TypeScript 語法、JSX 結構、括號配對），但仍請在你本機或 CI 環境跑過一次
> `npm install && npm run build`，確認沒有版本相依性問題。若遇到型別錯誤，多半是
> 套件版本差異造成，可以對照 `package.json` 內註明的版本調整。

## 部署

### GitHub Pages（已設定好，推送到 main 即自動部署）

本專案已內建 GitHub Actions workflow（`.github/workflows/deploy.yml`），設定對應：

- GitHub 使用者名稱：`zeta723`
- Repository 名稱：`zeta-finance-proposal`
- 上線網址：`https://zeta723.github.io/zeta-finance-proposal/`

設定步驟：

1. 把這個專案推上 GitHub，repository 名稱請務必設為 `zeta-finance-proposal`
   （若要用別的名稱，記得同步修改 `vite.config.ts` 的 `base` 路徑）。
2. 到 repository 的 **Settings → Pages**，「Build and deployment」的 **Source** 選擇
   **GitHub Actions**（不是 "Deploy from a branch"）。
3. 推送到 `main` 分支後，workflow 會自動執行 `npm ci` → `npm run build` →
   把 `dist/` 部署到 GitHub Pages；也可以在 Actions 頁面手動觸發
   （`workflow_dispatch`）。
4. 部署完成後即可透過 `https://zeta723.github.io/zeta-finance-proposal/` 開啟網站。

`vite.config.ts` 的 `base` 已設定為 `/zeta-finance-proposal/`，確保建置出來的資源
路徑（JS/CSS/字型等）在 `https://zeta723.github.io/zeta-finance-proposal/` 這個子路徑
下能正確載入，不會出現資源 404。

> 本專案沒有使用 React Router 或任何客戶端路由套件 —— 畫面切換（提案列表 ↔
> 編輯器）是用單純的 React state 控制，並沒有對應到不同的網址路徑。因此不會有
> GitHub Pages 常見的「重新整理後 404」問題（那個問題只發生在使用路徑式路由、
> 讓伺服器需要處理任意路徑的情況），這裡不需要、也沒有加入 HashRouter。

### Vercel（替代方案）

1. 將專案推上 GitHub。
2. 到 [vercel.com](https://vercel.com) 匯入該 repository。
3. Framework Preset 選擇 **Vite**；Build Command 為 `npm run build`；Output Directory 為 `dist`。
4. 部署完成後即可透過 Vercel 網域使用。
5. 注意：Vercel 部署在自訂網域或根路徑時，`vite.config.ts` 目前的
   `base: '/zeta-finance-proposal/'` 是針對 GitHub Pages 子路徑設定的；若要同時部署到
   Vercel 根路徑，需要另外用環境變數區分 base（例如依 `process.env.GITHUB_ACTIONS`
   切換 `base` 為 `'/'`），或維護兩份設定。

---

## 資料儲存與未來擴充

所有提案資料透過 `IProposalStorage` 介面存取（目前實作為 `LocalStorageProposalService`）。
若要之後串接 Supabase / Firebase / 自建 API，只需要：

1. 新增一個實作 `IProposalStorage` 介面的新 class（例如 `SupabaseProposalService`）。
2. 在 `src/services/storageService.ts` 把匯出的 `proposalStorage` 換成新的實例。
3. UI 層（`ProposalListPage`、`EditorPage` 等）完全不需要修改。

## 圖片與 localStorage 容量

- 上傳圖片會自動壓縮（最長邊 1280px、JPEG 品質 0.72）後轉為 base64 存入提案資料。
- 單張圖片壓縮後仍超過約 600KB 時，會顯示提示。
- `estimateLocalStorageUsageBytes()`（`imageService.ts`）可用於未來加入「容量用量顯示」功能。
- 大量圖片仍可能造成瀏覽器 localStorage 容量不足；`storageService.saveProposal` 在寫入失敗時
  會拋出例外，UI 會顯示「儲存失敗」狀態，不會讓頁面白屏。

## Keynote 相容性說明

**問題根因**：PowerPoint 原生 Chart Part（PptxGenJS 的 `s.addChart()`）在 Apple Keynote
匯入時支援不完整，常見狀況是圖表物件被靜默捨棄，其餘文字與形狀正常顯示。

**解法**：「Keynote相容PowerPoint」匯出模式（`exportProposalToKeynotePptx`）一律不使用
`s.addChart()`。所有圓餅圖／環形圖／長條圖／折線圖／資金流向圖／樹狀圖改用
`export/chartRenderer.ts` 的 Canvas 2D 手繪函式產生固定尺寸、2.5–3倍解析度的 PNG，
再以 `addImage` 嵌入投影片。標題、內文、重點文字、頁碼、簡單矩形/線條仍是原生
PowerPoint 文字/形狀物件，保持可編輯。「可編輯PowerPoint」模式則優先使用原生圖表
以保留在 PowerPoint 內的可編輯性；折線圖與資金流向圖／樹狀圖因結構複雜，兩種模式
皆使用 PNG（PptxGenJS 原生折線圖同樣有 Keynote 相容性風險，且難以精準還原多線+目標線的樣式）。

## PDF 匯出說明

`export/pdfExport.ts` 會為每一張未隱藏的頁面建立一個離螢幕、固定 1280×720（16:9）的
容器（不是擷取畫面上縮小後的預覽），等待字型與圖片載入完成、關閉圖表動畫
（`ExportRenderContext`）後，用 `html-to-image` 以 2.5 倍解析度截圖，再用 `jsPDF`
依序加入每一頁。匯出過程會回報進度，UI 會顯示進度視窗。

## 資料相容性與版本遷移

`src/services/storageService.ts` 內的 `migrateProposalIfNeeded()` 在讀取到
`schemaVersion` 低於目前版本的舊提案時：
1. 先在另一個 key 寫入一份升級前的原始快照備份，絕不直接覆蓋或清除原始資料。
2. 補上 v2 新增但缺少的欄位（如 `themeSettings`）安全預設值。
3. 任何一步出錯就直接回傳未升級的原始資料，確保升級流程本身不會造成資料遺失。

v1 → v2 的欄位變更都是「純新增」（新增 `accountAllocation` 頁面類型、
`BeforeAfterData.lineComparison` 可選欄位），沒有刪除或改名任何既有欄位，
所以理論上 v1 資料本來就能被 v2 的型別結構安全讀取；上述遷移機制是額外的防呆保護。

## 已知限制／尚未完成的功能

請參閱下方「驗收清單」章節，或聊天紀錄中的完成度說明。主要包括：

- 建議書、結論頁提供 2 種版型（規格書允許 2–3 種，本輪聚焦在把既有版型改到「真正不同」，暫未新增第 3 種）。
- Before & After 現在有 3 種真正不同的版型（雙圓餅圖／左右卡片對照／折線比較圖），已補齊規格要求的折線圖模板。
- 資金流向圖與樹狀帳戶圖在兩種 PPT 匯出模式下都轉成 PNG（因結構複雜、連接線粗細動態變化，難以用原生形狀精準還原）；圖中的大項目/小項目文字金額在「資金流向圖」版型會額外疊加一層可編輯文字方塊，但圖形本身不可在 PowerPoint/Keynote 內編輯線條。分配卡片圖版型則完全使用原生可編輯形狀。
- PDF 匯出的折線圖／資產配置圖等 Recharts 圖表已停用動畫（`ExportRenderContext`），但 SVG 資金流向圖／樹狀圖（純 SVG 繪製、無 Recharts 動畫）未特別處理，理論上無動畫問題。
- 圖片裁切工具（自由裁切）尚未實作，目前僅支援 contain/cover 縮放與圓角/圓形樣式。
- 尚未加入「本機儲存容量用量」的視覺化提示 UI（後端函式已提供，欠缺畫面）。
- 尚未在此沙盒環境中實際執行 `npm install` / `npm run build` 驗證（見上方安裝說明的注意事項）——本輪一樣以逐檔語法檢查、括號配對、import/export symbol 對照取代，仍強烈建議在有網路的環境跑一次完整 build。

## 授權

內部工具範例，未附加開源授權條款；請依 Zeta 品牌內部使用規範調整。
