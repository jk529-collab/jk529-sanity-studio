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
    defineField({name: 'sections', title: '內容區塊', type: 'array', group: 'content', of: [defineArrayMember({type: 'heroSection'}), defineArrayMember({type: 'richTextSection'}), defineArrayMember({type: 'imageSection'}), defineArrayMember({type: 'callToActionSection'}), defineArrayMember({type: 'productCalloutSection'}), defineArrayMember({type: 'faqSection'})]}),
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

export const schemaTypes = [seo, hero, richText, imageSection, cta, productCallout, faq, siteSettings, commerceSettings, sitePage, article, product]
