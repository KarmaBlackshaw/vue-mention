import { Quill } from 'vue2-editor'

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

function getMentionCharIndex (text, mentionDenotationChars) {
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

function hasValidMentionCharIndex(mentionCharIndex, text) {
  if (mentionCharIndex > -1) {
    if (!(mentionCharIndex === 0 || !!text[mentionCharIndex - 1].match(/\s/g))) {
      return false
    }
    return true
  }
  return false
}

export {
  getMentionCharIndex,
  hasValidMentionCharIndex,
  MentionBlot
}
