import type {DefaultDocumentNodeResolver, StructureResolver} from 'sanity/structure'
import {CanvasEditor, ContentCanvas, SeoChecklist} from './components'

export const structure: StructureResolver = (S) => S.list().id('content-root').title('內容').items([
  S.listItem().id('site-settings').title('網站設定').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
  S.listItem().id('commerce-settings').title('商務設定').child(S.document().schemaType('commerceSettings').documentId('commerceSettings')),
  S.divider(),
  S.listItem().id('site-pages').title('網站頁面').child(S.documentTypeList('sitePage').id('site-pages').title('網站頁面').defaultOrdering([{field: '_updatedAt', direction: 'desc'}])),
  S.listItem().id('articles').title('文章').child(S.documentTypeList('article').id('articles').title('文章').defaultOrdering([{field: 'publishedAt', direction: 'desc'}])),
  S.listItem().id('products').title('商品').child(S.documentTypeList('product').id('products').title('商品').defaultOrdering([{field: '_updatedAt', direction: 'desc'}])),
])

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  if (['sitePage', 'article', 'product'].includes(schemaType)) {
    return S.document().views([
      S.view.component(CanvasEditor).id('canvas-editor').title('畫布編輯'),
      S.view.form().id('editor').title('進階欄位'),
      S.view.component(ContentCanvas).id('canvas').title('內容結構'),
      S.view.component(SeoChecklist).id('seo').title('SEO'),
    ]).defaultPanes(['canvas-editor'])
  }
  return S.document()
}
