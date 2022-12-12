<template>
  <div class="popper-container">
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

import { createPopper } from '@popperjs/core'
import _ from 'lodash'

const getAsync = async (base, path) => {
  while (!_.get(base, path)) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  return _.get(base, path)
}

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
  async mounted () {
    const [base, popper] = await Promise.all([
      getAsync(this.$refs, ['base']),
      getAsync(this.$refs, ['popper'])
    ])

    this.base = base
    this.popper = popper

    this.instance = createPopper(this.base, this.popper, this.assignedOptions)
  },
  methods: {
    hide() {
      this.popper.removeAttribute('data-show')
    },
    show() {
      this.popper.setAttribute('data-show', '')
    },
    toggle () {
      this.popper.hasAttribute('data-show')
        ? this.hide()
        : this.show()
    }
  }
}
</script>

<style lang="scss" scoped>
.popper {
  display: none;
}

.popper[data-show] {
  display: inline;
}
</style>