<template>
  <div
    id="app"
  >
    <div class="container mx-auto py-5">
      <div class="w-full h-[100px] bg-white border mb-2">
        {{ }}
      </div>

      <base-mention v-model="test" />
    </div>
  </div>
</template>

<script>
import users from '@/mixins/users'

export default {
  name: 'App',

  mixins: [users],

  data() {
    return {
      test: ''
    }
  }
}
</script>
