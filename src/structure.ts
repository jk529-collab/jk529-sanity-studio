import type {DefaultDocumentNodeResolver, StructureResolver} from 'sanity/structure'
import {ContentCanvas, SeoChecklist} from './components'

export const structure: StructureResolver = (S) => S.list().title('內容').items([
  S.listItem().title('網站設定').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
  S.listItem().title('商務設定').child(S.document().schemaType('commerceSettings').documentId('commerceSettings')),
  S.divider(),
  S.listItem().title('網站頁面').child(S.documentTypeList('sitePage').title('網站頁面').defaultOrdering([{field: '_updatedAt', direction: 'desc'}])),
  S.listItem().title('文章').child(S.documentTypeList('article').title('文章').defaultOrdering([{field: 'publishedAt', direction: 'desc'}])),
  S.listItem().title('商品').child(S.documentTypeList('product').title('商品').defaultOrdering([{field: '_updatedAt', direction: 'desc'}])),
])

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, {schemaType}) => {
  if (['sitePage', 'article', 'product'].includes(schemaType)) {
    return S.document().views([
      S.view.form().id('editor').title('編輯'),
      S.view.component(ContentCanvas).id('canvas').title('內容畫布'),
      S.view.component(SeoChecklist).id('seo').title('SEO'),
    ]).defaultPanes(['editor', 'canvas'])
  }
  return S.document()
}
