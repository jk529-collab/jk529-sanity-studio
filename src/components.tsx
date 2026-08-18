import {useEffect, useMemo, useState, type DragEvent} from 'react'
import {useClient, useDocumentOperation} from 'sanity'
import type {UserViewComponent} from 'sanity/structure'

type ImageValue = {asset?: {_ref?: string}; alt?: string}
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
  overrideSummary?: string
  items?: Array<{_key?: string; question?: string; answer?: string}>
}

type DocumentData = {
  _id?: string
  title?: string
  slug?: {current?: string}
  sections?: CanvasBlock[]
  body?: CanvasBlock[]
  content?: CanvasBlock[]
  excerpt?: string
  seo?: {metaTitle?: string; metaDescription?: string; noIndex?: boolean}
}

type MediaAsset = {_id: string; url?: string; originalFilename?: string}
type ProductOption = {_id: string; title?: string; summary?: string}

const labels: Record<string, string> = {
  heroSection: '首屏主視覺', richTextSection: '圖文內容', imageSection: '圖片／圖集',
  callToActionSection: 'CTA 行動按鈕', productCalloutSection: '商品卡', faqSection: '常見問題',
  block: '文字段落', image: '圖片',
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
    faqSection: {_key: key, _type: 'faqSection', heading: '常見問題', items: [{_key: createKey(), question: '常見問題', answer: '在此補上回答。'}]},
    block: portableBlock('在這裡開始撰寫內容。'),
    image: {_key: key, _type: 'image', alt: ''},
  }
  return templates[type]
}

const allowedBlocks = (schemaName: string) => schemaName === 'sitePage'
  ? ['heroSection', 'richTextSection', 'imageSection', 'callToActionSection', 'productCalloutSection', 'faqSection']
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
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
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
    const image = {asset: {_type: 'reference', _ref: asset._id}, alt: selected.image?.alt ?? selected.alt ?? ''}
    updateBlock(selected._key!, selected._type === 'image' ? {asset: image.asset, alt: image.alt} : {image})
    setShowMedia(false)
  }

  return <main className="canvas-editor">
    <header className="canvas-editor__topbar">
      <div className="canvas-editor__identity"><span className="canvas-editor__doc-dot" /><div><small>{schemaType.name === 'article' ? '文章畫布' : schemaType.name === 'product' ? '商品畫布' : '頁面畫布'}</small><strong>可視化編輯</strong></div></div>
      <div className="canvas-editor__status"><i className={saveState === 'saving' ? 'is-saving' : ''} />{saveState === 'saving' ? '正在儲存草稿' : '已與 Sanity 草稿同步'}</div>
      <button className="canvas-editor__add" onClick={() => setShowLibrary((open) => !open)}>＋ 新增區塊</button>
      {showLibrary && <div className="block-library">{allowedBlocks(schemaType.name).map((type) => <button key={type} onClick={() => addBlock(type)}><span>＋</span><strong>{labels[type]}</strong><small>{type === 'heroSection' ? '首屏與關鍵訊息' : type === 'richTextSection' || type === 'block' ? '文字與圖文段落' : type === 'imageSection' || type === 'image' ? '媒體圖片與替代文字' : type === 'faqSection' ? '問答內容區塊' : '轉換與推薦內容'}</small></button>)}</div>}
    </header>

    <section className="canvas-editor__workspace">
      <div className="canvas-editor__stage">
        <div className="canvas-editor__document-meta"><span>草稿工作區</span><small>/{value.slug?.current || '設定網址 slug'}</small></div>
        <input className="canvas-editor__title" value={title} placeholder="輸入內容標題" onChange={(event) => setTitle(event.target.value)} onBlur={() => title !== value.title && patch({title})} />
        <p className="canvas-editor__hint">直接選取任一區塊，即可在右側調整內容與顯示方式。</p>
        <div className="canvas-editor__blocks">
          {blocks.length === 0 && <button className="canvas-editor__empty" onClick={() => setShowLibrary(true)}>＋ 從第一個內容區塊開始</button>}
          {blocks.map((block, index) => {
            const isSelected = block._key === selected?._key
            const image = mediaById.get(imageRef(block) ?? '')
            return <article key={block._key ?? `${block._type}-${index}`} draggable onDragStart={() => setDraggingKey(block._key)} onDragOver={(event) => event.preventDefault()} onDrop={() => { const from = blocks.findIndex((item) => item._key === draggingKey); moveBlock(from, index); setDraggingKey(undefined) }} onClick={() => setSelectedKey(block._key)} className={`canvas-block canvas-block--${block._type ?? 'unknown'} ${isSelected ? 'is-selected' : ''}`}>
              <div className="canvas-block__chrome"><span className="canvas-block__index">{String(index + 1).padStart(2, '0')}</span><span className="canvas-block__type">{labels[block._type ?? ''] ?? '內容區塊'}</span><span className="canvas-block__drag">⠿</span></div>
              <CanvasBlockPreview block={block} imageUrl={image?.url} product={products.find((product) => product._id === block.product?._ref)} />
            </article>
          })}
        </div>
      </div>
      <aside className="canvas-editor__inspector">
        {selected ? <>
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

const CanvasBlockPreview = ({block, imageUrl, product}: {block: CanvasBlock; imageUrl?: string; product?: ProductOption}) => {
  if (block._type === 'heroSection') return <div className="canvas-preview canvas-preview--hero"><span>{block.eyebrow || '眉標'}</span><h2>{block.heading || '在這裡寫下主要訊息'}</h2><p>{block.summary || '補上摘要，協助讀者快速理解這個段落。'}</p>{block.ctaLabel && <button>{block.ctaLabel}</button>}</div>
  if (block._type === 'imageSection' || block._type === 'image') return <div className="canvas-preview canvas-preview--image">{imageUrl ? <img src={imageUrl} alt={block.image?.alt || block.alt || ''} /> : <div className="canvas-preview__image-empty">選擇媒體圖片</div>}<small>{block.caption || block.image?.alt || block.alt || '請加入替代文字與圖片說明'}</small></div>
  if (block._type === 'callToActionSection') return <div className="canvas-preview canvas-preview--cta"><span>行動引導</span><h3>{block.heading || '引導讀者採取下一步'}</h3><p>{typeof block.body === 'string' ? block.body : '補上一段簡短說明。'}</p><button>{block.label || '立即了解'}</button></div>
  if (block._type === 'productCalloutSection') return <div className="canvas-preview canvas-preview--product"><span>推薦商品</span><h3>{product?.title || '選擇要推薦的商品'}</h3><p>{block.overrideSummary || product?.summary || '在右側選擇一個商品並補上短說明。'}</p><button>{block.label || '查看商品'}</button></div>
  if (block._type === 'faqSection') return <div className="canvas-preview canvas-preview--faq"><h3>{block.heading || '常見問題'}</h3>{block.items?.map((item, index) => <div key={item._key ?? index}><strong>{item.question || '問題'}</strong><p>{item.answer || '回答內容'}</p></div>)}</div>
  if (block._type === 'richTextSection') return <div className="canvas-preview canvas-preview--text"><h3>{block.heading || '區塊標題'}</h3><p>{plainText(block) || '在右側輸入內容。'}</p></div>
  return <div className="canvas-preview canvas-preview--text"><p>{plainText(block) || '在右側輸入內容。'}</p></div>
}

const InspectorContent = ({block, media, products, onUpdate, onPortable, onPickMedia}: {block: CanvasBlock; media: MediaAsset[]; products: ProductOption[]; onUpdate: (changes: Partial<CanvasBlock>) => void; onPortable: (text: string) => void; onPickMedia: () => void}) => {
  const image = block.image ?? {asset: block.asset, alt: block.alt}
  const imageSource = media.find((asset) => asset._id === image.asset?._ref)
  if (block._type === 'heroSection') return <div className="inspector-fields"><Field label="眉標" value={block.eyebrow} onChange={(eyebrow) => onUpdate({eyebrow})} /><Field label="主標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="摘要" value={block.summary} onChange={(summary) => onUpdate({summary})} /><Field label="按鈕文字" value={block.ctaLabel} onChange={(ctaLabel) => onUpdate({ctaLabel})} /><Field label="按鈕連結" value={block.ctaUrl} onChange={(ctaUrl) => onUpdate({ctaUrl})} /></div>
  if (block._type === 'richTextSection' || block._type === 'block') return <div className="inspector-fields">{block._type === 'richTextSection' && <Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} />}<TextArea label="文字內容" value={plainText(block)} onChange={onPortable} /></div>
  if (block._type === 'imageSection' || block._type === 'image') return <div className="inspector-fields"><div className="inspector-media"><span>媒體圖片</span>{imageSource?.url ? <img src={imageSource.url} alt="" /> : <div>尚未選擇圖片</div>}<button onClick={onPickMedia}>從媒體庫選擇</button></div><Field label="替代文字" value={image.alt} onChange={(alt) => block._type === 'image' ? onUpdate({alt}) : onUpdate({image: {...image, alt}})} />{block._type === 'imageSection' && <Field label="圖片說明" value={block.caption} onChange={(caption) => onUpdate({caption})} />}</div>
  if (block._type === 'callToActionSection') return <div className="inspector-fields"><Field label="標題" value={block.heading} onChange={(heading) => onUpdate({heading})} /><TextArea label="說明" value={typeof block.body === 'string' ? block.body : ''} onChange={(body) => onUpdate({body})} /><Field label="按鈕文字" value={block.label} onChange={(label) => onUpdate({label})} /><Field label="按鈕連結" value={block.url} onChange={(url) => onUpdate({url})} /></div>
  if (block._type === 'productCalloutSection') return <div className="inspector-fields"><label><span>推薦商品</span><select value={block.product?._ref ?? ''} onChange={(event) => onUpdate({product: event.target.value ? {_type: 'reference', _ref: event.target.value} : undefined})}><option value="">選擇商品</option>{products.map((product) => <option value={product._id} key={product._id}>{product.title || product._id}</option>)}</select></label><TextArea label="自訂短說明" value={block.overrideSummary} onChange={(overrideSummary) => onUpdate({overrideSummary})} /><Field label="行動文字" value={block.label} onChange={(label) => onUpdate({label})} /></div>
  if (block._type === 'faqSection') return <div className="inspector-fields"><Field label="區塊標題" value={block.heading} onChange={(heading) => onUpdate({heading})} />{block.items?.map((item, index) => <div className="faq-editor" key={item._key ?? index}><Field label={`問題 ${index + 1}`} value={item.question} onChange={(question) => onUpdate({items: block.items?.map((current, currentIndex) => currentIndex === index ? {...current, question} : current)})} /><TextArea label="回答" value={item.answer} onChange={(answer) => onUpdate({items: block.items?.map((current, currentIndex) => currentIndex === index ? {...current, answer} : current)})} /></div>)}</div>
  return <div className="canvas-editor__inspector-empty">此區塊尚無可調整欄位。</div>
}

const InspectorStyle = ({block, onUpdate}: {block: CanvasBlock; onUpdate: (changes: Partial<CanvasBlock>) => void}) => <div className="inspector-fields inspector-style"><p>樣式設定會只影響目前區塊的前台呈現，不改變 SEO 與內容結構。</p>{(block._type === 'imageSection') && <label><span>圖片版型</span><select value={block.layout || 'content'} onChange={(event) => onUpdate({layout: event.target.value})}><option value="wide">寬幅</option><option value="content">內文寬度</option><option value="left">靠左</option></select></label>}{block._type === 'callToActionSection' && <div className="style-preview"><span>CTA 預覽</span><button>{block.label || '立即了解'}</button><small>目前採用 Studio 預設橘色強調樣式。</small></div>}{!['imageSection', 'callToActionSection'].includes(block._type ?? '') && <div className="style-preview"><span>區塊樣式</span><p>此區塊目前沿用網站設計系統。後續可在前台元件層擴充色彩與間距預設。</p></div>}</div>

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
