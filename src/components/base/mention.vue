<template>
  <div>
    <vue-editor
      ref="mention-area"
      v-model="text"
      placeholder="Type a message..."
      :editor-options="editorOptions"
      @input="onInput"
    />

    <div
      ref="mention-card"
      class="
        mention-card
        border
        bg-neutral-800
        rounded
        shadow
        w-[200px]
      "
    >
      <ul class="divide-y divide-neutral-700">
        <li
          v-for="i in 5"
          :key="i"
          class="
            p-2
            text-neutral-300
            hover:bg-neutral-700
            transition
          "
        >
          Ernie Jeash
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// libs

// check
// https://github.com/quill-mention/quill-mention/blob/master/src/quill.mention.js
import { VueEditor, Quill } from 'vue2-editor'
import { createPopper } from '@popperjs/core'
import _ from 'lodash'

const trimHtmlTags = str => str && String(str).replace(/<.+?>/g, '')

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

const Inline = Quill.import('blots/inline')

const Parchment = Quill.import('parchment')

const LinkClass = new Parchment.Attributor.Class('link', 'ql-link', {
  scope: Parchment.Scope.INLINE,
  whitelist: ['btn']
})

class InternalLink extends Inline {
  static create(value) {
    const node = super.create(value)
    value = '/test'
    node.setAttribute('href', value)
    return node
  }

  static formats(domNode) {
    return domNode.getAttribute('href')
  }
}

InternalLink.blotName = 'internal_link'
InternalLink.className = 'btn'
InternalLink.tagName = 'A'

Quill.register({
  'attributors/class/link': LinkClass,
  'formats/internal_link': InternalLink
})

const MENTION_PREFIX = '@'

export default {
  components: {
    VueEditor
  },

  props: {
    value: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      popper: null,
      quill: null,
      searchString: null
    }
  },

  computed: {
    text: {
      get () {
        return this.value
      },
      set (val) {
        return this.$emit('input', val)
      }
    },

    editorOptions () {
      return {
        modules: {
          toolbar: false,
          keyboard: {
            bindings: {
              shift_enter: {
                key: 13,
                shiftKey: true,
                handler: range => {
                  /**
                   * Insert new line
                   */
                  this.quill.editor.insertText(range.index, '\n')

                  /**
                   * Move cursor at the end
                   */
                  this.quill.setSelection(this.quill.getSelection().index + 1, 0)
                }
              },
              enter: {
                key: 13,
                handler: () => {
                  if (!this.searchString) {
                    return
                  }

                  const str = '<a class="p-1 bg-red-500 inline">Hello World</a>'

                  console.log(this.text)
                  console.log(`${MENTION_PREFIX}${this.searchString}`)
                  const test = this.text
                    .replace(new RegExp(`${MENTION_PREFIX}${this.searchString}`, 'g'), str)

                  // this.quill.dangerouslyPasteHTML(test, 'user')
                  console.log(test)
                  console.log(this.quill.root.innerHTML = test)

                }
              }
            }
          }
        }
      }
    }
  },

  async mounted () {
    this.quill = await getElement(this.$refs, ['mention-area', 'quill'])
  },

  methods: {
    onInput (text) {
      const quill = this.$refs['mention-area'].quill
      const nonHtmlText = trimHtmlTags(text)

      const lastKeyIndex = nonHtmlText.lastIndexOf('@')
      const lastTextIndex = nonHtmlText.length

      const mention = lastKeyIndex > -1
        ? nonHtmlText.substring(lastKeyIndex + 1, lastTextIndex)
        : ''

      this.searchString = (/\s/gi).test(mention)
        ? null
        : mention

      const lastEl = _.last(quill.root.childNodes)

      const selection = quill.getSelection()
      const bounds = quill.getBounds(selection.index)

      if (this.popper && !this.searchString) {
        this.$refs['mention-card'].removeAttribute('data-show')
        this.popper.destroy()
        this.popper = null

      } else if (!this.popper && this.searchString) {
        this.popper = createPopper(lastEl, this.$refs['mention-card'], {
          placement: 'top-start',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [bounds.left]
              }
            }
          ]
        })

        this.$refs['mention-card'].setAttribute('data-show', '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mention-card {
  display: none;
}

.mention-card[data-show] {
display: block;
}
</style>