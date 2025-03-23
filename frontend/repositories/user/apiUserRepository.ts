import { Page } from '~/domain/models/page'
import { UserItem } from '@/domain/models/user/user'
import ApiService from '@/services/api.service'

const sortableFieldList = ['username', 'email', 'firstname', 'lastname', 'isSuperuser', 'isStaff', 'dateJoined', 'lastLogin'] as const
type SortableFields = (typeof sortableFieldList)[number]
export class SearchQuery {
  readonly limit: number = 10
  readonly offset: number = 0
  readonly q: string = ''
  readonly sortBy: SortableFields = 'dateJoined'
  readonly sortDesc: boolean = false

  constructor(_limit: string, _offset: string, _q?: string, _sortBy?: string, _sortDesc?: string) {
    this.limit = /^\d+$/.test(_limit) ? parseInt(_limit) : 10
    this.offset = /^\d+$/.test(_offset) ? parseInt(_offset) : 0
    this.q = _q || ''
    this.sortBy = (
      _sortBy && sortableFieldList.includes(_sortBy as SortableFields) ? _sortBy : 'dateJoined'
    ) as SortableFields
    this.sortDesc = _sortDesc === 'true'
  }
}

function toModel(item: { [key: string]: any }): UserItem {
  return new UserItem(
    item.id, item.username, item.email, item.first_name, item.last_name, 
    item.is_superuser, item.is_staff, item.date_joined, item.last_login
  )
}

function toPayload(item: UserItem): { [key: string]: any } {
  return {
    id: item.id,
    username: item.username,
    email: item.email,
    firstname: item.firstname,
    lastname: item.lastname,
    isSuperuser: item.isSuperuser,
    isStaff: item.isStaff,
    dateJoined: item.dateJoined,
    lastLogin: item.lastLogin,
  }
}

export class APIUserRepository {
  constructor(private readonly request = ApiService) {}

  async getProfile(): Promise<UserItem> {
    const url = '/me'
    const response = await this.request.get(url)
    return toModel(response.data)
  }

  async list(query: string): Promise<UserItem[]> {
    const url = `/userslist?q=${query}`
    const response = await this.request.get(url)
    return response.data.map((item: { [key: string]: any }) => toModel(item))
  }

  async listAll(query: SearchQuery): Promise<Page<UserItem>> {
      const fieldMapper = {
        username: 'username',
        email: 'email',
        firstname: 'first_name',
        lastname: 'last_name',
        isSuperuser: 'is_superuser',
        isStaff: 'is_staff',
        isActive: 'is_active',
        dateJoined: 'date_joined',
        lastLogin: 'last_login'
      }
      const sortBy = fieldMapper[query.sortBy]
      const ordering = query.sortDesc ? `-${sortBy}` : `${sortBy}`
      const url = `/userslist?limit=${query.limit}&offset=${query.offset}&q=${query.q}&ordering=${ordering}`
      const response = await this.request.get(url)
      console.log(response)
      return new Page(
        response.data.count,
        response.data.next,
        response.data.previous,
        response.data.results.map((user: { [key: string]: any }) => toModel(user))
      )
    }

  async findById(id: string): Promise<UserItem> {
      const url = `/users/${id}`
      const response = await this.request.get(url)
      return toModel(response.data)
    }

    async create(item: UserItem): Promise<UserItem> {
        const url = `/users`
        const payload = toPayload(item)
        const response = await this.request.post(url, payload)
        return toModel(response.data)
      }
    
      async update(item: UserItem): Promise<void> {
        const url = `/users/${item.id}`
        const payload = toPayload(item)
        await this.request.patch(url, payload)
      }
    
      async bulkDelete(userIds: number[]): Promise<void> {
        const url = `/users`
        await this.request.delete(url, { ids: userIds })
      }
    
      async clone(user: UserItem): Promise<UserItem> {
        const url = `/users/${user.id}/clone`
        const response = await this.request.post(url)
        return toModel(response.data)
      }
}
