import {defineArrayMember, defineField, defineType} from 'sanity'

const seo = defineType({
  name: 'seo', title: 'SEO 設定', type: 'object',
  fields: [
    defineField({name: 'metaTitle', title: 'SEO 標題', type: 'string', validation: (Rule) => Rule.max(60).warning('建議控制在 60 字元內。')}),
    defineField({name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, validation: (Rule) => Rule.max(160).warning('建議控制在 160 字元內。')}),
    defineField({name: 'canonicalUrl', title: 'Canonical URL（選填）', type: 'url'}),
    defineField({name: 'noIndex', title: '禁止搜尋引擎索引', type: 'boolean', initialValue: false}),
  ],
})

const accessibilityImage = defineArrayMember({
  type: 'image', options: {hotspot: true},
  fields: [defineField({name: 'alt', title: '替代文字', type: 'string', validation: (Rule) => Rule.required().warning('圖片需要替代文字以符合可近用性與 SEO。')})],
})

const hero = defineType({
  name: 'heroSection', title: '首屏主視覺', type: 'object',
  fields: [
    defineField({name: 'eyebrow', title: '眉標', type: 'string'}),
    defineField({name: 'heading', title: '主標題', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'summary', title: '摘要', type: 'text', rows: 3}),
    defineField({name: 'image', title: '主視覺圖片', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: '替代文字', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'ctaLabel', title: '行動按鈕文字', type: 'string'}),
    defineField({name: 'ctaUrl', title: '行動按鈕連結', type: 'url'}),
  ],
  preview: {select: {title: 'heading', subtitle: 'eyebrow', media: 'image'}},
})

const richText = defineType({
  name: 'richTextSection', title: '圖文內容', type: 'object',
  fields: [
    defineField({name: 'heading', title: '區塊標題', type: 'string'}),
    defineField({name: 'body', title: '內文', type: 'array', of: [defineArrayMember({type: 'block'}), accessibilityImage]}),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '圖文內容'})},
})

const imageSection = defineType({
  name: 'imageSection', title: '圖片／圖集', type: 'object',
  fields: [
    defineField({name: 'image', title: '圖片', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: '替代文字', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'caption', title: '圖片說明', type: 'string'}),
    defineField({name: 'layout', title: '版型', type: 'string', options: {list: [{title: '寬幅', value: 'wide'}, {title: '內文寬度', value: 'content'}, {title: '靠左', value: 'left'}]}, initialValue: 'content'}),
  ],
  preview: {select: {title: 'caption', media: 'image'}, prepare: ({title, media}) => ({title: title || '圖片區塊', media})},
})

const cta = defineType({
  name: 'callToActionSection', title: 'CTA 行動按鈕', type: 'object',
  fields: [
    defineField({name: 'heading', title: '標題', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'body', title: '說明', type: 'text', rows: 3}),
    defineField({name: 'label', title: '按鈕文字', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'url', title: '按鈕連結', type: 'url', validation: (Rule) => Rule.required()}),
  ],
  preview: {select: {title: 'heading', subtitle: 'label'}, prepare: ({title, subtitle}) => ({title: title || 'CTA', subtitle})},
})

const productCallout = defineType({
  name: 'productCalloutSection', title: '商品卡', type: 'object',
  fields: [
    defineField({name: 'product', title: '選擇商品', type: 'reference', to: [{type: 'product'}], validation: (Rule) => Rule.required()}),
    defineField({name: 'label', title: '行動文字', type: 'string', initialValue: '查看商品'}),
    defineField({name: 'overrideSummary', title: '自訂短說明（選填）', type: 'text', rows: 2}),
  ],
  preview: {select: {title: 'product.title', subtitle: 'label', media: 'product.mainImage'}, prepare: ({title, subtitle, media}) => ({title: title || '商品卡', subtitle, media})},
})

const productGrid = defineType({
  name: 'productGridSection', title: '商品列表', type: 'object',
  fields: [
    defineField({name: 'heading', title: '區塊標題', type: 'string', initialValue: '熱門商品'}),
    defineField({name: 'summary', title: '區塊說明', type: 'text', rows: 2}),
    defineField({name: 'products', title: '商品', type: 'array', of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})]}),
    defineField({name: 'columns', title: '欄數', type: 'number', options: {list: [2, 3, 4]}, initialValue: 3}),
    defineField({name: 'cardActionLabel', title: '商品卡按鈕文字', type: 'string', initialValue: '查看商品'}),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '商品列表'})},
})

const productDetail = defineType({
  name: 'productDetailSection', title: '商品詳情', type: 'object',
  fields: [
    defineField({name: 'product', title: '選擇商品', type: 'reference', to: [{type: 'product'}], validation: (Rule) => Rule.required()}),
    defineField({name: 'showVariants', title: '顯示規格選擇', type: 'boolean', initialValue: true}),
    defineField({name: 'showCommercePrice', title: '顯示商務系統價格', type: 'boolean', initialValue: true}),
    defineField({name: 'addToCartLabel', title: '加入購物車文字', type: 'string', initialValue: '加入購物車'}),
    defineField({name: 'buyNowLabel', title: '立即購買文字', type: 'string', initialValue: '立即購買'}),
  ],
  preview: {select: {title: 'product.title', subtitle: 'addToCartLabel', media: 'product.mainImage'}, prepare: ({title, subtitle, media}) => ({title: title || '商品詳情', subtitle, media})},
})

const cart = defineType({
  name: 'cartSection', title: '購物車入口', type: 'object',
  fields: [
    defineField({name: 'heading', title: '標題', type: 'string', initialValue: '你的購物車'}),
    defineField({name: 'emptyMessage', title: '空購物車提示', type: 'string', initialValue: '購物車目前是空的。'}),
    defineField({name: 'checkoutLabel', title: '結帳按鈕文字', type: 'string', initialValue: '前往結帳'}),
    defineField({name: 'cartPath', title: '購物車路徑／事件識別', type: 'string', initialValue: '/cart', description: '由前台商務後端接手，Studio 不保存購物車內容。'}),
  ],
  preview: {select: {title: 'heading', subtitle: 'cartPath'}, prepare: ({title, subtitle}) => ({title: title || '購物車入口', subtitle})},
})

const mediaGallery = defineType({
  name: 'mediaGallerySection', title: '媒體圖庫', type: 'object',
  fields: [
    defineField({name: 'heading', title: '圖庫標題', type: 'string'}),
    defineField({name: 'images', title: '圖庫圖片', type: 'array', of: [accessibilityImage]}),
    defineField({name: 'columns', title: '欄數', type: 'number', options: {list: [2, 3, 4]}, initialValue: 3}),
    defineField({name: 'showCaptions', title: '顯示圖片說明', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'heading', media: 'images.0'}, prepare: ({title, media}) => ({title: title || '媒體圖庫', media})},
})

const storeSearch = defineType({
  name: 'storeSearchSection', title: '商店搜尋', type: 'object',
  fields: [
    defineField({name: 'placeholder', title: '搜尋提示文字', type: 'string', initialValue: '搜尋商品'}),
    defineField({name: 'buttonLabel', title: '搜尋按鈕文字', type: 'string', initialValue: '搜尋'}),
    defineField({name: 'searchPath', title: '搜尋路徑／事件識別', type: 'string', initialValue: '/search'}),
  ],
  preview: {select: {title: 'placeholder', subtitle: 'searchPath'}, prepare: ({title, subtitle}) => ({title: '商店搜尋', subtitle: title || subtitle})},
})

const beforeAfter = defineType({
  name: 'beforeAfterSection', title: 'Before／After 對照', type: 'object',
  fields: [defineField({name: 'heading', title: '區塊標題', type: 'string', initialValue: '改變前後'}), defineField({name: 'beforeImage', title: 'Before 圖片', type: 'image', options: {hotspot: true}}), defineField({name: 'afterImage', title: 'After 圖片', type: 'image', options: {hotspot: true}}), defineField({name: 'beforeLabel', title: 'Before 標籤', type: 'string', initialValue: 'Before'}), defineField({name: 'afterLabel', title: 'After 標籤', type: 'string', initialValue: 'After'}), defineField({name: 'description', title: '說明', type: 'text', rows: 3})],
  preview: {select: {title: 'heading', media: 'afterImage'}, prepare: ({title, media}) => ({title: title || 'Before／After 對照', media})},
})

const pricing = defineType({
  name: 'pricingSection', title: '方案報價', type: 'object',
  fields: [defineField({name: 'heading', title: '區塊標題', type: 'string', initialValue: '選擇適合你的方案'}), defineField({name: 'summary', title: '區塊說明', type: 'text', rows: 2}), defineField({name: 'plans', title: '方案', type: 'array', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'name', title: '方案名稱', type: 'string'}), defineField({name: 'price', title: '價格文字', type: 'string'}), defineField({name: 'description', title: '方案說明', type: 'text', rows: 2}), defineField({name: 'features', title: '特色', type: 'array', of: [defineArrayMember({type: 'string'})]}), defineField({name: 'ctaLabel', title: '按鈕文字', type: 'string', initialValue: '選擇方案'}), defineField({name: 'ctaUrl', title: '按鈕連結', type: 'url'}), defineField({name: 'featured', title: '推薦方案', type: 'boolean', initialValue: false})]})]})],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '方案報價'})},
})

const quoteForm = defineType({
  name: 'quoteFormSection', title: '估價彈窗／智能表單', type: 'object',
  fields: [defineField({name: 'heading', title: '標題', type: 'string', initialValue: '取得專屬報價'}), defineField({name: 'summary', title: '說明', type: 'text', rows: 3}), defineField({name: 'buttonLabel', title: '開啟按鈕文字', type: 'string', initialValue: '立即估價'}), defineField({name: 'submitLabel', title: '送出按鈕文字', type: 'string', initialValue: '送出需求'}), defineField({name: 'submitPath', title: '送出路徑／事件識別', type: 'string', initialValue: '/api/quote'})],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '估價彈窗／智能表單'})},
})

const caseStudy = defineType({name: 'caseStudySection', title: '案例展示', type: 'object', fields: [defineField({name: 'heading', title: '區塊標題', type: 'string', initialValue: '成功案例'}), defineField({name: 'cases', title: '案例', type: 'array', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'title', title: '案例標題', type: 'string'}), defineField({name: 'client', title: '客戶／品牌', type: 'string'}), defineField({name: 'summary', title: '案例摘要', type: 'text', rows: 3}), defineField({name: 'image', title: '案例圖片', type: 'image', options: {hotspot: true}}), defineField({name: 'url', title: '案例連結', type: 'url'})]})]})], preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '案例展示'})}})
const testimonial = defineType({name: 'testimonialSection', title: '真實客戶回饋', type: 'object', fields: [defineField({name: 'heading', title: '區塊標題', type: 'string', initialValue: '客戶怎麼說'}), defineField({name: 'items', title: '客戶回饋', type: 'array', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'quote', title: '回饋內容', type: 'text', rows: 4}), defineField({name: 'name', title: '姓名', type: 'string'}), defineField({name: 'role', title: '職稱／公司', type: 'string'}), defineField({name: 'rating', title: '評分', type: 'number'})]})]})], preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '真實客戶回饋'})}})
const lineContact = defineType({name: 'lineContactSection', title: 'LINE 聯繫入口', type: 'object', fields: [defineField({name: 'heading', title: '標題', type: 'string', initialValue: '需要協助嗎？'}), defineField({name: 'summary', title: '說明', type: 'text', rows: 2}), defineField({name: 'buttonLabel', title: '按鈕文字', type: 'string', initialValue: '加入 LINE 好友'}), defineField({name: 'lineUrl', title: 'LINE 連結', type: 'url'}), defineField({name: 'qrCode', title: 'QR Code', type: 'image'})], preview: {select: {title: 'heading', media: 'qrCode'}, prepare: ({title, media}) => ({title: title || 'LINE 聯繫入口', media})}})
const video = defineType({name: 'videoSection', title: '影片', type: 'object', fields: [defineField({name: 'heading', title: '影片標題', type: 'string'}), defineField({name: 'url', title: '影片網址', type: 'url'}), defineField({name: 'videoFile', title: '影片檔案（選填）', type: 'file', options: {accept: 'video/*'}}), defineField({name: 'poster', title: '封面圖片', type: 'image', options: {hotspot: true}}), defineField({name: 'caption', title: '影片說明', type: 'text', rows: 2}), defineField({name: 'autoplay', title: '自動播放（需靜音）', type: 'boolean', initialValue: false})], preview: {select: {title: 'heading', media: 'poster'}, prepare: ({title, media}) => ({title: title || '影片', media})}})
const htmlCss = defineType({name: 'htmlCssSection', title: 'HTML／CSS 進階區塊', type: 'object', fields: [defineField({name: 'label', title: '編輯器標籤', type: 'string', initialValue: '進階自訂區塊'}), defineField({name: 'html', title: 'HTML', type: 'text', rows: 10}), defineField({name: 'css', title: 'CSS', type: 'text', rows: 10}), defineField({name: 'scriptAllowed', title: '允許前台腳本', type: 'boolean', initialValue: false})], preview: {select: {title: 'label'}, prepare: ({title}) => ({title: title || 'HTML／CSS 進階區塊'})}})

const faq = defineType({
  name: 'faqSection', title: '常見問題', type: 'object',
  fields: [
    defineField({name: 'heading', title: '區塊標題', type: 'string', initialValue: '常見問題'}),
    defineField({name: 'items', title: '問題項目', type: 'array', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'question', title: '問題', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'answer', title: '回答', type: 'text', rows: 4, validation: (Rule) => Rule.required()})]})]}),
  ],
  preview: {select: {title: 'heading'}, prepare: ({title}) => ({title: title || '常見問題'})},
})

const sitePage = defineType({
  name: 'sitePage', title: '網站頁面', type: 'document',
  groups: [{name: 'content', title: '內容', default: true}, {name: 'seo', title: 'SEO'}, {name: 'governance', title: '治理'}],
  fields: [
    defineField({name: 'title', title: '頁面標題', type: 'string', group: 'content', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: '網址 slug', type: 'slug', group: 'content', options: {source: 'title', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'sections', title: '內容區塊', type: 'array', group: 'content', of: [defineArrayMember({type: 'heroSection'}), defineArrayMember({type: 'richTextSection'}), defineArrayMember({type: 'imageSection'}), defineArrayMember({type: 'mediaGallerySection'}), defineArrayMember({type: 'callToActionSection'}), defineArrayMember({type: 'productCalloutSection'}), defineArrayMember({type: 'productGridSection'}), defineArrayMember({type: 'productDetailSection'}), defineArrayMember({type: 'cartSection'}), defineArrayMember({type: 'storeSearchSection'}), defineArrayMember({type: 'beforeAfterSection'}), defineArrayMember({type: 'pricingSection'}), defineArrayMember({type: 'quoteFormSection'}), defineArrayMember({type: 'caseStudySection'}), defineArrayMember({type: 'testimonialSection'}), defineArrayMember({type: 'lineContactSection'}), defineArrayMember({type: 'videoSection'}), defineArrayMember({type: 'htmlCssSection'}), defineArrayMember({type: 'faqSection'})]}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
    defineField({name: 'editorialNotes', title: '僅限編輯團隊備註', type: 'text', rows: 4, group: 'governance'}),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}, prepare: ({title, subtitle}) => ({title, subtitle: subtitle ? `/${subtitle}` : '尚未設定網址'})},
})

const article = defineType({
  name: 'article', title: '文章', type: 'document',
  groups: [{name: 'content', title: '內容', default: true}, {name: 'seo', title: 'SEO'}],
  fields: [
    defineField({name: 'title', title: '文章標題', type: 'string', group: 'content', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: '網址 slug', type: 'slug', group: 'content', options: {source: 'title', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'excerpt', title: '摘要', type: 'text', rows: 3, group: 'content', validation: (Rule) => Rule.max(160).warning('建議控制在 160 字元內，可用作搜尋摘要。')}),
    defineField({name: 'publishedAt', title: '發布日期', type: 'datetime', group: 'content'}),
    defineField({name: 'featuredImage', title: '封面圖片', type: 'image', group: 'content', options: {hotspot: true}, fields: [defineField({name: 'alt', title: '替代文字', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'body', title: '文章內容', type: 'array', group: 'content', of: [defineArrayMember({type: 'block'}), accessibilityImage, defineArrayMember({type: 'callToActionSection'}), defineArrayMember({type: 'productCalloutSection'})]}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'publishedAt', media: 'featuredImage'}},
})

const product = defineType({
  name: 'product', title: '商品', type: 'document',
  groups: [{name: 'content', title: '商品內容', default: true}, {name: 'commerce', title: '商務對應'}, {name: 'seo', title: 'SEO'}],
  fields: [
    defineField({name: 'title', title: '商品名稱', type: 'string', group: 'content', validation: (Rule) => Rule.required()}),
    defineField({name: 'slug', title: '網址 slug', type: 'slug', group: 'content', options: {source: 'title', maxLength: 96}, validation: (Rule) => Rule.required()}),
    defineField({name: 'summary', title: '商品摘要', type: 'text', rows: 3, group: 'content'}),
    defineField({name: 'mainImage', title: '主圖', type: 'image', group: 'content', options: {hotspot: true}, fields: [defineField({name: 'alt', title: '替代文字', type: 'string', validation: (Rule) => Rule.required()})]}),
    defineField({name: 'content', title: '商品說明', type: 'array', group: 'content', of: [defineArrayMember({type: 'block'}), accessibilityImage]}),
    defineField({name: 'commerceProductId', title: '商務系統商品 ID', type: 'string', group: 'commerce', description: '由後端商務資料庫建立後回寫，用於價格、庫存、購物車與訂單。'}),
    defineField({name: 'variants', title: '展示規格', type: 'array', group: 'commerce', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'title', title: '規格名稱', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'sku', title: 'SKU', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'commerceVariantId', title: '商務規格 ID', type: 'string'}), defineField({name: 'priceHint', title: '展示價格（TWD）', type: 'number', validation: (Rule) => Rule.min(0)}), defineField({name: 'availableForSale', title: '可購買', type: 'boolean', initialValue: true})]})]}),
    defineField({name: 'shippingClass', title: '配送類別', type: 'string', group: 'commerce', options: {list: [{title: '常溫', value: 'ambient'}, {title: '冷藏', value: 'chilled'}, {title: '冷凍', value: 'frozen'}, {title: '數位／無實體配送', value: 'digital'}]}, initialValue: 'ambient'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'commerceProductId', media: 'mainImage'}},
})

const siteSettings = defineType({
  name: 'siteSettings', title: '網站設定', type: 'document',
  fields: [defineField({name: 'siteTitle', title: '網站名稱', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'siteDescription', title: '網站描述', type: 'text', rows: 3}), defineField({name: 'defaultSeo', title: '預設 SEO', type: 'seo'}), defineField({name: 'defaultLocale', title: '預設語言', type: 'string', initialValue: 'zh-TW'})],
})

const commerceSettings = defineType({
  name: 'commerceSettings', title: '商務設定', type: 'document',
  fields: [
    defineField({name: 'defaultCurrency', title: '預設幣別', type: 'string', initialValue: 'TWD', validation: (Rule) => Rule.required()}),
    defineField({name: 'paymentProviderKey', title: '支付服務商識別', type: 'string', description: '僅保存服務商識別，不保存金流密鑰。'}),
    defineField({name: 'shippingProviderKey', title: '物流服務商識別', type: 'string', description: '候選數位鎏等服務商確定後由後端 adapter 使用。'}),
    defineField({name: 'deliveryMethods', title: '可用配送方式', type: 'array', of: [defineArrayMember({type: 'object', fields: [defineField({name: 'key', title: '識別', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'title', title: '顯示名稱', type: 'string', validation: (Rule) => Rule.required()}), defineField({name: 'type', title: '類型', type: 'string', options: {list: [{title: '超商取貨', value: 'convenienceStore'}, {title: '宅配', value: 'homeDelivery'}, {title: '跨境配送', value: 'crossBorder'}]}})]})]}),
  ],
})

export const schemaTypes = [seo, hero, richText, imageSection, mediaGallery, cta, productCallout, productGrid, productDetail, cart, storeSearch, beforeAfter, pricing, quoteForm, caseStudy, testimonial, lineContact, video, htmlCss, faq, siteSettings, commerceSettings, sitePage, article, product]
