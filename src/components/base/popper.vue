<!--
Usage:

import BasePopper from '@/components/shared/BasePopper'

<BasePopper>
  <template #base="{ show, hide, toggle, update }">

  </template>

  <template #popper>

  </template>
</BasePopper>
-->

<template>
  <div
    class="popper-container"
  >
    <div ref="base">
      <slot
        v-bind="{ show, hide, toggle }"
        name="base"
      ></slot>
    </div>
    <div
      ref="popper"
      class="popper"
    >
      <slot name="popper"></slot>
    </div>
  </div>
</template>

<script>
// libs
import { createPopper } from '@popperjs/core'
import _ from 'lodash'

// directives

export default {
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    instance: null,
    base: null,
    popper: null
  }),
  computed: {
    assignedOptions() {
      return _.defaultsDeep(this.options, {
        placement: 'bottom'
      })
    }
  },
  mounted() {
    this.base = this.$refs.base
    this.popper = this.$refs.popper

    this.instance = createPopper(this.base, this.popper, this.assignedOptions)
  },
  methods: {
    hide() {
      this.$emit('hide')
      this.popper.removeAttribute('data-show')
      this.instance.update()
    },
    show() {
      this.$emit('show')
      this.popper.setAttribute('data-show', '')
      this.instance.update()
    },
    toggle() {
      this.popper.hasAttribute('data-show') ? this.hide() : this.show()
    }
  }
}
</script>

<style lang="scss" scoped>
.popper {
  display: none;
  z-index: 99;
}

.popper[data-show] {
  display: block;
}
</style>
