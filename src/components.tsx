import type {UserViewComponent} from 'sanity/structure'

type DocumentData = {
  title?: string
  slug?: {current?: string}
  sections?: Array<{_key?: string; _type?: string; heading?: string; title?: string; children?: Array<{text?: string}>}>
  body?: Array<{_key?: string; _type?: string; heading?: string; title?: string; children?: Array<{text?: string}>}>
  content?: Array<{_key?: string; _type?: string; heading?: string; title?: string; children?: Array<{text?: string}>}>
  excerpt?: string
  seo?: {metaTitle?: string; metaDescription?: string; noIndex?: boolean}
}

const labels: Record<string, string> = {heroSection: '首屏主視覺', richTextSection: '圖文內容', imageSection: '圖片／圖集', callToActionSection: 'CTA 行動按鈕', productCalloutSection: '商品卡', faqSection: '常見問題', block: '文字段落', image: '圖片'}

export const ContentCanvas: UserViewComponent = ({document, schemaType}) => {
  const value = (document.displayed ?? {}) as DocumentData
  const blocks = value.sections ?? value.body ?? value.content ?? []
  const schemaName = schemaType.name
  const canvasKind = schemaName === 'product' ? '商品頁編排' : schemaName === 'article' ? '文章編排' : '頁面編排'
  return <main className="editorial-canvas"><header className="canvas-header"><span>內容畫布</span><small>{canvasKind}</small></header><section className="canvas-document"><div className="canvas-kicker">草稿視覺摘要</div><h1>{value.title || '尚未命名內容'}</h1><p className="canvas-slug">/{value.slug?.current || '設定網址 slug'}</p><div className="canvas-rule" />{blocks.length === 0 ? <div className="canvas-empty">尚未加入內容區塊。請切換到「編輯」分頁，從內容區塊欄位新增首屏、圖文、CTA、商品卡或 FAQ。</div> : <ol className="canvas-block-list">{blocks.map((block, index) => <li key={block._key ?? `${block._type}-${index}`}><span className="canvas-index">{String(index + 1).padStart(2, '0')}</span><div><strong>{labels[block._type ?? ''] ?? block._type ?? '內容區塊'}</strong><p>{block.heading || block.title || '此區塊已加入內容流程。'}</p></div></li>)}</ol>}</section><footer className="canvas-footer">此檢視為編輯員的結構確認畫布；正式網站預覽會在前台部署後串接。</footer></main>
}

export const SeoChecklist: UserViewComponent = ({document}) => {
  const value = (document.displayed ?? {}) as DocumentData
  const metaTitle = value.seo?.metaTitle || value.title || ''
  const metaDescription = value.seo?.metaDescription || value.excerpt || ''
  const checks = [{label: '標題', ready: Boolean(value.title), detail: value.title ? `${value.title.length} 字元` : '請填寫內容標題'}, {label: '網址 slug', ready: Boolean(value.slug?.current), detail: value.slug?.current ? `/${value.slug.current}` : '請設定網址'}, {label: 'SEO 標題', ready: Boolean(metaTitle), detail: metaTitle ? `${metaTitle.length}/60 建議字元` : '請填寫 SEO 標題'}, {label: 'Meta description', ready: Boolean(metaDescription), detail: metaDescription ? `${metaDescription.length}/160 建議字元` : '請填寫搜尋摘要'}]
  return <main className="seo-panel"><header><span>SEO 檢查</span><p>發布前確認可索引內容的基本結構。</p></header><ul>{checks.map((check) => <li key={check.label} className={check.ready ? 'is-ready' : 'is-missing'}><i /><div><strong>{check.label}</strong><small>{check.detail}</small></div></li>)}</ul>{value.seo?.noIndex && <p className="seo-warning">此內容目前設定為禁止搜尋引擎索引。</p>}</main>
}
