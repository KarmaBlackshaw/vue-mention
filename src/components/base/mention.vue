<template>
  <div>
    <vue-editor
      ref="mention-area"
      v-model="vModelProxy"
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
      :class="[popper ? 'block' : 'hidden']"
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
import { VueEditor } from 'vue2-editor'
import { createPopper } from '@popperjs/core'
import _ from 'lodash'

const trimHtmlTags = str => str && String(str).replace(/<.+?>/g, '')

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

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
      quill: null
    }
  },

  computed: {
    vModelProxy: {
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
                handler: () => { // submit form }
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

      const searchString = (/\s/gi).test(mention)
        ? ''
        : mention

      const lastEl = _.last(quill.root.childNodes)

      const selection = quill.getSelection()
      const bounds = quill.getBounds(selection.index)

      if (this.popper && !searchString) {
        this.popper.destroy()
        this.popper = null
      } else if (!this.popper && searchString) {
        this.popper = createPopper(lastEl, this.$refs['mention-card'], {
          placement: 'auto-start',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [bounds.left]
              }
            }
          ]
        })
      }
    }
  }
}
</script>
