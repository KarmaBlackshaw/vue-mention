<template>
  <div
    id="app"
  >
    <div class="container mx-auto py-5 flex flex-col gap-3">
      <div class="flex gap-2">
        <div class="w-full h-[200px] bg-white border p-2 overflow-y-scroll flex flex-col gap-1">
          <div
            v-for="(currMessage, messageKey) in messages"
            :key="messageKey"
            class="block p-1 rounded"
            v-html="renderMessage(currMessage, $_users_dictionary)"
          >
          </div>
        </div>

        <div class="w-full h-[200px] bg-white border p-2 overflow-y-scroll flex flex-col gap-1">
          <div
            v-for="(currMessage, messageKey) in messages"
            :key="messageKey"
            class="block p-1 rounded"
            v-text="renderMessage(currMessage, $_users_dictionary)"
          >
          </div>
        </div>
      </div>

      <base-mention
        v-model="message"
      />

      <button
        class="h-[50px] w-full bg-blue-500 text-white"
        @click="sendMessage"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script>
import users from '@/mixins/users'
import { renderMessage } from '@/helpers/mention-helpers'
export default {
  name: 'App',

  mixins: [users],

  data() {
    return {
      message: '',
      messages: [
        '<p><span class="mention">@{1}</span> here!</p>',
        '<p><span class="mention" data-id="1" data-text="Bertha D\'Amore" data-denotation-char="@">﻿<span contenteditable="false"><span class="mention-denotation-char">@</span>Bertha D\'Amore</span>﻿</span> test</p>'
      ]
    }
  },

  methods: {
    sendMessage() {
      this.messages.push(this.message)
      this.message = ''
    },

    renderMessage
  }
}
</script>
