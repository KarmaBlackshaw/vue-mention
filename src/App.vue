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
      <div class="grow p-2 border h-[600px]">
        {{ test }}
      </div>

      <base-mention
        v-model="test"
        :options="{
          minChars: 0
        }"
        :search-string.sync="searchString"
      >
        <template #default="{ mention }">
          <ul>
            <li
              v-for="(currJobType, jobTypeKey) in usersByJobType"
              :key="jobTypeKey"
            >
              <details>
                <summary class="list-none select-none h-[46px] flex items-center px-3 justify-between">
                  <h1>{{ currJobType.name }}</h1>

                  <icon-mdi:chevron-down />
                </summary>

                <ul class="max-h-[224px] overflow-auto border-t">
                  <li
                    v-for="(currUser, userKey) in currJobType.users"
                    :key="userKey"
                    class="px-3 py-2 flex items-center flex-start gap-3"
                    @click="mention({
                      id: `${userKey}:${jobTypeKey}`,
                      text: currUser.name
                    })"
                  >
                    <img
                      :src="currUser.image"
                      alt=""
                      class="h-[32px] w-[32px] rounded-full"
                    >

                    <div class="text-sm">
                      <p>{{ currUser.name }}</p>
                      <p class="text-neutral-400">
                        {{ currUser.position }}
                      </p>
                    </div>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </template>
      </base-mention>

      <button class="bg-blue-500 h-[50px] text-white">
        Send
      </button>
    </div>
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
