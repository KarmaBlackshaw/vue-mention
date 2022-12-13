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
          :key="item.id"
          class="p-3"
          @click="quillMention.insertItem({
            denotationChar: '@',
            id: item.id,
            index: idx,
            value: item.name
          })"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// libs
import QuillMention from '@/mention/quill.mention'

// check
// https://github.com/quill-mention/quill-mention/blob/master/src/quill.mention.js
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
        return this.$emit('input', val)
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
      popper: document.getElementById('popper'),
      source (searchTerm, renderList) {
        renderList([
          {
            id: 1,
            value: 'Fredrik Sundqvist'
          },
          {
            id: 2,
            value: 'Patrik Sjölin'
          }
        ])
      }
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