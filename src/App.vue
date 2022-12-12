<template>
  <div
    id="app"
  >
    <base-mention />
  </div>
</template>

<script>
import { faker } from '@faker-js/faker'
import _ from 'lodash'

export default {
  name: 'App',

  data() {
    return {
      test: '',
      searchString: '',
      list: Array.from({ length: 10 }, () => {
        return {
          name: faker.name.jobType(),
          users: Array.from({ length: 5 }, () => {
            return {
              id: _.uniqueId(),
              name: faker.name.fullName(),
              position: faker.name.jobTitle(),
              image: faker.image.people()
            }
          })
        }
      })
    }
  },

  computed: {
    usersByJobType () {
      if (_.isEmpty(this.searchString)) {
        return this.list
      }

      const searchRegex = new RegExp(this.searchString.toLowerCase(), 'i')

      return this.list
        .map(job => {
          return {
            ...job,
            users: job.users.filter(user => {
              return user.name
                .replace(/\s/g, '')
                .match(searchRegex)
            })
          }
        })
        .filter(job => job.users.length)
    }
  }
}
</script>
