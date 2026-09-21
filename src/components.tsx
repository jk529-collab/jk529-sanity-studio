import {useEffect, useMemo, useState, type DragEvent} from 'react'
import {useClient, useDocumentOperation} from 'sanity'
import type {UserViewComponent} from 'sanity/structure'

type ImageValue = {asset?: {_ref?: string; _type?: string}; alt?: string}
type CanvasBlock = {
  _key?: string
  _type?: string
  heading?: string
  title?: string
  eyebrow?: string
  summary?: string
  body?: string | Array<{_key?: string; _type?: string; children?: Array<{_key?: string; _type?: string; text?: string; marks?: string[]}>}>
  children?: Array<{_key?: string; _type?: string; text?: string; marks?: string[]}>
  image?: ImageValue
  asset?: {_ref?: string}
  alt?: string
  caption?: string
  layout?: string
  label?: string
  url?: string
  ctaLabel?: string
  ctaUrl?: string
  product?: {_ref?: string; _type?: string}
  products?: Array<{_ref?: string; _type?: string}>
  images?: ImageValue[]
  columns?: number
  showCaptions?: boolean
  showVariants?: boolean
  showCommercePrice?: boolean
  addToCartLabel?: string
  buyNowLabel?: string
  emptyMessage?: string
  checkoutLabel?: string
  cartPath?: string
  placeholder?: string
  buttonLabel?: string
  submitLabel?: string
  submitPath?: string
  searchPath?: string
  cardActionLabel?: string
  beforeImage?: ImageValue
  afterImage?: ImageValue
  beforeLabel?: string
  afterLabel?: string
  description?: string
  plans?: Array<{_key?: string; name?: string; price?: string; description?: string; featured?: boolean; ctaLabel?: string}>
  cases?: Array<{_key?: string; title?: string; client?: string; summary?: string; image?: ImageValue}>
  quote?: string
  name?: string
  role?: string
  rating?: number
  testimonials?: Array<{_key?: string; quote?: string; name?: string; role?: string; rating?: number}>
  lineUrl?: string
  qrCode?: ImageValue
  videoFile?: unknown
  poster?: ImageValue
  autoplay?: boolean
  html?: string
  css?: string
  scriptAllowed?: boolean
  style?: {theme?: string; align?: string; width?: string; spacing?: string; variant?: string; fontFamily?: string; fontSize?: string; fontWeight?: string; textAlign?: string; textDecoration?: string; textColor?: string; backgroundColor?: string; borderColor?: string; borderStyle?: string; borderWidth?: string; borderRadius?: string}
  overrideSummary?: string
  items?: Array<{_key?: string; question?: string; answer?: string; quote?: string; name?: string; role?: string; rating?: number}>
}

type DocumentData = {
  _id?: string
  title?: string
  slug?: {current?: string}
  sections?: CanvasBlock[]
  body?: CanvasBlock[]
  content?: CanvasBlock[]
  excerpt?: string
  editorialNotes?: string
  seo?: {metaTitle?: string; metaDescription?: string; noIndex?: boolean}
}

type MediaAsset = {_id: string; url?: string; originalFilename?: string}
type ProductOption = {_id: string; title?: string; summary?: string}
type PreviewMode = 'desktop' | 'mobile'

const labels: Record<string, string> = {
  heroSection: '首屏主視覺', richTextSection: '圖文內容', imageSection: '圖片／圖集',
  callToActionSection: 'CTA 行動按鈕', productCalloutSection: '商品卡', faqSection: '常見問題',
  block: '文字段落', image: '圖片', mediaGallerySection: '媒體圖庫',
  productGridSection: '商品列表', productDetailSection: '商品詳情', cartSection: '購物車入口', storeSearchSection: '商店搜尋',
  beforeAfterSection: 'Before／After 對照', pricingSection: '方案報價', quoteFormSection: '估價彈窗／智能表單', caseStudySection: '案例展示', testimonialSection: '真實客戶回饋', lineContactSection: 'LINE 聯繫入口', videoSection: '影片', htmlCssSection: 'HTML／CSS 進階區塊',
}

const createKey = () => Math.random().toString(36).slice(2, 10)
const portableBlock = (text = ''): CanvasBlock => ({
  _key: createKey(), _type: 'block', style: 'normal', markDefs: [],
  children: [{_key: createKey(), _type: 'span', marks: [], text}],
} as CanvasBlock)

const sectionFieldFor = (schemaName: string) => schemaName === 'sitePage' ? 'sections' : schemaName === 'article' ? 'body' : 'content'
const plainText = (block: CanvasBlock) => {
  const source = block._type === 'block' ? [block] : Array.isArray(block.body) ? block.body : []
  return source.map((item) => item.children?.map((child) => child.text ?? '').join('') ?? '').filter(Boolean).join('\n')
}
const imageRef = (block: CanvasBlock) => block.image?.asset?._ref ?? block.asset?._ref
const sectionTitle = (block: CanvasBlock) => block.heading || block.title || block.caption || plainText(block).slice(0, 72) || '尚未命名區塊'

const newBlock = (type: string): CanvasBlock => {
  const key = createKey()
  const templates: Record<string, CanvasBlock> = {
    heroSection: {_key: key, _type: 'heroSection', eyebrow: '新段落', heading: '在這裡寫下主要訊息', summary: '用一段簡短摘要說明這個區塊的價值。'},
    richTextSection: {_key: key, _type: 'richTextSection', heading: '區塊標題', body: [portableBlock('在這裡開始撰寫內容。') as any]},
    imageSection: {_key: key, _type: 'imageSection', caption: '圖片說明', layout: 'content'},
    callToActionSection: {_key: key, _type: 'callToActionSection', heading: '引導讀者採取下一步', body: '補充一段行動說明。', label: '立即了解', url: 'https://'},
    productCalloutSection: {_key: key, _type: 'productCalloutSection', label: '查看商品', overrideSummary: '選擇要推薦的商品。'},
    productGridSection: {_key: key, _type: 'productGridSection', heading: '熱門商品', summary: '挑選你喜歡的商品。', columns: 3, cardActionLabel: '查看商品'},
    productDetailSection: {_key: key, _type: 'productDetailSection', showVariants: true, showCommercePrice: true, addToCartLabel: '加入購物車', buyNowLabel: '立即購買'},
    cartSection: {_key: key, _type: 'cartSection', heading: '你的購物車', emptyMessage: '購物車目前是空的。', checkoutLabel: '前往結帳', cartPath: '/cart'},
    mediaGallerySection: {_key: key, heading: '媒體圖庫', _type: 'mediaGallerySection', images: [], columns: 3, showCaptions: true},
    storeSearchSection: {_key: key, _type: 'storeSearchSection', placeholder: '搜尋商品', buttonLabel: '搜尋', searchPath: '/search'},
    beforeAfterSection: {_key: key, _type: 'beforeAfterSection', heading: '改變前後', beforeLabel: 'Before', afterLabel: 'After'},
    pricingSection: {_key: key, _type: 'pricingSection', heading: '選擇適合你的方案', plans: [{_key: createKey(), name: '基礎方案', price: 'NT$ 0', description: '方案說明', ctaLabel: '選擇方案'}]},
    quoteFormSection: {_key: key, _type: 'quoteFormSection', heading: '取得專屬報價', buttonLabel: '立即估價', submitLabel: '送出需求', submitPath: '/api/quote'},
    caseStudySection: {_key: key, _type: 'caseStudySection', heading: '成功案例', cases: []},
    testimonialSection: {_key: key, _type: 'testimonialSection', heading: '客戶怎麼說', items: [{_key: createKey(), quote: '在這裡放入客戶回饋。', name: '客戶姓名', role: '職稱／公司', rating: 5}]},
    lineContactSection: {_key: key, _type: 'lineContactSection', heading: '需要協助嗎？', summary: '透過 LINE 與我們聯繫。', buttonLabel: '加入 LINE 好友'},
    videoSection: {_key: key, _type: 'videoSection', heading: '影片', caption: '影片說明', autoplay: false},
    htmlCssSection: {_key: key, _type: 'htmlCssSection', label: '進階自訂區塊', html: '<div>自訂內容</div>', css: ''},
    faqSection: {_key: key, _type: 'faqSection', heading: '常見問題', items: [{_key: createKey(), question: '常見問題', answer: '在此補上回答。'}]},
    block: portableBlock('在這裡開始撰寫內容。'),
    image: {_key: key, _type: 'image', alt: ''},
  }
  return templates[type]
}

const allowedBlocks = (schemaName: string) => schemaName === 'sitePage'
  ? ['heroSection', 'richTextSection', 'imageSection', 'mediaGallerySection', 'callToActionSection', 'productCalloutSection', 'productGridSection', 'productDetailSection', 'cartSection', 'storeSearchSection', 'beforeAfterSection', 'pricingSection', 'quoteFormSection', 'caseStudySection', 'testimonialSection', 'lineContactSection', 'videoSection', 'htmlCssSection', 'faqSection']
  : schemaName === 'article'
    ? ['block', 'image', 'callToActionSection', 'productCalloutSection']
    : ['block', 'image']

const mediaLabel = (asset: MediaAsset) => asset.originalFilename || asset._id.replace('image-', '').slice(0, 18)

export const CanvasEditor: UserViewComponent = ({document, documentId, schemaType}) => {
  const value = (document.displayed ?? {}) as DocumentData
  const contentField = sectionFieldFor(schemaType.name)
  const sourceBlocks = (value[contentField as keyof DocumentData] ?? []) as CanvasBlock[]
  const [blocks, setBlocks] = useState<CanvasBlock[]>(sourceBlocks)
  const [title, setTitle] = useState(value.title ?? '')
  const [selectedKey, setSelectedKey] = useState<string | undefined>(sourceBlocks[0]?._key)
  const [draggingKey, setDraggingKey] = useState<string | undefined>()
  const [activeInspector, setActiveInspector] = useState<'content' | 'style'>('content')
  const [showLibrary, setShowLibrary] = useState(false)
  const [showMedia, setShowMedia] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [frontendUrl, setFrontendUrl] = useState('https://jk529.com.tw')
  const [saveState, setSaveState] = useState<'idle' | 'saving'>('idle')
  const client = useClient({apiVersion: '2024-06-01'})
  const publishedId = documentId.replace(/^drafts\./, '')
  const operations = useDocumentOperation(publishedId, schemaType.name)

  useEffect(() => {
    setBlocks(sourceBlocks)
    setTitle(value.title ?? '')
    if (!selectedKey || !sourceBlocks.some((block) => block._key === selectedKey)) setSelectedKey(sourceBlocks[0]?._key)
  }, [documentId, value.title, JSON.stringify(sourceBlocks)])

  useEffect(() => {
    let active = true
    client.fetch<MediaAsset[]>('*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...30]{_id, url, originalFilename}')
      .then((items) => active && setMedia(items))
      .catch(() => active && setMedia([]))
    client.fetch<ProductOption[]>('*[_type == "product"] | order(_updatedAt desc)[0...50]{_id, title, summary}')
      .then((items) => active && setProducts(items))
      .catch(() => active && setProducts([]))
    client.fetch<{frontendUrl?: string}>('*[_id == "siteSettings"][0]{frontendUrl}')
      .then((settings) => active && settings?.frontendUrl && setFrontendUrl(settings.frontendUrl))
      .catch(() => undefined)
    return () => { active = false }
  }, [client])

  const mediaById = useMemo(() => new Map(media.map((item) => [item._id, item])), [media])
  const selected = blocks.find((block) => block._key === selectedKey) ?? blocks[0]
  const selectedIndex = selected ? blocks.indexOf(selected) : -1

  const patch = (set: Record<string, unknown>) => {
    setSaveState('saving')
    ;(operations.patch as any).execute([{set}])
    window.setTimeout(() => setSaveState('idle'), 550)
  }
  const saveBlocks = (next: CanvasBlock[]) => {
    setBlocks(next)
    patch({[contentField]: next})
  }
  const updateBlock = (key: string, changes: Partial<CanvasBlock>) => saveBlocks(blocks.map((block) => block._key === key ? {...block, ...changes} : block))
  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length || from === to) return
    const next = [...blocks]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    saveBlocks(next)
    setSelectedKey(moved._key)
  }
  const addBlock = (type: string) => {
    const next = [...blocks, newBlock(type)]
    saveBlocks(next)
    setSelectedKey(next.at(-1)?._key)
    setShowLibrary(false)
  }
  const removeBlock = (key: string) => {
    const next = blocks.filter((block) => block._key !== key)
    saveBlocks(next)
    setSelectedKey(next[0]?._key)
  }
  const duplicateBlock = (key: string) => {
    const source = blocks.find((block) => block._key === key)
    if (!source) return
    const copy = {...source, _key: createKey()}
    const index = blocks.findIndex((block) => block._key === key)
    const next = [...blocks]
    next.splice(index + 1, 0, copy)
    saveBlocks(next)
    setSelectedKey(copy._key)
  }
  const updatePortable = (block: CanvasBlock, text: string) => {
    if (block._type === 'block') {
      const span = block.children?.[0]
      updateBlock(block._key!, {children: [{_key: span?._key ?? createKey(), _type: 'span', marks: span?.marks ?? [], text}]})
      return
    }
    updateBlock(block._key!, {body: [portableBlock(text) as any]})
  }
  const setImage = (asset: MediaAsset) => {
    if (!selected) return
    if (selected._type === 'mediaGallerySection') {
      const images = selected.images ?? []
      if (images.some((image) => image.asset?._ref === asset._id)) return
      updateBlock(selected._key!, {images: [...images, {asset: {_type: 'reference', _ref: asset._id}, alt: ''}]})
      return
    }
    const image = {asset: {_type: 'reference', _ref: asset._id}, alt: selected.image?.alt ?? selected.alt ?? ''}
    updateBlock(selected._key!, selected._type === 'image' ? {asset: image.asset, alt: image.alt} : {image})
    setShowMedia(false)
  }
  const openFrontendPreview = () => {
    const base = frontendUrl.replace(/\/$/, '')
    const slug = value.slug?.current ? `/${value.slug.current.replace(/^\//, '')}` : '/'
    window.open(`${base}${slug}?preview=1`, '_blank', 'noopener,noreferrer')
  }

  return <main className="canvas-editor">
    <header className="canvas-editor__topbar">
      <div className="canvas-editor__identity"><span className="canvas-editor__doc-dot" /><div><small>{schemaType.name === 'article' ? '文章畫布' : schemaType.name === 'product' ? '商品畫布' : '頁面畫布'}</small><strong>可視化編輯</strong></div></div>
      <div className="canvas-editor__status"><i className={saveState === 'saving' ? 'is-saving' : ''} />{saveState === 'saving' ? '正在儲存草稿' : '已與 Sanity 草稿同步'}</div>
      <div className="canvas-editor__devices" aria-label="畫布預覽尺寸"><button className={previewMode === 'desktop' ? 'is-active' : ''} onClick={() => setPreviewMode('desktop')}>桌面</button><button className={previewMode === 'mobile' ? 'is-active' : ''} onClick={() => setPreviewMode('mobile')}>手機</button></div>
      <button className={`canvas-editor__settings ${showPageSettings ? 'is-active' : ''}`} onClick={() => setShowPageSettings((open) => !open)}>⚙ 頁面設定</button>
      <button className="canvas-editor__preview" onClick={openFrontendPreview}>↗ 預覽前台</button>
      <button className="canvas-editor__add" onClick={() => setShowLibrary((open) => !open)}>＋ 新增區塊</button>
      {showLibrary && <div className="block-library"><div className="block-library__group-label">內容與媒體</div>{allowedBlocks(schemaType.name).map((type) => <button key={type} onClick={() => addBlock(type)}><span>＋</span><strong>{labels[type]}</strong><small>{type === 'heroSection' ? '首屏與關鍵訊息' : type === 'richTextSection' || type === 'block' ? '文字與圖文段落' : type === 'imageSection' || type === 'image' ? '單張圖片與替代文字' : type === 'mediaGallerySection' ? '從媒體庫建立圖片圖庫' : type === 'productGridSection' ? '多個商品的展示網格' : type === 'productDetailSection' ? '商品資訊、規格與購物操作' : type === 'cartSection' ? '購物車入口與結帳導向' : type === 'storeSearchSection' ? '商品搜尋入口' : type === 'faqSection' ? '問答內容區塊' : '轉換與推薦內容'}</small></button>)}</div>}
    </header>

    <section className="canvas-editor__workspace">
      <div className="canvas-editor__stage">
        <div className="canvas-editor__document-meta"><span>草稿工作區</span><small>/{value.slug?.current || '設定網址 slug'}</small></div>
        <input className="canvas-editor__title" value={title} placeholder="輸入內容標題" onChange={(event) => setTitle(event.target.value)} onBlur={() => title !== value.title && patch({title})} />
        <p className="canvas-editor__hint">直接選取任一區塊，即可在右側調整內容與顯示方式。</p>
        <div className={`canvas-editor__blocks canvas-editor__blocks--${previewMode}`}>
          {blocks.length === 0 && <button className="canvas-editor__empty" onClick={() => setShowLibrary(true)}>＋ 從第一個內容區塊開始</button>}
          {blocks.map((block, index) => {
            const isSelected = block._key === selected?._key
            const image = mediaById.get(imageRef(block) ?? '')
            return <article key={block._key ?? `${block._type}-${index}`} draggable onDragStart={() => setDraggingKey(block._key)} onDragOver={(event) => event.preventDefault()} onDrop={() => { const from = blocks.findIndex((item) => item._key === draggingKey); moveBlock(from, index); setDraggingKey(undefined) }} onClick={() => setSelectedKey(block._key)} className={`canvas-block canvas-block--${block._type ?? 'unknown'} canvas-block--theme-${block.style?.theme || 'default'} canvas-block--width-${block.style?.width || 'full'} canvas-block--align-${block.style?.textAlign || 'left'} canvas-block--variant-${block.style?.variant || 'standard'} canvas-block--spacing-${block.style?.spacing || 'normal'} ${isSelected ? 'is-selected' : ''}`} style={{fontFamily: block.style?.fontFamily || 'Noto Sans TC, system-ui, sans-serif', fontSize: block.style?.fontSize || '15px', fontWeight: block.style?.fontWeight || '400', color: block.style?.textColor || undefined, backgroundColor: block.style?.backgroundColor || undefined, borderColor: block.style?.borderColor || undefined, borderStyle: block.style?.borderStyle || undefined, borderWidth: block.style?.borderWidth || undefined, borderRadius: block.style?.borderRadius || undefined, textDecoration: block.style?.textDecoration || undefined}}>
              <div className="canvas-block__chrome"><span className="canvas-block__index">{String(index + 1).padStart(2, '0')}</span><span className="canvas-block__type">{labels[block._type ?? ''] ?? '內容區塊'}</span><div className="canvas-block__tools"><button aria-label="複製區塊" onClick={(event) => { event.stopPropagation(); duplicateBlock(block._key!) }}>複製</button><span className="canvas-block__drag" aria-label="拖曳排序">⠿</span></div></div>
              <CanvasBlockPreview block={block} imageUrl={image?.url} imageUrls={(block.images ?? []).map((item) => mediaById.get(item.asset?._ref ?? '')?.url).filter(Boolean) as string[]} product={products.find((product) => product._id === block.product?._ref)} onUpdate={(changes) => updateBlock(block._key!, changes)} onPortable={(text) => updatePortable(block, text)} />
            </article>
          })}
        </div>
      </div>
      <aside className="canvas-editor__inspector">
        {showPageSettings ? <PageSettings value={value} onPatch={patch} /> : selected ? <>
          <header><div><span>選取區塊</span><strong>{labels[selected._type ?? ''] ?? '內容區塊'}</strong></div><button aria-label="刪除目前區塊" onClick={() => removeBlock(selected._key!)}>刪除</button></header>
          <div className="canvas-editor__tabs"><button className={activeInspector === 'content' ? 'is-active' : ''} onClick={() => setActiveInspector('content')}>內容</button><button className={activeInspector === 'style' ? 'is-active' : ''} onClick={() => setActiveInspector('style')}>樣式</button></div>
          {activeInspector === 'content' ? <InspectorContent block={selected} media={media} products={products} onUpdate={(changes) => updateBlock(selected._key!, changes)} onPortable={(text) => updatePortable(selected, text)} onPickMedia={() => setShowMedia(true)} /> : <InspectorStyle block={selected} onUpdate={(changes) => updateBlock(selected._key!, changes)} />}
          <footer className="canvas-editor__inspector-actions"><button disabled={selectedIndex === 0} onClick={() => moveBlock(selectedIndex, selectedIndex - 1)}>↑ 上移</button><button disabled={selectedIndex === blocks.length - 1} onClick={() => moveBlock(selectedIndex, selectedIndex + 1)}>↓ 下移</button></footer>
        </> : <div className="canvas-editor__inspector-empty">請在畫布上選取一個內容區塊。</div>}
      </aside>
    </section>

    {showMedia && <div className="media-drawer" role="dialog" aria-modal="true"><div className="media-drawer__backdrop" onClick={() => setShowMedia(false)} /><section><header><div><span>媒體庫</span><h2>選擇一張圖片</h2></div><button onClick={() => setShowMedia(false)}>×</button></header><p>選取後會寫入目前區塊；替代文字請在右側內容面板補上。</p><div className="media-drawer__grid">{media.map((asset) => <button key={asset._id} onClick={() => setImage(asset)}>{asset.url ? <img src={asset.url} alt="" /> : <span>無預覽</span>}<small>{mediaLabel(asset)}</small></button>)}</div>{media.length === 0 && <div className="media-drawer__empty">媒體庫目前沒有可選圖片。請先在「進階欄位」上傳圖片，或稍後重新開啟此面板。</div>}</section></div>}
  </main>
}

const PageSettings = ({value, onPatch}: {value: DocumentData; onPatch: (set: Record<string, unknown>) => void}) => {
  const [slug, setSlug] = useState(value.slug?.current ?? '')
  const [metaTitle, setMetaTitle] = useState(value.seo?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(value.seo?.metaDescription ?? '')
  const [editorialNotes, setEditorialNotes] = useState(value.editorialNotes ?? '')
  useEffect(() => {
    setSlug(value.slug?.current ?? '')
    setMetaTitle(value.seo?.metaTitle ?? '')
    setMetaDescription(value.seo?.metaDescription ?? '')
    setEditorialNotes(value.editorialNotes ?? '')
  }, [value.slug?.current, value.seo?.metaTitle, value.seo?.metaDescription, value.editorialNotes])
  const commitSlug = () => { const next = slug.trim().replace(/^\/+/, '').replace(/\s+/g, '-'); if (next !== value.slug?.current) onPatch({slug: {_type: 'slug', current: next}}) }
  const commitSeo = (changes: Record<string, unknown>) => onPatch({seo: {...(value.seo ?? {}), ...changes}})
  return <div className="page-settings">
    <header><div><span>頁面設定</span><strong>發布前的完整檢查</strong></div></header>
    <section className="page-settings__section"><h3>基本資料</h3><label><span>頁面標題</span><input value={value.title ?? ''} readOnly /></label><label><span>網址 slug</span><div className="page-settings__slug"><b>/</b><input value={slug} onChange={(event) => setSlug(event.target.value)} onBlur={commitSlug} onKeyDown={(event) => event.key === 'Enter' && commitSlug()} /></div><small>離開欄位時自動儲存。</small></label></section>
    <section className="page-settings__section"><h3>SEO</h3><label><span>SEO 標題 <em>{metaTitle.length}/60</em></span><input value={metaTitle} maxLength={60} placeholder={value.title || '沿用頁面標題'} onChange={(event) => setMetaTitle(event.target.value)} onBlur={() => commitSeo({metaTitle})} /></label><label><span>Meta description <em>{metaDescription.length}/160</em></span><textarea rows={4} maxLength={160} value={metaDescription} placeholder="用一句話說明這個頁面" onChange={(event) => setMetaDescription(event.target.value)} onBlur={() => commitSeo({metaDescription})} /></label><label className="page-settings__check"><input type="checkbox" checked={Boolean(value.seo?.noIndex)} onChange={(event) => commitSeo({noIndex: event.target.checked})} /><span>禁止搜尋引擎索引</span></label></section>
    <section className="page-settings__section"><h3>編輯團隊備註</h3><textarea rows={4} value={editorialNotes} placeholder="僅供團隊內部參考" onChange={(event) => setEditorialNotes(event.target.value)} onBlur={() => onPatch({editorialNotes})} /></section>
  </div>
}

const Editable = ({value, placeholder, className, onCommit}: {value?: string; placeholder: string; className?: string; onCommit: (value: string) => void}) => <span className={className} contentEditable suppressContentEditableWarning role="textbox" aria-label={placeholder} data-placeholder={placeholder} onBlur={(event) => { const next = event.currentTarget.textContent?.trim() ?? ''; if (next !== (value ?? '')) onCommit(next) }}>{value || placeholder}</span>

const CanvasBlockPreview = ({block, imageUrl, imageUrls = [], product, onUpdate, onPortable}: {block: CanvasBlock; imageUrl?: string; imageUrls?: string[]; product?: ProductOption; onUpdate: (changes: Partial<CanvasBlock>) => void; onPortable: (text: string) => void}) => {
  if (block._type === 'heroSection') return <div className="canvas-preview canvas-preview--hero"><Editable value={block.eyebrow} placeholder="眉標" className="canvas-editable canvas-preview__eyebrow" onCommit={(eyebrow) => onUpdate({eyebrow})} /><Editable value={block.heading} placeholder="在這裡寫下主要訊息" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><Editable value={block.summary} placeholder="補上摘要，協助讀者快速理解這個區塊。" className="canvas-editable canvas-preview__summary" onCommit={(summary) => onUpdate({summary})} />{block.ctaLabel && <button>{block.ctaLabel}</button>}</div>
  if (block._type === 'imageSection' || block._type === 'image') return <div className="canvas-preview canvas-preview--image">{imageUrl ? <img src={imageUrl} alt={block.image?.alt || block.alt || ''} /> : <div className="canvas-preview__image-empty">選擇媒體圖片</div>}<small>{block.caption || block.image?.alt || block.alt || '請加入替代文字與圖片說明'}</small></div>
  if (block._type === 'mediaGallerySection') return <div className="canvas-preview canvas-preview--gallery"><Editable value={block.heading} placeholder="媒體圖庫" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><div className="canvas-gallery-grid">{imageUrls.length ? imageUrls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={block.images?.[index]?.alt || ''} />) : <div className="canvas-preview__image-empty">從媒體庫選擇圖片</div>}</div><small>媒體庫圖片：{imageUrls.length} 張</small></div>
  if (block._type === 'callToActionSection') return <div className="canvas-preview canvas-preview--cta"><span>行動引導</span><Editable value={block.heading} placeholder="引導讀者採取下一步" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><Editable value={typeof block.body === 'string' ? block.body : ''} placeholder="補上一段簡短說明。" className="canvas-editable canvas-preview__summary" onCommit={(body) => onUpdate({body})} /><button>{block.label || '立即了解'}</button></div>
  if (block._type === 'productCalloutSection') return <div className="canvas-preview canvas-preview--product"><span>推薦商品</span><h3>{product?.title || '選擇要推薦的商品'}</h3><p>{block.overrideSummary || product?.summary || '在右側選擇一個商品並補上短說明。'}</p><button>{block.label || '查看商品'}</button></div>
  if (block._type === 'productGridSection') return <div className="canvas-preview canvas-preview--product-grid"><Editable value={block.heading} placeholder="熱門商品" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><p>{block.summary || '挑選你喜歡的商品。'}</p><div className="product-grid-placeholder"><div><strong>商品 1</strong><small>商品卡片</small></div><div><strong>商品 2</strong><small>商品卡片</small></div><div><strong>商品 3</strong><small>商品卡片</small></div></div><button>{block.cardActionLabel || '查看商品'}</button></div>
  if (block._type === 'productDetailSection') return <div className="canvas-preview canvas-preview--product-detail"><span>商品詳情</span><h3>{product?.title || '選擇一個商品'}</h3><p>{product?.summary || '商品摘要、規格與價格會由前台商務系統提供。'}</p><div className="canvas-preview__commerce-note">{block.showCommercePrice ? '價格由商務後端提供' : '隱藏價格'} · {block.showVariants ? '支援規格選擇' : '不顯示規格'}</div><button>{block.addToCartLabel || '加入購物車'}</button><button className="is-secondary">{block.buyNowLabel || '立即購買'}</button></div>
  if (block._type === 'cartSection') return <div className="canvas-preview canvas-preview--cart"><span>商務功能</span><h3>{block.heading || '你的購物車'}</h3><p>{block.emptyMessage || '購物車目前是空的。'}</p><button>{block.checkoutLabel || '前往結帳'}</button><small>連接：{block.cartPath || '/cart'}</small></div>
  if (block._type === 'storeSearchSection') return <div className="canvas-preview canvas-preview--search"><span>商店功能</span><div className="store-search-placeholder"><span>{block.placeholder || '搜尋商品'}</span><button>{block.buttonLabel || '搜尋'}</button></div><small>搜尋路徑：{block.searchPath || '/search'}</small></div>
  if (block._type === 'beforeAfterSection') return <div className="canvas-preview canvas-preview--before-after"><Editable value={block.heading} placeholder="改變前後" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><div className="before-after-placeholder"><div><strong>{block.beforeLabel || 'Before'}</strong><span>選擇 Before 圖片</span></div><div><strong>{block.afterLabel || 'After'}</strong><span>選擇 After 圖片</span></div></div><p>{block.description || '說明改變前後的差異。'}</p></div>
  if (block._type === 'pricingSection') return <div className="canvas-preview canvas-preview--pricing"><Editable value={block.heading} placeholder="選擇適合你的方案" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><p>{block.summary || '比較方案內容與價格。'}</p><div className="pricing-placeholder">{(block.plans?.length ? block.plans : [{name: '方案名稱', price: 'NT$ 0', description: '方案說明'}]).slice(0, 3).map((plan, index) => <div key={plan._key ?? index} className={plan.featured ? 'is-featured' : ''}><strong>{plan.name || '方案名稱'}</strong><b>{plan.price || '價格'}</b><small>{plan.description || '方案說明'}</small></div>)}</div></div>
  if (block._type === 'quoteFormSection') return <div className="canvas-preview canvas-preview--quote"><span>智能表單</span><Editable value={block.heading} placeholder="取得專屬報價" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><p>{block.summary || '填寫需求，取得適合你的方案。'}</p><button>{block.buttonLabel || '立即估價'}</button><small>送出：{block.submitPath || '/api/quote'}</small></div>
  if (block._type === 'caseStudySection') return <div className="canvas-preview canvas-preview--cases"><Editable value={block.heading} placeholder="成功案例" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><div className="case-placeholder">{(block.cases?.length ? block.cases : [{title: '案例標題', client: '客戶／品牌', summary: '案例摘要'}]).slice(0, 3).map((item, index) => <div key={item._key ?? index}><strong>{item.title}</strong><small>{item.client}</small><p>{item.summary}</p></div>)}</div></div>
  if (block._type === 'testimonialSection') return <div className="canvas-preview canvas-preview--testimonial"><Editable value={block.heading} placeholder="客戶怎麼說" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} />{(block.items?.length ? block.items : [{quote: '在這裡放入客戶回饋。', name: '客戶姓名', role: '職稱／公司', rating: 5}]).slice(0, 2).map((item, index) => <div key={item._key ?? index}><p>「{item.quote}」</p><strong>{item.name}</strong><small>{item.role} · {'★'.repeat(Math.min(5, item.rating || 5))}</small></div>)}</div>
  if (block._type === 'lineContactSection') return <div className="canvas-preview canvas-preview--line"><span>聯繫入口</span><Editable value={block.heading} placeholder="需要協助嗎？" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><p>{block.summary || '透過 LINE 與我們聯繫。'}</p><button>{block.buttonLabel || '加入 LINE 好友'}</button></div>
  if (block._type === 'videoSection') return <div className="canvas-preview canvas-preview--video"><div className="video-placeholder">▶<small>{block.url || '選擇影片或輸入影片網址'}</small></div><Editable value={block.heading} placeholder="影片標題" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><p>{block.caption || '影片說明'}</p></div>
  if (block._type === 'htmlCssSection') return <div className="canvas-preview canvas-preview--html"><span>進階區塊</span><h3>{block.label || 'HTML／CSS 進階區塊'}</h3><pre>{block.html || '<div>自訂內容</div>'}</pre><small>HTML／CSS 由前台受控渲染</small></div>
  if (block._type === 'faqSection') return <div className="canvas-preview canvas-preview--faq"><Editable value={block.heading} placeholder="常見問題" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} />{block.items?.map((item, index) => <div key={item._key ?? index}><Editable value={item.question} placeholder="問題" className="canvas-editable canvas-preview__question" onCommit={(question) => onUpdate({items: block.items?.map((current, currentIndex) => currentIndex === index ? {...current, question} : current)})} /><Editable value={item.answer} placeholder="回答內容" className="canvas-editable canvas-preview__answer" onCommit={(answer) => onUpdate({items: block.items?.map((current, currentIndex) => currentIndex === index ? {...current, answer} : current)})} /></div>)}</div>
  if (block._type === 'richTextSection') return <div className="canvas-preview canvas-preview--text"><Editable value={block.heading} placeholder="區塊標題" className="canvas-editable canvas-preview__heading" onCommit={(heading) => onUpdate({heading})} /><Editable value={plainText(block)} placeholder="在這裡開始撰寫內容。" className="canvas-editable canvas-preview__summary" onCommit={onPortable} /></div>
  return <div className="canvas-preview canvas-preview--text"><Editable value={plainText(block)} placeholder="在這裡開始撰寫內容。" className="canvas-editable canvas-preview__summary" onCommit={onPortable} /></div>
}

const InspectorContent = ({block, media, products, onUpdate, onPortable, onPickMedia}: {block: CanvasBlock; media: MediaAsset[]; products: ProductOption[]; onUpdate: (changes: Partial<CanvasBlock>) => void; onPortable: (text: string) => void; onPickMedia: () => void}) => {
  const image = block.image ?? {asset: block.asset, alt: block.alt}
  const imageSource = media.find((asset) => asset._id === image.asset?._ref)
  if (block._type === 'heroSection') return <div className="inspector-fields"><Field label="眉標" value={block.eyebrow} onChange={(eyebrow) => onUpdate({eyebrow})} /><Field label="主標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="摘要" value={block.summary} onChange={(summary) => onUpdate({summary})} /><Field label="按鈕文字" value={block.ctaLabel} onChange={(ctaLabel) => onUpdate({ctaLabel})} /><Field label="按鈕連結" value={block.ctaUrl} onChange={(ctaUrl) => onUpdate({ctaUrl})} /></div>
  if (block._type === 'richTextSection' || block._type === 'block') return <div className="inspector-fields">{block._type === 'richTextSection' && <Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} />}<TextArea label="文字內容" value={plainText(block)} onChange={onPortable} /></div>
  if (block._type === 'imageSection' || block._type === 'image') return <div className="inspector-fields"><div className="inspector-media"><span>媒體圖片</span>{imageSource?.url ? <img src={imageSource.url} alt="" /> : <div>尚未選擇圖片</div>}<button onClick={onPickMedia}>從媒體庫選擇</button></div><Field label="替代文字" value={image.alt} onChange={(alt) => block._type === 'image' ? onUpdate({alt}) : onUpdate({image: {...image, alt}})} />{block._type === 'imageSection' && <Field label="圖片說明" value={block.caption} onChange={(caption) => onUpdate({caption})} />}</div>
  if (block._type === 'mediaGallerySection') return <div className="inspector-fields"><Field label="圖庫標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><label><span>圖庫欄數</span><select value={block.columns || 3} onChange={(event) => onUpdate({columns: Number(event.target.value)})}><option value="2">2 欄</option><option value="3">3 欄</option><option value="4">4 欄</option></select></label><div className="inspector-media"><span>圖庫圖片（{block.images?.length ?? 0} 張）</span><button onClick={onPickMedia}>從媒體庫加入圖片</button></div><label className="inspector-checkbox"><input type="checkbox" checked={block.showCaptions !== false} onChange={(event) => onUpdate({showCaptions: event.target.checked})} /><span>顯示圖片說明</span></label></div>
  if (block._type === 'beforeAfterSection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><Field label="Before 標籤" value={block.beforeLabel} onChange={(beforeLabel) => onUpdate({beforeLabel})} /><Field label="After 標籤" value={block.afterLabel} onChange={(afterLabel) => onUpdate({afterLabel})} /><TextArea label="說明" value={block.description} onChange={(description) => onUpdate({description})} /><button onClick={onPickMedia}>從媒體庫選 Before／After 圖片</button></div>
  if (block._type === 'pricingSection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="區塊說明" value={block.summary} onChange={(summary) => onUpdate({summary})} /><Field label="第一個方案名稱" value={block.plans?.[0]?.name} onChange={(name) => onUpdate({plans: [{...(block.plans?.[0] ?? {}), name}]})} /><Field label="第一個方案價格" value={block.plans?.[0]?.price} onChange={(price) => onUpdate({plans: [{...(block.plans?.[0] ?? {}), price}]})} /><Field label="第一個方案按鈕" value={block.plans?.[0]?.ctaLabel} onChange={(ctaLabel) => onUpdate({plans: [{...(block.plans?.[0] ?? {}), ctaLabel}]})} /><small className="inspector-note">可在進階欄位管理更多方案與特色。</small></div>
  if (block._type === 'quoteFormSection') return <div className="inspector-fields"><Field label="標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="說明" value={block.summary} onChange={(summary) => onUpdate({summary})} /><Field label="開啟按鈕文字" value={block.buttonLabel} onChange={(buttonLabel) => onUpdate({buttonLabel})} /><Field label="送出按鈕文字" value={block.submitLabel} onChange={(submitLabel) => onUpdate({submitLabel})} /><Field label="送出路徑／事件識別" value={block.submitPath} onChange={(submitPath) => onUpdate({submitPath})} /></div>
  if (block._type === 'caseStudySection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><Field label="第一個案例標題" value={block.cases?.[0]?.title} onChange={(title) => onUpdate({cases: [{...(block.cases?.[0] ?? {}), title}]})} /><Field label="客戶／品牌" value={block.cases?.[0]?.client} onChange={(client) => onUpdate({cases: [{...(block.cases?.[0] ?? {}), client}]})} /><TextArea label="案例摘要" value={block.cases?.[0]?.summary} onChange={(summary) => onUpdate({cases: [{...(block.cases?.[0] ?? {}), summary}]})} /></div>
  if (block._type === 'testimonialSection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="第一則回饋" value={block.items?.[0]?.quote} onChange={(quote) => onUpdate({items: [{...(block.items?.[0] ?? {}), quote}]})} /><Field label="姓名" value={block.items?.[0]?.name} onChange={(name) => onUpdate({items: [{...(block.items?.[0] ?? {}), name}]})} /><Field label="職稱／公司" value={block.items?.[0]?.role} onChange={(role) => onUpdate({items: [{...(block.items?.[0] ?? {}), role}]})} /></div>
  if (block._type === 'lineContactSection') return <div className="inspector-fields"><Field label="標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="說明" value={block.summary} onChange={(summary) => onUpdate({summary})} /><Field label="按鈕文字" value={block.buttonLabel} onChange={(buttonLabel) => onUpdate({buttonLabel})} /><Field label="LINE 連結" value={block.lineUrl} onChange={(lineUrl) => onUpdate({lineUrl})} /></div>
  if (block._type === 'videoSection') return <div className="inspector-fields"><Field label="影片標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><Field label="影片網址" value={block.url} onChange={(url) => onUpdate({url})} /><TextArea label="影片說明" value={block.caption} onChange={(caption) => onUpdate({caption})} /><label className="inspector-checkbox"><input type="checkbox" checked={Boolean(block.autoplay)} onChange={(event) => onUpdate({autoplay: event.target.checked})} /><span>自動播放（需靜音）</span></label></div>
  if (block._type === 'htmlCssSection') return <div className="inspector-fields"><Field label="編輯器標籤" value={block.label} onChange={(label) => onUpdate({label})} /><TextArea label="HTML" value={block.html} onChange={(html) => onUpdate({html})} /><TextArea label="CSS" value={block.css} onChange={(css) => onUpdate({css})} /><label className="inspector-checkbox"><input type="checkbox" checked={Boolean(block.scriptAllowed)} onChange={(event) => onUpdate({scriptAllowed: event.target.checked})} /><span>允許前台腳本</span></label><small className="inspector-note">腳本預設關閉，避免任意程式碼影響網站安全。</small></div>
  if (block._type === 'callToActionSection') return <div className="inspector-fields"><Field label="標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="說明" value={typeof block.body === 'string' ? block.body : ''} onChange={(body) => onUpdate({body})} /><Field label="按鈕文字" value={block.label} onChange={(label) => onUpdate({label})} /><Field label="按鈕連結" value={block.url} onChange={(url) => onUpdate({url})} /></div>
  if (block._type === 'productCalloutSection') return <div className="inspector-fields"><label><span>推薦商品</span><select value={block.product?._ref ?? ''} onChange={(event) => onUpdate({product: event.target.value ? {_type: 'reference', _ref: event.target.value} : undefined})}><option value="">選擇商品</option>{products.map((product) => <option value={product._id} key={product._id}>{product.title || product._id}</option>)}</select></label><TextArea label="自訂短說明" value={block.overrideSummary} onChange={(overrideSummary) => onUpdate({overrideSummary})} /><Field label="行動文字" value={block.label} onChange={(label) => onUpdate({label})} /></div>
  if (block._type === 'productGridSection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="區塊說明" value={block.summary} onChange={(summary) => onUpdate({summary})} /><label><span>欄數</span><select value={block.columns || 3} onChange={(event) => onUpdate({columns: Number(event.target.value)})}><option value="2">2 欄</option><option value="3">3 欄</option><option value="4">4 欄</option></select></label><Field label="商品卡按鈕文字" value={block.cardActionLabel} onChange={(cardActionLabel) => onUpdate({cardActionLabel})} /><label><span>商品來源</span><select value={block.products?.[0]?._ref ?? ''} onChange={(event) => onUpdate({products: event.target.value ? [{_type: 'reference', _ref: event.target.value}] : []})}><option value="">尚未選擇商品</option>{products.map((product) => <option value={product._id} key={product._id}>{product.title || product._id}</option>)}</select></label><small className="inspector-note">第一版先以商品來源與版型設定為主；前台商品數量與價格由商務後端決定。</small></div>
  if (block._type === 'productDetailSection') return <div className="inspector-fields"><label><span>選擇商品</span><select value={block.product?._ref ?? ''} onChange={(event) => onUpdate({product: event.target.value ? {_type: 'reference', _ref: event.target.value} : undefined})}><option value="">選擇商品</option>{products.map((product) => <option value={product._id} key={product._id}>{product.title || product._id}</option>)}</select></label><Field label="加入購物車文字" value={block.addToCartLabel} onChange={(addToCartLabel) => onUpdate({addToCartLabel})} /><Field label="立即購買文字" value={block.buyNowLabel} onChange={(buyNowLabel) => onUpdate({buyNowLabel})} /><label className="inspector-checkbox"><input type="checkbox" checked={block.showVariants !== false} onChange={(event) => onUpdate({showVariants: event.target.checked})} /><span>顯示規格選擇</span></label><label className="inspector-checkbox"><input type="checkbox" checked={block.showCommercePrice !== false} onChange={(event) => onUpdate({showCommercePrice: event.target.checked})} /><span>顯示商務系統價格</span></label><small className="inspector-note">商品價格、庫存、加入購物車與結帳由 commerceProductId 對應的商務後端處理。</small></div>
  if (block._type === 'cartSection') return <div className="inspector-fields"><Field label="標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><Field label="空購物車提示" value={block.emptyMessage} onChange={(emptyMessage) => onUpdate({emptyMessage})} /><Field label="結帳按鈕文字" value={block.checkoutLabel} onChange={(checkoutLabel) => onUpdate({checkoutLabel})} /><Field label="購物車路徑／事件識別" value={block.cartPath} onChange={(cartPath) => onUpdate({cartPath})} /><small className="inspector-note">這是前台商務整合的入口，不在 Sanity 儲存購物車內容。</small></div>
  if (block._type === 'storeSearchSection') return <div className="inspector-fields"><Field label="搜尋提示文字" value={block.placeholder} onChange={(placeholder) => onUpdate({placeholder})} /><Field label="搜尋按鈕文字" value={block.buttonLabel} onChange={(buttonLabel) => onUpdate({buttonLabel})} /><Field label="搜尋路徑／事件識別" value={block.searchPath} onChange={(searchPath) => onUpdate({searchPath})} /></div>
  if (block._type === 'faqSection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} />{block.items?.map((item, index) => <div className="faq-editor" key={item._key ?? index}><Field label={`問題 ${index + 1}`} value={item.question} onChange={(question) => onUpdate({items: block.items?.map((current, currentIndex) => currentIndex === index ? {...current, question} : current)})} /><TextArea label="回答" value={item.answer} onChange={(answer) => onUpdate({items: block.items?.map((current, currentIndex) => currentIndex === index ? {...current, answer} : current)})} /></div>)}</div>
  return <div className="canvas-editor__inspector-empty">此區塊尚無可調整欄位。</div>
}

const InspectorStyle = ({block, onUpdate}: {block: CanvasBlock; onUpdate: (changes: Partial<CanvasBlock>) => void}) => {
  const style = block.style ?? {}
  const patchStyle = (changes: Partial<NonNullable<CanvasBlock['style']>>) => onUpdate({style: {...style, ...changes}})
  const cssPreview = `font-family: ${style.fontFamily || 'Noto Sans TC, system-ui, sans-serif'};\nfont-size: ${style.fontSize || '15px'};\nfont-weight: ${style.fontWeight || '400'};\ntext-align: ${style.textAlign || 'left'};\ncolor: ${style.textColor || '#1F2937'};\nbackground: ${style.backgroundColor || 'transparent'};`
  return <div className="inspector-fields inspector-style">
    <p>預設為 15px、字重 400、Noto Sans TC／系統無襯線體。所有調整只影響目前區塊，並會寫回草稿。</p>
    <label><span>版型變體</span><select value={style.variant || 'standard'} onChange={(event) => patchStyle({variant: event.target.value})}><option value="standard">標準</option><option value="compact">緊湊</option><option value="split">左右分欄</option><option value="featured">強調</option></select></label>
    <div className="inspector-style__button-row"><button className={style.fontWeight === '700' ? 'is-active' : ''} onClick={() => patchStyle({fontWeight: style.fontWeight === '700' ? '400' : '700'})}>B</button><button className={style.textDecoration === 'underline' ? 'is-active' : ''} onClick={() => patchStyle({textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline'})}>U</button></div>
    <label><span>字型家族</span><select value={style.fontFamily || 'Noto Sans TC, system-ui, sans-serif'} onChange={(event) => patchStyle({fontFamily: event.target.value})}><option value="Noto Sans TC, system-ui, sans-serif">Noto Sans TC／系統無襯線體</option><option value="system-ui, sans-serif">系統無襯線體</option><option value="Georgia, serif">Georgia 襯線體</option><option value="ui-monospace, monospace">等寬字體</option></select></label>
    <div className="inspector-style__grid"><label><span>文字大小</span><select value={style.fontSize || '15px'} onChange={(event) => patchStyle({fontSize: event.target.value})}><option value="13px">13px</option><option value="15px">15px（預設）</option><option value="16px">16px</option><option value="18px">18px</option><option value="24px">24px</option><option value="32px">32px</option></select></label><label><span>字型粗細</span><select value={style.fontWeight || '400'} onChange={(event) => patchStyle({fontWeight: event.target.value})}><option value="300">300</option><option value="400">400（正常）</option><option value="500">500</option><option value="700">700（粗體）</option></select></label></div>
    <label><span>文字對齊</span><select value={style.textAlign || 'left'} onChange={(event) => patchStyle({textAlign: event.target.value})}><option value="left">靠左</option><option value="center">置中</option><option value="right">靠右</option></select></label>
    <div className="inspector-style__section"><strong>邊框</strong><div className="inspector-style__grid"><label><span>邊框色彩</span><input type="color" value={style.borderColor || '#1F2937'} onChange={(event) => patchStyle({borderColor: event.target.value})} /></label><label><span>邊框樣式</span><select value={style.borderStyle || 'solid'} onChange={(event) => patchStyle({borderStyle: event.target.value})}><option value="none">無</option><option value="solid">實線</option><option value="dashed">虛線</option><option value="dotted">點線</option></select></label><label><span>邊框粗細</span><select value={style.borderWidth || '1px'} onChange={(event) => patchStyle({borderWidth: event.target.value})}><option value="0px">0px</option><option value="1px">1px</option><option value="2px">2px</option><option value="4px">4px</option></select></label><label><span>圓角半徑</span><select value={style.borderRadius || '8px'} onChange={(event) => patchStyle({borderRadius: event.target.value})}><option value="0px">0px</option><option value="4px">4px</option><option value="8px">8px</option><option value="16px">16px</option></select></label></div></div>
    <div className="inspector-style__section"><strong>色彩與排版</strong><div className="inspector-style__grid"><label><span>文字色彩</span><input type="color" value={style.textColor || '#1F2937'} onChange={(event) => patchStyle({textColor: event.target.value})} /></label><label><span>背景色彩</span><input type="color" value={style.backgroundColor || '#FFFFFF'} onChange={(event) => patchStyle({backgroundColor: event.target.value})} /></label></div><label><span>文字裝飾</span><select value={style.textDecoration || 'none'} onChange={(event) => patchStyle({textDecoration: event.target.value})}><option value="none">無</option><option value="underline">底線</option><option value="line-through">刪除線</option></select></label></div>
    <label><span>內容寬度</span><select value={style.width || 'full'} onChange={(event) => patchStyle({width: event.target.value})}><option value="full">滿版</option><option value="content">內文寬度</option><option value="narrow">窄版</option></select></label>
    <div className="style-preview"><span>HTML/CSS 進階預覽</span><pre>{cssPreview}</pre></div>
  </div>
}

const Field = ({label, value, onChange}: {label: string; value?: string; onChange: (value: string) => void}) => <label><span>{label}</span><input value={value ?? ''} onChange={(event) => onChange(event.target.value)} /></label>
const TextArea = ({label, value, onChange}: {label: string; value?: string; onChange: (value: string) => void}) => <label><span>{label}</span><textarea rows={4} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /></label>

export const ContentCanvas: UserViewComponent = ({document, schemaType}) => {
  const value = (document.displayed ?? {}) as DocumentData
  const blocks = value.sections ?? value.body ?? value.content ?? []
  const schemaName = schemaType.name
  const canvasKind = schemaName === 'product' ? '商品頁編排' : schemaName === 'article' ? '文章編排' : '頁面編排'
  return <main className="editorial-canvas"><header className="canvas-header"><span>內容結構</span><small>{canvasKind}</small></header><section className="canvas-document"><div className="canvas-kicker">草稿視覺摘要</div><h1>{value.title || '尚未命名內容'}</h1><p className="canvas-slug">/{value.slug?.current || '設定網址 slug'}</p><div className="canvas-rule" />{blocks.length === 0 ? <div className="canvas-empty">尚未加入內容區塊。請切換到「畫布編輯」新增首屏、圖文、CTA、商品卡或 FAQ。</div> : <ol className="canvas-block-list">{blocks.map((block, index) => <li key={block._key ?? `${block._type}-${index}`}><span className="canvas-index">{String(index + 1).padStart(2, '0')}</span><div><strong>{labels[block._type ?? ''] ?? block._type ?? '內容區塊'}</strong><p>{sectionTitle(block)}</p></div></li>)}</ol>}</section><footer className="canvas-footer">此檢視用於確認內容結構；日常修改請使用「畫布編輯」。</footer></main>
}

export const SeoChecklist: UserViewComponent = ({document}) => {
  const value = (document.displayed ?? {}) as DocumentData
  const metaTitle = value.seo?.metaTitle || value.title || ''
  const metaDescription = value.seo?.metaDescription || value.excerpt || ''
  const checks = [{label: '標題', ready: Boolean(value.title), detail: value.title ? `${value.title.length} 字元` : '請填寫內容標題'}, {label: '網址 slug', ready: Boolean(value.slug?.current), detail: value.slug?.current ? `/${value.slug.current}` : '請設定網址'}, {label: 'SEO 標題', ready: Boolean(metaTitle), detail: metaTitle ? `${metaTitle.length}/60 建議字元` : '請填寫 SEO 標題'}, {label: 'Meta description', ready: Boolean(metaDescription), detail: metaDescription ? `${metaDescription.length}/160 建議字元` : '請填寫搜尋摘要'}]
  return <main className="seo-panel"><header><span>SEO 檢查</span><p>發布前確認可索引內容的基本結構。</p></header><ul>{checks.map((check) => <li key={check.label} className={check.ready ? 'is-ready' : 'is-missing'}><i /><div><strong>{check.label}</strong><small>{check.detail}</small></div></li>)}</ul>{value.seo?.noIndex && <p className="seo-warning">此內容目前設定為禁止搜尋引擎索引。</p>}</main>
}
