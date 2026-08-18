import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {describe, expect, it, vi} from 'vitest'

vi.mock('sanity', () => ({
  useClient: () => ({fetch: () => Promise.resolve([])}),
  useDocumentOperation: () => ({patch: {execute: vi.fn()}}),
}))

import {CanvasEditor, ContentCanvas, SeoChecklist} from '../src/components'

describe('JK529 Studio document views', () => {
  it('renders a canvas-first editor with selected structured blocks', () => {
    const markup = renderToStaticMarkup(createElement(CanvasEditor, {
      documentId: 'drafts.article-1',
      document: {
        displayed: {
          title: '畫布式內容示範',
          slug: {current: 'canvas-editor'},
          body: [{_key: 'block-1', _type: 'block', children: [{_key: 'span-1', _type: 'span', text: '直接在畫布調整內容。'}]}],
        },
      },
      schemaType: {name: 'article'},
      options: {},
    } as any))

    expect(markup).toContain('可視化編輯')
    expect(markup).toContain('直接在畫布調整內容。')
    expect(markup).toContain('＋ 新增區塊')
    expect(markup).toContain('選取區塊')
  })

  it('renders a structured article canvas from editorial sections', () => {
    const markup = renderToStaticMarkup(ContentCanvas({
      document: {
        displayed: {
          title: '夏日保養指南',
          slug: {current: 'summer-care'},
          sections: [
            {_key: 'hero-1', _type: 'heroSection', heading: '從每日保養開始'},
            {_key: 'cta-1', _type: 'callToActionSection', title: '立即探索商品'},
          ],
        },
      },
      schemaType: {name: 'article'},
    } as any))

    expect(markup).toContain('文章編排')
    expect(markup).toContain('夏日保養指南')
    expect(markup).toContain('/summer-care')
    expect(markup).toContain('首屏主視覺')
    expect(markup).toContain('CTA 行動按鈕')
  })

  it('renders publication-ready SEO checks and no-index warning', () => {
    const markup = renderToStaticMarkup(SeoChecklist({
      document: {
        displayed: {
          title: '夏日保養指南',
          slug: {current: 'summer-care'},
          excerpt: '為夏季肌膚規劃清爽而有效的保養流程。',
          seo: {
            metaTitle: '夏日保養指南｜JK529',
            metaDescription: '為夏季肌膚規劃清爽而有效的保養流程。',
            noIndex: true,
          },
        },
      },
    } as any))

    expect(markup).toContain('SEO 檢查')
    expect(markup).toContain('網址 slug')
    expect(markup).toContain('/summer-care')
    expect(markup).toContain('禁止搜尋引擎索引')
  })
})
