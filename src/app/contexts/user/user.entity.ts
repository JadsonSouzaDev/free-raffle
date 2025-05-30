export class User {
  whatsapp!: string;
  name!: string;
  imgUrl!: string;
  roles!: string[];
  password!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
}