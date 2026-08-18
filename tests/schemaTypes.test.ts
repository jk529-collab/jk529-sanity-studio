import {describe, expect, it} from 'vitest'
import {schemaTypes} from '../src/schemaTypes'

describe('JK529 Studio schema', () => {
  it('contains editorial and commerce document types', () => {
    const names = schemaTypes.map((schema) => schema.name)
    expect(names).toEqual(expect.arrayContaining(['siteSettings', 'commerceSettings', 'sitePage', 'article', 'product']))
  })

  it('contains structured sections for editor-friendly SEO content', () => {
    const names = schemaTypes.map((schema) => schema.name)
    expect(names).toEqual(expect.arrayContaining(['heroSection', 'richTextSection', 'imageSection', 'callToActionSection', 'productCalloutSection', 'faqSection']))
  })
})
