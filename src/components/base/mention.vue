<template>
  <div>
    <vue-editor
      ref="mention-area"
      v-model="vModelProxy"
      placeholder="Type a message..."
      :editor-options="{
        modules: {
          toolbar: false
        }
      }"
      @input="onInput"
    />

    <div
      ref="mention-card"
      class="
        mention-card
        border
        p-2
        bg-neutral-800
        text-white rounded
        shadow
      "
    >
      hey
    </div>
  </div>
</template>

<script>
// libs
import { VueEditor } from 'vue2-editor'
import { createPopper } from '@popperjs/core'
import _ from 'lodash'

const trimHtmlTags = str => str && String(str).replace(/<.+?>/g, '')

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
      searchString: ''
    }
  },

  computed: {
    vModelProxy: {
      get () {
        return this.value
      },
      set (val) {
        return this.$emit('input', val)
      }
    }
  },

  methods: {
    onInput (text) {
      const quill = this.$refs['mention-area'].quill
      const nonHtmlText = trimHtmlTags(text)

      const lastKeyIndex = nonHtmlText.lastIndexOf('@')
      const lastTextIndex = nonHtmlText.length

      const mention = lastKeyIndex > -1
        ? nonHtmlText.substring(lastKeyIndex + 1, lastTextIndex)
        : ''

      const searchString = (/\s/gi).test(mention)
        ? ''
        : mention

      const lastEl = _.last(quill.root.childNodes)

      const selection = quill.getSelection()
      const bounds = quill.getBounds(selection.index)

      createPopper(lastEl, this.$refs['mention-card'], {
        placement: 'top-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [bounds.left - 10]
            }
          }
        ]

      })
    }
  }
}
</script>

<style lang="scss" scoped>
#mention-card {
}

#mention-card[data-show] {
  display: block;
}
</style>