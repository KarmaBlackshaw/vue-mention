/**

import users from '@/mixins/users'

 */

import Vue from 'vue'
import { faker } from '@faker-js/faker'
import _ from 'lodash'

const data = Vue.observable({
  list: Array.from({ length: 10 }, () => {
    return {
      id: _.uniqueId(),
      name: faker.name.fullName(),
      position: faker.name.jobTitle(),
      image: faker.image.people()
    }
  })
})

export default {
  computed: {
    $_users_list() {
      return data.list
    },

    $_users_dictionary() {
      const dictionary = {}

      data.list.forEach(user => {
        if (!dictionary[user.id]) {
          dictionary[user.id] = user.name
        }
      })

      return dictionary
    }
  }
}