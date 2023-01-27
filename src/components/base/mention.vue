<template>
  <BasePopper ref="popper">
    <template #base>
      <vue-editor
        id="editor"
        ref="editor"
        v-model="text"
        placeholder="Type a message..."
        :editor-options="assignedEditorOptions"
        class="mb-2"
      />

      <button class="h-[50px] w-full bg-blue-500 text-white">
        Send
      </button>
    </template>

    <template #popper>
      <div id="popper">
        <ul class="rounded shadow">
          <li
            v-for="(item, idx) in $_users_list"
            :key="idx"
            class="p-3"
            @click="insertItem({
              id: item.id,
              text: item.name
            })"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
    </template>
  </BasePopper>
</template>

<script>
import { VueEditor, Quill } from 'vue2-editor'
import _ from 'lodash'

import users from '@/mixins/users'

import {
  getMentionCharIndex,
  hasValidChars,
  hasValidMentionCharIndex,
  getAsync,
  MentionBlot
} from '@/helpers/mention-helpers'

Quill.register(MentionBlot, true)

export default {
  components: {
    VueEditor
  },

  mixins: [users],

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
      searchString: null
    }
  },

  computed: {
    text: {
      get () {
        return this.value
      },
      set (val) {
        const regex = /<span class="mention" data-id="(.+?)" data-text="(.+?)" data-denotation-char="@">.?<span contenteditable="false"><span class="mention-denotation-char">@<\/span>(.+?)<\/span>.?<\/span>/g

        const newVal = val
          .replace(regex, (_str, match) => `<span class="mention">@{${match}}</span>`)

        return this.$emit('input', newVal)
      }
    },

    assignedEditorOptions() {
      return _.defaultsDeep(this.editorOptions, {
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
                  this.quill.setSelection(
                    this.quill.getSelection().index + 1,
                    0
                  )
                }
              },
              enter: {
                key: 13,
                handler: () => {
                  return
                }
              }
            }
          }
        }
      })
    },

    assignedOptions() {
      return _.defaultsDeep(this.options, {
        mentionDenotationChars: ['@'],
        showDenotationChar: true,
        allowedChars: /^[a-zA-Z0-9_]*$/,
        minChars: 0,
        maxChars: 31,
        blotName: 'mention',
        spaceAfterInsert: true
      })
    }
  },

  async mounted () {
    this.quill = await getAsync(this.$refs, ['editor', 'quill'])
    this.popper = this.$refs.popper.instance

    this.quill.on('text-change', this.onTextChange)
    this.quill.on('selection-change', this.onSelectionChange)
    this.quill.container.addEventListener('paste', () => {
      setTimeout(() => {
        const range = this.quill.getSelection()
        this.onSelectionChange(range)
      })
    })
  },

  methods: {

    onTextChange (delta, oldDelta, source) {
      if (source === 'user') {
        this.onInput()
      }
    },

    onSelectionChange (range) {
      if (range && range.length === 0) {
        this.onInput()
      } else {
        this.hideMentionList()
      }
    },

    onInput() {
      const range = this.quill.getSelection()
      if (range == null) return

      this.cursorPos = range.index
      const textBeforeCursor = this.getTextBeforeCursor()
      const { mentionChar, mentionCharIndex } = getMentionCharIndex(
        textBeforeCursor,
        this.assignedOptions.mentionDenotationChars
      )

      if (hasValidMentionCharIndex(mentionCharIndex, textBeforeCursor)) {
        this.mentionCharPos = this.cursorPos - (textBeforeCursor.length - mentionCharIndex)
        this.searchString = textBeforeCursor.substring(mentionCharIndex + mentionChar.length)

        if (
          this.searchString.length >= this.assignedOptions.minChars &&
          hasValidChars(this.searchString, this.assignedOptions.allowedChars)
        ) {
          this.showMentionList()
        } else {
          this.hideMentionList()
        }
      } else {
        this.hideMentionList()
      }
    },

    insertItem(data) {
      if (data === null) {
        return
      }

      const insertAtPos = this.mentionCharPos

      this.quill.deleteText(
        this.mentionCharPos,
        this.cursorPos - this.mentionCharPos,
        Quill.sources.USER
      )

      const renderData = {
        ...data,
        denotationChar: this.assignedOptions.showDenotationChar ? '@' : ''
      }

      this.quill.insertEmbed(
        insertAtPos,
        this.assignedOptions.blotName,
        renderData,
        Quill.sources.USER
      )

      this.quill.insertText(insertAtPos + 1, ' ', Quill.sources.USER)
      this.quill.setSelection(insertAtPos + 2, Quill.sources.USER)
      this.hideMentionList()
    },

    hideMentionList() {
      this.$refs.popper.hide()
    },

    showMentionList () {
      this.$refs.popper.show()
    },

    getTextBeforeCursor() {
      const startPos = Math.max(0, this.cursorPos - this.assignedOptions.maxChars)
      const textBeforeCursorPos = this.quill.getText(
        startPos,
        this.cursorPos - startPos
      )
      return textBeforeCursorPos
    }
  }
}
</script>

<style lang="scss">
.mention {
  height: 24px;
  width: 65px;
  border-radius: 6px;
  background-color: #d3e1eb;
  padding: 3px 0;
  margin-right: 2px;
  user-select: all;
}

</style>