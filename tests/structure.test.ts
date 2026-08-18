import {describe, expect, it, vi} from 'vitest'
import {structure} from '../src/structure'

describe('JK529 Studio navigation structure', () => {
  it('assigns a stable id to the root list pane', () => {
    const rootList = {
      id: vi.fn().mockReturnThis(),
      title: vi.fn().mockReturnThis(),
      items: vi.fn().mockReturnThis(),
    }
    const listItem = () => ({
      title: vi.fn().mockReturnThis(),
      child: vi.fn().mockReturnThis(),
    })
    const singletonDocument = () => ({
      schemaType: vi.fn().mockReturnThis(),
      documentId: vi.fn().mockReturnThis(),
    })
    const documentTypeList = () => ({
      title: vi.fn().mockReturnThis(),
      defaultOrdering: vi.fn().mockReturnThis(),
    })

    structure({
      list: vi.fn(() => rootList),
      listItem,
      divider: vi.fn(),
      document: singletonDocument,
      documentTypeList,
    } as any, {} as any)

    expect(rootList.id).toHaveBeenCalledWith('content-root')
  })
})
