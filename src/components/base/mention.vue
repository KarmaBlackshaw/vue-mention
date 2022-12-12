<template>
  <div>
    <vue-editor
      id="editor"
      ref="mention-area"
      v-model="text"
      placeholder="Type a message..."
      :editor-options="editorOptions"
    />

    <div id="popper">
      <ul>
        <li
          v-for="(item, idx) in items"
          :key="item.id"
          @click="quillMention._selectItem({
            denotationChar: '@',
            id: item.id,
            index: idx,
            value: item.value

          })"
        >
          {{ item.value }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// libs
import QuillMention from '@/mention/quill.mention'

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
      quillMention: null,
      searchString: null,
      items: [
        {
          id: 1,
          value: 'Fredrik Sundqvist'
        },
        {
          id: 2,
          value: 'Patrik Sjölin'
        }
      ]
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
          toolbar: false
        }
      }
    }
  },

  async mounted () {
    this.quill = await getElement(this.$refs, ['mention-area', 'quill'])

    this.quillMention =   new QuillMention(this.quill, {
      editor: document.getElementById('editor'),
      popper: document.getElementById('popper'),
      source (searchTerm, renderList) {
        renderList([
          {
            id: 1,
            value: 'Fredrik Sundqvist'
          },
          {
            id: 2,
            value: 'Patrik Sjölin'
          }
        ])
      }
    }, true)
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