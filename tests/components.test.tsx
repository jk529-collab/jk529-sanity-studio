import {renderToStaticMarkup} from 'react-dom/server'
import {describe, expect, it} from 'vitest'
import {ContentCanvas, SeoChecklist} from '../src/components'

describe('JK529 Studio document views', () => {
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
