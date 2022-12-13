<template>
  <div>
    {{ text }}
    <vue-editor
      id="editor"
      ref="mention-area"
      v-model="text"
      placeholder="Type a message..."
      :editor-options="editorOptions"
    />

    <div id="popper">
      <ul class="rounded shadow">
        <li
          v-for="(item, idx) in items"
          :key="idx"
          class="p-3"
          @click="quillMention.insertItem({
            id: item.id,
            text: item.name
          })"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import QuillMention from '@/mention/quill.mention'
import { VueEditor } from 'vue2-editor'
import _ from 'lodash'
import { faker } from '@faker-js/faker'

const getElement = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

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
      popper: null,
      quill: null,
      quillMention: null,
      searchString: null,
      items: Array.from({ length: 10 }, () => {
        return {
          id: _.uniqueId(),
          name: faker.name.fullName(),
          position: faker.name.jobTitle(),
          image: faker.image.people()
        }
      })
    }
  },

  computed: {
    text: {
      get () {
        return this.value
      },
      set (val) {
        const regex = /<span class="mention" data-id="(.+?)" data-text="(.+?)" data-denotation-char="@">.?<span contenteditable="false"><span class="mention-denotation-char">@<\/span>(.+?)<\/span>.?<\/span>/g

        const newVal = val
          .replace(regex, (_str, match) => `<span class="mention">@{${match}}</span>`)

        return this.$emit('input', newVal)
      }
    },

    editorOptions () {
      return {
        modules: {
          toolbar: false
        }
      }
    }
  },

  async mounted () {
    this.quill = await getElement(this.$refs, ['mention-area', 'quill'])

    this.quillMention =   new QuillMention(this.quill, {
      editor: document.getElementById('editor'),
      popper: document.getElementById('popper')
    }, true)
  }
}
</script>

<style lang="scss" scoped>
.mention-card {
  display: none;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
}

.mention-card[data-show] {
display: block;
}

</style>