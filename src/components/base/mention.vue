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
        v-for="(currJobType, jobTypeKey) in usersByJobType"
        :key="jobTypeKey"
      >
        <details>
          <summary class="list-none select-none h-[46px] flex items-center px-3 justify-between">
            <h1>{{ currJobType.name }}</h1>

            <icon-mdi:chevron-down />
          </summary>

          <ul class="max-h-[224px] overflow-auto border-t">
            <li
              v-for="(currUser, userKey) in currJobType.users"
              :key="userKey"
              class="px-3 py-2 flex items-center flex-start gap-3"
              @click="insertItem(currUser)"
            >
              <img
                :src="currUser.image"
                alt=""
                class="h-[32px] w-[32px] rounded-full"
              >

              <div class="text-sm">
                <p>{{ currUser.name }}</p>
                <p class="text-neutral-400">
                  {{ currUser.position }}
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
import { VueEditor, Quill } from 'vue2-editor'
import { createPopper } from '@popperjs/core'
import _ from 'lodash'
import { faker } from '@faker-js/faker'

import {
  getMentionCharIndex,
  hasValidMentionCharIndex,
  MentionBlot
} from './mention-helpers'

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

Quill.register(MentionBlot)

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
      default: () => ({
        maxChars: 31,
        minChars: 0,
        mentionDenotationChars: ['@'],
        allowedChars: /^[a-zA-Z0-9_]*$/
      })
    }
  },

  data() {
    return {
      popper: null,
      quill: null,
      searchString: null,
      cursorPos: null,
      mentionCharPos: null
    }
  },

  computed: {
    usersByJobType () {
      return Array.from({ length: 10 }, () => {
        return {
          name: faker.name.jobType(),
          users: Array.from({ length: 5 }, () => {
            return {
              id: _.uniqueId(),
              name: faker.name.fullName(),
              position: faker.name.jobTitle(),
              image: faker.image.people()
            }
          })
        }
      })
    },

    text: {
      get () {
        return this.value
      },
      set (val) {
        const regex = new RegExp('<span class="mention" data-id="(.*?)">.*?</span>', 'gm')
        const newText = val
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

    this.popper = createPopper(this.quill.container, this.$refs['mention-card'])
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

      if (hasValidMentionCharIndex(mentionCharIndex,textBeforeCursor)) {
        const mentionCharPos = this.cursorPos - (textBeforeCursor.length - mentionCharIndex)
        this.mentionCharPos = mentionCharPos
        const textAfter = textBeforeCursor.substring(
          mentionCharIndex + mentionChar.length
        )

        const hasValidChars = this.options.allowedChars.test(textAfter)

        if (textAfter.length >= this.options.minChars && hasValidChars) {
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
        'user'
      )

      this.quill.insertEmbed(insertAtPos, 'mention', data, 'user')
      this.quill.insertText(insertAtPos + 1, ' ', 'user')
      this.quill.setSelection(insertAtPos + 2, 'user')

      this.hideMentionList()
    },

    hideMentionList () {
      if (this.$refs['mention-card']) {
        this.$refs['mention-card'].removeAttribute('data-show')
      }
    },

    showMentionList () {
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

      this.$refs['mention-card'].setAttribute('data-show', '')
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