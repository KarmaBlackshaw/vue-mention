import Quill from 'quill'

const Embed = Quill.import('blots/embed')

class MentionBlot extends Embed {
  static blotName = 'mention';
  static tagName = 'span';
  static className = 'mention';

  constructor(scroll, node) {
    super(scroll, node)
  }

  static create(data) {
    const node = super.create()
    const denotationChar = document.createElement('span')
    denotationChar.className = 'ql-mention-denotation-char'
    denotationChar.innerHTML = data.denotationChar
    node.appendChild(denotationChar)
    node.innerHTML += data.value
    return MentionBlot.setDataValues(node, data)
  }

  static setDataValues(element, data) {
    const domNode = element
    Object.keys(data).forEach(key => {
      domNode.dataset[key] = data[key]
    })
    return domNode
  }

  static value(domNode) {
    return domNode.dataset
  }
}

Quill.register(MentionBlot)
