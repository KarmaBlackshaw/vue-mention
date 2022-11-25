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
        bg-neutral-800
        rounded
        shadow
        w-[200px]
      "
    >
      <ul class="divide-y divide-neutral-700">
        <li
          v-for="i in 5"
          :key="i"
          class="
            p-2
            text-neutral-300
            hover:bg-neutral-700
            transition
          "
        >
          Ernie Jeash
        </li>
      </ul>
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
      searchString: '',
      popperInstance: null
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
    async onInput (text) {
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

      if (searchString) {
        const options = {
          placement: 'top',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [bounds.left - 100]
              }
            }
          ]
        }

        if (this.popperInstance) {
          await this.popperInstance.setOptions(options)
        } else {
          this.popperInstance = createPopper(lastEl, this.$refs['mention-card'], options)
        }
      } else if (this.popperInstance) {
        this.popperInstance.destroy()
        this.popperInstance = null
      }
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