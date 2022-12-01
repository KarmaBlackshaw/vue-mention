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

// check
// https://github.com/quill-mention/quill-mention/blob/master/src/quill.mention.js
import { VueEditor, Quill } from 'vue2-editor'
import { createPopper } from '@popperjs/core'
import _ from 'lodash'
import { faker } from '@faker-js/faker'

import {
  attachDataValues,
  getMentionCharIndex,
  hasValidChars,
  hasValidMentionCharIndex
} from './mention/utils'

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

const Embed = Quill.import('blots/embed')

class MentionBlot extends Embed {
  static blotName = 'mention'
  static tagName = 'span'
  static className = 'mention'

  constructor(scroll, node) {
    super(scroll, node)
    this.clickHandler = null
    this.mounted = false
  }

  static create(data) {
    const node = super.create()

    const classes = 'mention-chip bg-blue-500/10 text-blue-500 rounded text-white'

    classes.split(' ').forEach(cls => node.classList.add(cls))

    node.dataset.id = data.id
    node.innerHTML = data.name

    return node
  }

  static value(domNode) {
    return domNode.dataset
  }

  getClickHandler() {
    return e => {
      const event = this.buildEvent('mention-clicked', e)
      window.dispatchEvent(event)
      e.preventDefault()
    }
  }
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
    }
  },

  data() {
    return {
      popper: null,
      quill: null,
      searchString: null,
      cursorPos: null,
      options: {
        mentionCharPos: null,
        maxChars: 31,
        minChars: 1,
        mentionDenotationChars: ['@'],
        isolateCharacter: false,
        allowedChars: /^[a-zA-Z0-9_]*$/
      }
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

    insertItem(data, programmaticInsert) {
      const render = data
      if (render === null) {
        return
      }
      if (!this.options.showDenotationChar) {
        render.denotationChar = ''
      }

      let insertAtPos

      if (!programmaticInsert) {
        insertAtPos = this.mentionCharPos
        this.quill.deleteText(
          this.mentionCharPos,
          this.cursorPos - this.mentionCharPos,
          'user'
        )
      } else {
        insertAtPos = this.cursorPos
      }

      this.quill.insertEmbed(insertAtPos, 'mention', render, 'user')
      this.quill.insertText(insertAtPos + 1, ' ', 'user')
      this.quill.setSelection(insertAtPos + 2, 'user')

      this.hideMentionList()
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