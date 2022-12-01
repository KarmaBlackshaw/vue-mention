<template>
  <div>
    <vue-editor
      ref="mention-area"
      v-model="text"
      placeholder="Type a message..."
      :editor-options="editorOptions"
      @input="onSomethingChange"
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

import {
  attachDataValues,
  getMentionCharIndex,
  hasValidChars,
  hasValidMentionCharIndex
} from './mention/utils'

import QuillMention from './mention/quill.mention-2'

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

// Quill.register('modules/mention', QuillMention)

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
      searchString: null,
      cursorPos: null,
      options: {
        maxChars: 31,
        minChars: 1,
        mentionDenotationChars: ['@'],
        isolateCharacter: false,
        allowedChars: /^[a-zA-Z0-9_]*$/
      }
    }
  },

  computed: {
    text: {
      get () {
        return this.value
      },
      set (val) {
        const regex = new RegExp('<span class="mention" data-id="(.*?)">.*?</span>', 'gm')
        const newText = val
          .replace(/\n/g, '')
          .replace(regex, (str, match) => {
            return `<span class="mention">@{${match}}</span>`
          })

        return this.$emit('input', newText)
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

    // new QuillMention(this.quill, {
    //   source (searchTerm, renderList) {
    //     renderList([
    //       {
    //         id: 1,
    //         value: 'Fredrik Sundqvist'
    //       },
    //       {
    //         id: 2,
    //         value: 'Patrik Sjölin'
    //       }
    //     ])
    //   }
    // })
  },

  methods: {
    getTextBeforeCursor() {
      const startPos = Math.max(0, this.cursorPos - this.options.maxChars)
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
        this.options.mentionDenotationChars
      )

      if (
        hasValidMentionCharIndex(
          mentionCharIndex,
          textBeforeCursor,
          this.options.isolateCharacter
        )
      ) {
        const mentionCharPos = this.cursorPos - (textBeforeCursor.length - mentionCharIndex)
        this.mentionCharPos = mentionCharPos
        const textAfter = textBeforeCursor.substring(
          mentionCharIndex + mentionChar.length
        )

        if (
          textAfter.length >= this.options.minChars &&
          hasValidChars(textAfter, this.getAllowedCharsRegex(mentionChar))
        ) {
          this.showMentionList()
        } else {
          if (this.existingSourceExecutionToken) {
            this.existingSourceExecutionToken.abandoned = true
          }
          this.hideMentionList()
        }
      } else {
        if (this.existingSourceExecutionToken) {
          this.existingSourceExecutionToken.abandoned = true
        }
        this.hideMentionList()
      }
    },

    getAllowedCharsRegex(denotationChar) {
      if (this.options.allowedChars instanceof RegExp) {
        return this.options.allowedChars
      }
      return this.options.allowedChars(denotationChar)

    },

    hideMentionList () {
      if (this.$refs['mention-card']) {
        this.$refs['mention-card'].removeAttribute('data-show')
      }

      if (this.popper) {
        this.popper.destroy()
        this.popper = null
      }
    },

    showMentionList () {

      console.log()
      const containerPos = this.quill.container.getBoundingClientRect()
      const mentionCharPos = this.quill.getBounds(this.mentionCharPos)
      const mentionCharPosAbsolute = {
        left: containerPos.left + mentionCharPos.left,
        top: (mentionCharPos.top * -1) + 30,
        width: 0,
        height: mentionCharPos.height
      }

      this.popper = createPopper(this.quill.container, this.$refs['mention-card'], {
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

      this.$refs['mention-card'].setAttribute('data-show', '')
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