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

    this.assignedOptions = {
      source: null,
      mentionDenotationChars: ['@'],
      showDenotationChar: true,
      allowedChars: /^[a-zA-Z0-9_]*$/,
      minChars: 0,
      maxChars: 31,
      offsetTop: 2,
      offsetLeft: 0,
      blotName: 'mention',
      spaceAfterInsert: true,
      editor: null,
      popper: null
    }

    Object.assign(this.assignedOptions, options)

    this.popper = createPopper(this.assignedOptions.editor, this.assignedOptions.popper)

    quill.on('text-change', this.onTextChange.bind(this))
    quill.on('selection-change', this.onSelectionChange.bind(this))
    quill.container.addEventListener('paste', () => {
      setTimeout(() => {
        const range = quill.getSelection()
        this.onSelectionChange(range)
      })
    })
  }

  insertItem(data) {
    const render = data
    if (render === null) {
      return
    }
    if (!this.assignedOptions.showDenotationChar) {
      render.denotationChar = ''
    }

    const insertAtPos = this.mentionCharPos

    this.quill.deleteText(
      this.mentionCharPos,
      this.cursorPos - this.mentionCharPos,
      Quill.sources.USER
    )

    this.quill.insertEmbed(insertAtPos, this.assignedOptions.blotName, render, Quill.sources.USER)
    this.quill.insertText(insertAtPos + 1, ' ', Quill.sources.USER)
    this.quill.setSelection(insertAtPos + 2, Quill.sources.USER)
    this.hideMentionList()
  }

  hideMentionList() {
    this.assignedOptions.popper.removeAttribute('data-show')
  }

  showMentionList () {
    this.assignedOptions.popper.setAttribute('data-show', '')
  }

  getTextBeforeCursor() {
    const startPos = Math.max(0, this.cursorPos - this.assignedOptions.maxChars)
    const textBeforeCursorPos = this.quill.getText(
      startPos,
      this.cursorPos - startPos
    )
    return textBeforeCursorPos
  }

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
      const mentionCharPos = this.cursorPos - (textBeforeCursor.length - mentionCharIndex)
      this.mentionCharPos = mentionCharPos
      const textAfter = textBeforeCursor.substring(mentionCharIndex + mentionChar.length)

      if (
        textAfter.length >= this.assignedOptions.minChars &&
        hasValidChars(textAfter, this.assignedOptions.allowedChars)
      ) {
        this.showMentionList()
      } else {
        this.hideMentionList()
      }
    } else {
      this.hideMentionList()
    }
  }

  onTextChange (delta, oldDelta, source) {
    if (source === 'user') {
      this.onInput()
    }
  }

  onSelectionChange(range) {
    if (range && range.length === 0) {
      this.onInput()
    } else {
      this.hideMentionList()
    }
  }
}

Quill.register('modules/mention', Mention, true)

export default Mention
