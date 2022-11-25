<template>
  <div
    id="app"
  >
    <div
      class="
        border w-[400px]
        flex flex-col gap-2
        p-2
      "
    >
      <div class="grow p-2 border">
        text
      </div>

      <base-mention class="overflow-auto" />

      <button class="bg-blue-500 h-[50px] text-white">
        Send
      </button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>
