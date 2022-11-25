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
    onInput() {
      console.log('asdf')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>