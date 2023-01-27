
import _ from 'lodash'
import { Quill } from 'vue2-editor'

const Embed = Quill.import('blots/embed')

export class MentionBlot extends Embed {
  static blotName = 'mention';
  static tagName = 'span';
  static className = 'mention';
  static dataAttributes = ['id', 'text', 'denotationChar']

  constructor(scroll, node) {
    super(scroll, node)
  }

  static create(data) {
    const node = super.create()

    if (data.denotationChar) {
      const denotationChar = document.createElement('span')
      denotationChar.className = 'mention-denotation-char'
      denotationChar.innerHTML = data.denotationChar
      node.appendChild(denotationChar)
    }

    node.innerHTML += data.text
    return MentionBlot.setDataValues(node, data)
  }

  static setDataValues(element, data) {
    const domNode = element
    MentionBlot.dataAttributes.forEach(key => {
      domNode.dataset[key] = data[key]
    })
    return domNode
  }

  static value(domNode) {
    return domNode.dataset
  }
}

export function getMentionCharIndex(text, mentionDenotationChars) {
  return mentionDenotationChars.reduce(
    (prev, mentionChar) => {
      const mentionCharIndex = text.lastIndexOf(mentionChar)

      if (mentionCharIndex > prev.mentionCharIndex) {
        return {
          mentionChar,
          mentionCharIndex
        }
      }
      return {
        mentionChar: prev.mentionChar,
        mentionCharIndex: prev.mentionCharIndex
      }
    },
    { mentionChar: null, mentionCharIndex: -1 }
  )
}

export function isMessageMention(txt) {
  return /@{(.+?)}/g.test(txt)
}

export function hasValidChars(text, allowedChars) {
  return allowedChars.test(text)
}

export function hasValidMentionCharIndex(mentionCharIndex, text) {
  if (mentionCharIndex > -1) {
    if (
      !(mentionCharIndex === 0 || !!text[mentionCharIndex - 1].match(/\s/g))
    ) {
      return false
    }
    return true
  }
  return false
}

export async function getAsync (base, path)  {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

export function renderMessage(txt, dictionary) {
  if (!isMessageMention(txt)) {
    return txt
  }

  const data = txt.replace(/<span class="mention">(@\{[^}]+\})<\/span>/, (match, value) => {
    const key = value.replace(/@\{([^}]+)\}/, '$1')
    if (key in dictionary) {
      // eslint-disable-next-line no-irregular-whitespace
      return `<span class="mention" data-id="${key}" data-text="${dictionary[key]}" data-denotation-char="@">﻿<span contenteditable="false"><span class="mention-denotation-char">@</span>${dictionary[key]}</span>﻿</span>`
    }

    return match
  })

  return data
}