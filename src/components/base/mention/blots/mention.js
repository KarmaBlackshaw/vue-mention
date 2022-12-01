import Quill from 'quill'

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
    node.innerHTML = data.value

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
