import Quill from 'quill'
import {
  getMentionCharIndex,
  hasValidChars,
  hasValidMentionCharIndex
} from './utils'
import './quill.mention.css'
import './blots/mention'

import { createPopper } from '@popperjs/core'

class Mention {
  constructor(quill, options) {
    this.mentionCharPos = null
    this.cursorPos = null

    this.quill = quill

    this.options = {
      source: null,
      mentionDenotationChars: ['@'],
      showDenotationChar: true,
      allowedChars: /^[a-zA-Z0-9_]*$/,
      minChars: 0,
      maxChars: 31,
      offsetTop: 2,
      offsetLeft: 0,
      isolateCharacter: false,
      fixMentionsToQuill: false,
      blotName: 'mention',
      dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled'],
      // Style options
      mentionContainerClass: 'ql-mention-list-container',
      spaceAfterInsert: true,
      editor: null,
      popper: null
    }

    Object.assign(this.options, options, {
      dataAttributes: Array.isArray(options.dataAttributes)
        ? this.options.dataAttributes.concat(options.dataAttributes)
        : this.options.dataAttributes
    })

    this.popper = createPopper(this.options.editor, this.options.popper)

    quill.on('text-change', this.onTextChange.bind(this))
    quill.on('selection-change', this.onSelectionChange.bind(this))

    //Pasting doesn't fire selection-change after the pasted text is
    //inserted, so here we manually trigger one
    quill.container.addEventListener('paste', () => {
      setTimeout(() => {
        const range = quill.getSelection()
        this.onSelectionChange(range)
      })
    })
  }

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
        Quill.sources.USER
      )
    }

    this.quill.insertEmbed(insertAtPos, this.options.blotName, render, Quill.sources.USER)
    if (this.options.spaceAfterInsert) {
      this.quill.insertText(insertAtPos + 1, ' ', Quill.sources.USER)
      // setSelection here sets cursor position
      this.quill.setSelection(insertAtPos + 2, Quill.sources.USER)
    } else {
      this.quill.setSelection(insertAtPos + 1, Quill.sources.USER)
    }
    this.hideMentionList()
  }

  renderList(mentionChar, data ) {
    if (data && data.length > 0) {
      this.showMentionList()
    } else {
      this.hideMentionList()
    }
  }

  hideMentionList() {
    this.options.popper.removeAttribute('data-show')
  }

  showMentionList () {
    this.options.popper.setAttribute('data-show', '')
  }

  getTextBeforeCursor() {
    const startPos = Math.max(0, this.cursorPos - this.options.maxChars)
    const textBeforeCursorPos = this.quill.getText(
      startPos,
      this.cursorPos - startPos
    )
    return textBeforeCursorPos
  }

  onSomethingChange() {
    const range = this.quill.getSelection()
    if (range == null) return

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
        const sourceRequestToken = {
          abandoned: false
        }
        this.options.source(
          textAfter,
          (data, searchTerm) => {
            if (sourceRequestToken.abandoned) {
              return
            }
            this.renderList(mentionChar, data, searchTerm)
          },
          mentionChar
        )
      } else {
        this.hideMentionList()
      }
    } else {
      this.hideMentionList()
    }
  }

  getAllowedCharsRegex(denotationChar) {
    if (this.options.allowedChars instanceof RegExp) {
      return this.options.allowedChars
    }
    return this.options.allowedChars(denotationChar)

  }

  onTextChange (delta, oldDelta, source) {
    if (source === 'user') {
      this.onSomethingChange()
    }
  }

  onSelectionChange(range) {
    if (range && range.length === 0) {
      this.onSomethingChange()
    } else {
      this.hideMentionList()
    }
  }
}

Quill.register('modules/mention', Mention, true)

export default Mention
