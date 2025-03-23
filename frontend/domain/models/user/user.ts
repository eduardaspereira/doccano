export class UserItem {
  constructor(
    readonly id: number,
    readonly username: string,
    readonly email: string,
    readonly firstname: string,
    readonly lastname: string,
    readonly isSuperuser: boolean,
    readonly isStaff: boolean,
    readonly dateJoined: string = '',
    readonly lastLogin: string = '',
  ) {}

  static create(
      id: number,
      username: string,
      email: string,
      firstname: string,
      lastname: string,
      isSuperuser: boolean,
      isStaff: boolean,
    ) {
      return new UserItem(
        id,
        username,
        email,
        firstname,
        lastname,
        isSuperuser,
        isStaff,
      )
    }
}
