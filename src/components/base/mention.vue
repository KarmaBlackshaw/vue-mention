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
          v-for="(item, index) in 5"
          :key="index"
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

const Embed = Quill.import('blots/embed')

class EmbedMention extends Embed {
  static blotName = 'embedMention'
  static tagName = 'span'

  static create(value) {
    const node = super.create()

    const classes = 'mx-1 px-1 py-[2px] bg-blue-500 rounded text-white'

    classes.split(' ').forEach(cls => node.classList.add(cls))
    node.innerText = value
    return node
  }
}

Quill.register(EmbedMention)

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

                  /**
                   * Remove raw mention
                   */
                  this.quill.deleteText(
                    this.searchString.startIndex,
                    (this.searchString.endIndex - this.searchString.startIndex) + 1
                  )

                  /**
                   * Insert mention
                   */
                  const range = this.quill.getSelection()
                  if (range) {
                    this.quill.insertEmbed(range.index, 'embedMention', 'hello world')
                  }

                  /**
                   * Move cursor to the end
                   */
                  this.quill.setSelection(this.quill.getSelection().index + 1, 0)
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

      this.searchString = (/\s/gi).test(mention) || !mention
        ? null
        : {
          text: mention,
          startIndex: lastKeyIndex,
          endIndex: lastTextIndex
        }

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