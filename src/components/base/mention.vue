<template>
  <div>
    <vue-editor
      ref="mention-area"
      v-model="text"
      placeholder="Type a message..."
      :editor-options="editorOptions"
      @input="onInput"
    />

    <ul
      ref="mention-card"
      class="mention-card w-[424px] max-h-[270px] overflow-auto divide-y shadow-2xl bg-white "
    >
      <li
        v-for="k in 20"
        :key="k"
      >
        <details>
          <summary class="list-none select-none h-[46px] flex items-center px-3 justify-between">
            <h1>Accounting - Invoicing</h1>

            <icon-mdi:chevron-down />
          </summary>

          <ul class="max-h-[224px] overflow-auto border-t">
            <li
              v-for="i in 20"
              :key="i"
              class="px-3 py-2 flex items-center flex-start gap-3"
            >
              <img
                src="https://images.pexels.com/photos/2904619/pexels-photo-2904619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt=""
                class="h-[32px] w-[32px] rounded-full"
              >

              <div class="text-sm">
                <p>Aaron Carter</p>
                <p class="text-neutral-400">
                  Accountants - Invoicing - Chicago
                </p>
              </div>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</template>

<script>
// libs

// check
// https://github.com/quill-mention/quill-mention/blob/master/src/quill.mention.js
import { VueEditor, Quill } from 'vue2-editor'
import { createPopper } from '@popperjs/core'
import _ from 'lodash'

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

const Embed = Quill.import('blots/embed')

class EmbedMention extends Embed {
  static blotName = 'mention'
  static tagName = 'span'

  static create(value) {
    const node = super.create()

    const classes = 'mention-chip bg-blue-500/10 text-blue-500 rounded text-white'

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
                  const totalMentions = this.quill.getContents().ops.filter(x => x.insert?.mention).length
                  const startIndex = this.searchString.startIndex + totalMentions
                  this.quill.deleteText(
                    startIndex,
                    ((this.searchString.endIndex + totalMentions) - startIndex) + 1
                  )

                  /**
                   * Insert mention
                   */
                  const range = this.quill.getSelection()
                  if (range) {
                    this.quill.insertEmbed(range.index, 'mention', 'sample-text')
                    this.quill.insertText(range.index + 1, ' ', 'silent')
                    this.quill.setSelection(range.index + 2, 0)
                  }
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
    onInput () {
      if (!this.quill) {
        return
      }

      const nonHtmlText = this.quill.getText(0, this.quill.getLength())

      const lastKeyIndex = nonHtmlText.lastIndexOf('@')
      const lastTextIndex = nonHtmlText.length

      const mention = lastKeyIndex > -1
        ? nonHtmlText.substring(lastKeyIndex + 1, lastTextIndex)
        : null

      this.searchString = mention && (/[^\s]/g).test(mention)
        ? {
          text: mention,
          startIndex: lastKeyIndex,
          endIndex: lastTextIndex
        }
        : null

      const lastEl = _.last(this.quill.root.childNodes)

      const selection = this.quill.getSelection()
      const bounds = this.quill.getBounds(selection.index)

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
box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
}

.mention-card[data-show] {
display: block;
}

</style>