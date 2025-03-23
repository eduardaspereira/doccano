import { Page } from '~/domain/models/page'
import { UserItem } from '~/domain/models/user/user'  // Importando o modelo User
import { APIUserRepository, SearchQuery } from '~/repositories/user/apiUserRepository'  // Repositório de User

type UserFields = {
  username: string
  email: string
  firstname: string
  lastname: string
  isSuperuser: boolean
  isStaff: boolean
}

export interface SearchQueryData {
  limit: string
  offset: string
  q?: string
  sortBy?: string
  sortDesc?: string
}


export class UserApplicationService {
  constructor(private readonly repository: APIUserRepository) {}

  // Método para listar os usuários com base na consulta
  public async list(q: SearchQueryData): Promise<Page<UserItem>> {
      try {
        const query = new SearchQuery(q.limit, q.offset, q.q, q.sortBy, q.sortDesc)
        return await this.repository.listAll(query)
      } catch (e: any) {
        throw new Error(e.response.data.detail)
      }
    }

    public async findById(id: string): Promise<UserItem> {
        return await this.repository.findById(id)
    }

  public async update(
      userId: number,
      {
        username,
        email,
        firstname,
        lastname,
        isSuperuser,
        isStaff,
      }: Omit<UserFields, 'tags'>
    ): Promise<void> {
      const user = UserItem.create(
        userId,
        username,
        email,
        firstname,
        lastname,
        isSuperuser,
        isStaff
      )
  
      try {
        await this.repository.update(user)
      } catch (e: any) {
        throw new Error(e.response.data.detail)
      }
    }
  
    public bulkDelete(projects: UserItem[]): Promise<void> {
      const ids = projects.map((project) => project.id)
      return this.repository.bulkDelete(ids)
    }
  
    public async clone(project: UserItem): Promise<UserItem> {
      try {
        return await this.repository.clone(project)
      } catch (e: any) {
        throw new Error(e.response.data.detail)
      }
    }
}
