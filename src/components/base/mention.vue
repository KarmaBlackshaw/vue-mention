<template>
  <div>
    <vue-editor
      id="notes-vue-editor"
      v-model="vModelProxy"
      placeholder="Type a message..."
      :editor-options="{
        modules: {
          toolbar: false
        }
      }"
      @input="onInput"
    />
  </div>
</template>

<script>
import { VueEditor } from 'vue2-editor'

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
      const nonHtmlText = trimHtmlTags(text)

      const lastKeyIndex = nonHtmlText.lastIndexOf('@')
      const lastTextIndex = nonHtmlText.length

      const mention = lastKeyIndex > -1
        ? nonHtmlText.substring(lastKeyIndex + 1, lastTextIndex)
        : ''

      this.searchString = (/\s/gi).test(mention)
        ? ''
        : mention
    }
  }
}
</script>

<style lang="scss" scoped>

</style>