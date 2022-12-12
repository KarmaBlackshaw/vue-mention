<!--
USAGE:

<base-mention
  v-model="test"
  :options="{
    minChars: 0
  }"
  :search-string.sync="searchString"
>
  <template #default="{ mention }">
    <ul>
      <li
        v-for="(user, userKey) in users"
        :key="jobTypeKey"
        @click="mention({
          id: user.id,
          text: user.name
        })"
      >
      </li>
    </ul>
  </template>
</base-mention>

  -->
<template>
  <div>
    <vue-editor
      id="editor"
      ref="mention-area"
      v-model="text"
      placeholder="Type a message..."
      :editor-options="assignedEditorOptions"
      @input="onSomethingChange"
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
    },
    options: {
      type: Object,
      default: () => ({})
    },
    editorOptions: {
      type: Object,
      default: () => ({})
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

    assignedEditorOptions () {
      return _.defaultsDeep(this.editorOptions, {
        modules: {
          toolbar: false
        }
      })
    },

    assignedOptions () {
      return _.defaultsDeep(this.options, {
        maxChars: 31,
        minChars: 0,
        mentionDenotationChars: ['@'],
        allowedChars: /^[a-zA-Z0-9_]*$/
      })
    }
  },

  async mounted () {
    const [quill, mentionCard] = await Promise.all([
      getElement(this.$refs, ['editor', 'quill']),
      getElement(this.$refs, ['mention-card'])
    ])

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
    getTextBeforeCursor() {
      const startPos = Math.max(0, this.cursorPos - this.assignedOptions.maxChars)
      const textBeforeCursorPos = this.quill.getText(
        startPos,
        this.cursorPos - startPos
      )
      return textBeforeCursorPos
    },

    onSomethingChange () {
      if (!this.quill) {
        return
      }

      const range = this.quill.getSelection()
      if (range == null) {
        return
      }

      this.cursorPos = range.index

      const textBeforeCursor = this.getTextBeforeCursor()
      const { mentionChar, mentionCharIndex } = getMentionCharIndex(
        textBeforeCursor,
        this.assignedOptions.mentionDenotationChars
      )

      if (hasValidMentionCharIndex(mentionCharIndex,textBeforeCursor)) {
        this.mentionCharPos = this.cursorPos - (textBeforeCursor.length - mentionCharIndex)

        this.searchString = textBeforeCursor.substring(mentionCharIndex + mentionChar.length)

        const hasValidChars = this.assignedOptions.allowedChars.test(this.searchString)

        if (this.searchString.length >= this.assignedOptions.minChars && hasValidChars) {

          this.showMentionList()
        } else {
          this.hideMentionList()
        }
      } else {
        this.hideMentionList()
      }
    },

    insertItem (data) {
      if (data === null || !_.has(data, 'id') || !_.has(data, 'text')) {
        return
      }

      const insertAtPos = this.mentionCharPos

      this.quill.deleteText(
        this.mentionCharPos,
        this.cursorPos - this.mentionCharPos,
        'user'
      )

      this.quill.insertEmbed(insertAtPos, 'mention', data, 'user')
      this.quill.insertText(insertAtPos + 1, ' ', 'user')
      this.quill.setSelection(insertAtPos + 2, 'user')

      this.hideMentionList()
    },

    hideMentionList () {
      this.$emit('update:searchString', '')

      this.mentionCard.removeAttribute('data-show')
    },

    showMentionList () {
      this.$emit('update:searchString', this.searchString)

      const containerPos = this.quill.container.getBoundingClientRect()
      const mentionCharPos = this.quill.getBounds(this.mentionCharPos)
      const mentionCharPosAbsolute = {
        left: containerPos.left + mentionCharPos.left,
        top: (mentionCharPos.top * -1) + 30,
        width: 0,
        height: mentionCharPos.height
      }

      this.popper.setOptions({
        placement: 'top-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [mentionCharPosAbsolute.left, mentionCharPosAbsolute.top]
            }
          }
        ]
      })

      this.popper.update()

      this.mentionCard.setAttribute('data-show', '')
    }
  }
}
</script>

<style lang="scss" >
.mention-card {
  display: none;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
}

.mention-card[data-show] {
  display: block;
}

.mention {
  background-color: rgba(0, 140, 255, 0.507);
  color: rgba(0, 140, 255);
  border-radius: 5px;
  padding: 3px 5px;
}
</style>