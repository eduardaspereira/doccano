<template>
  <v-data-table
    :value="value"
    :headers="headers"
    :items="items"
    :options.sync="options"
    :server-items-length="total"
    :search="search"
    :loading="isLoading"
    :loading-text="$t('generic.loading')"
    :no-data-text="$t('vuetify.noDataAvailable')"
    :footer-props="{
      showFirstLastPage: true,
      'items-per-page-options': [10, 50, 100],
      'items-per-page-text': $t('vuetify.itemsPerPageText'),
      'page-text': $t('dataset.pageText')
    }"
    item-key="id"
    show-select
    @input="$emit('input', $event)"
  >
    <template #top>
      <v-text-field
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        :label="$t('generic.search')"
        single-line
        hide-details
        filled
      />
    </template>

    <template #[`item.username`]="{ item }">
      <span>{{ item.username }}</span>
    </template>

    <template #[`item.isSuperuser`]="{ item }">
    <v-tooltip bottom>
      <template #activator="{ on, attrs }">
        <v-icon v-bind="attrs" v-on="on" color="orange" v-if="item.isSuperuser">
          {{ mdiCrown }}
        </v-icon>
        <v-icon v-bind="attrs" v-on="on" color="blue" v-else>
          {{ mdiAccount }}
        </v-icon>
      </template>
      <span v-if="item.isSuperuser">Super User</span>
      <span v-else>Normal User</span>
    </v-tooltip>
    </template>

    <template #[`item.firstname`]="{ item }">
      <span>{{ item.firstname }}</span>
    </template>

    <template #[`item.lastname`]="{ item }">
      <span>{{ item.lastname }}</span>
    </template>

    <template #[`item.email`]="{ item }">
      <span>{{ item.email }}</span>
    </template>

    <template #[`item.dateJoined`]="{ item }">
      <span>{{ formatDate(item.dateJoined) }}</span>
    </template>

    <template #[`item.lastLogin`]="{ item }">
      <span>{{ formatDate(item.lastLogin) }}</span>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { mdiMagnify, mdiCrown, mdiAccount } from '@mdi/js'
import { DateTime } from 'luxon'
import type { PropType } from 'vue'
import Vue from 'vue'
import { DataOptions } from 'vuetify/types'
import { UserItem } from '~/domain/models/user/user'

// A classe UserItem agora será utilizada

export default Vue.extend({
  props: {
    isLoading: {
      type: Boolean,
      default: false,
      required: true
    },
    items: {
      type: Array as PropType<UserItem[]>, // Agora usando UserItem
      default: () => [],
      required: true
    },
    value: {
      type: Array as PropType<UserItem[]>, // Agora usando UserItem
      default: () => [],
      required: true
    },
    total: {
      type: Number,
      default: 0,
      required: true
    }
  },

  data() {
    return {
      search: this.$route.query.q,
      options: {} as DataOptions,
      mdiMagnify,
      mdiCrown,
      mdiAccount
    }
  },

  computed: {
    headers(): { text: any; value: string; sortable?: boolean }[] {
      return [
        { text: "Username", value: 'username' },
        { text: "User Type", value: 'isSuperuser' },
        { text: "First Name", value: 'firstname' },
        { text: "Last Name", value: 'lastname' },
        { text: "E-mail", value: 'email' },
        { text: "Date Joined", value: 'dateJoined' },
        { text: "Last Login", value: 'lastLogin' },
      ]
    }
  },

  watch: {
    options: {
      handler() {
        this.updateQuery({
          query: {
            limit: this.options.itemsPerPage.toString(),
            offset: ((this.options.page - 1) * this.options.itemsPerPage).toString(),
            q: this.search
          }
        })
      },
      deep: true
    },
    search() {
      this.updateQuery({
        query: {
          limit: this.options.itemsPerPage.toString(),
          offset: '0',
          q: this.search
        }
      })
      this.options.page = 1
    }
  },

  methods: {
    updateQuery(payload: any) {
      const { sortBy, sortDesc } = this.options
      if (sortBy.length === 1 && sortDesc.length === 1) {
        payload.query.sortBy = sortBy[0]
        payload.query.sortDesc = sortDesc[0]
      } else {
        payload.query.sortBy = 'createdAt'
        payload.query.sortDesc = true
      }
      this.$emit('update:query', payload)
    },

    formatDate(date: string) {
      return DateTime.fromISO(date).toFormat('yyyy/MM/dd HH:mm')
    }
  }
})
</script>
