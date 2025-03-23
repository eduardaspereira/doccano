<template>
  <v-card v-if="isSuperuser">
    <v-card-title>
      <v-btn class="text-capitalize" color="primary" @click.stop="$router.push('users/create')">
        {{ $t('generic.create') }}
      </v-btn>
      <v-btn class="text-capitalize ms-2" color="primary" :disabled="!canClone" @click.stop="clone">
        Clone
      </v-btn>
      <v-btn
        class="text-capitalize ms-2"
        :disabled="!canDelete"
        outlined
        @click.stop="dialogDelete = true"
      >
        {{ $t('generic.delete') }}
      </v-btn>
      <v-dialog v-model="dialogDelete">
        <form-delete :selected="selected" @cancel="dialogDelete = false" @remove="remove" />
      </v-dialog>
    </v-card-title>
    <user-list
      v-model="selected"
      :items="users.items"
      :is-loading="isLoading"
      :total="users.count"
      @update:query="updateQuery"
    />
  </v-card>
</template>

<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import UserList from '@/components/user/UserList.vue'
import FormDelete from '~/components/user/FormDelete.vue'
import { Page } from '~/domain/models/page'
import { UserItem } from '~/domain/models/user/user'
import { SearchQueryData } from '~/services/application/users/userApplicationService'

export default Vue.extend({
  components: {
    FormDelete,
    UserList
  },
  layout: 'users',

  middleware: ['check-auth', 'auth'],

  data() {
    return {
      dialogDelete: false,
      users: {} as Page<UserItem>,
      selected: [] as UserItem[],
      isLoading: false
    }
  },

  async fetch() {
    this.isLoading = true
    this.users = await this.$services.user.list(
      this.$route.query as unknown as SearchQueryData
    )
    this.isLoading = false
  },

  computed: {
    ...mapGetters('auth', ['isSuperuser']),
    canDelete(): boolean {
      return this.selected.length > 0
    },

    canClone(): boolean {
      return this.selected.length === 1
    }
  },

  watch: {
    '$route.query': _.debounce(function () {
      // @ts-ignore
      this.$fetch()
    }, 1000)
  },

  methods: {
    async remove() {
      await this.$services.user.bulkDelete(this.selected)
      this.$fetch()
      this.dialogDelete = false
      this.selected = []
    },

    async clone() {
      const user = await this.$services.user.clone(this.selected[0])
      this.selected = []
      this.$router.push(`/users/${user.id}/settings`)
    },

    updateQuery(query: object) {
      this.$router.push(query)
    }
  }
})
</script>

<style scoped>
::v-deep .v-dialog {
  width: 800px;
}
</style>
