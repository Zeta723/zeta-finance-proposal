import { Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

export interface FontSizeOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: number) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

/**
 * 局部文字字體大小標記，掛在 TextStyle 的 mark 屬性上（Tiptap 官方推薦的自訂字級做法）。
 * 只影響被選取的文字，不影響其他文字或整個節點。
 */
export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return { types: ['textStyle'] }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace('px', '') || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}px` }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (size: number) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: size }).run()
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
        }
    }
  }
})
