export type UserData = {
  id: string;
  whatsapp: string;
  name: string;
  img_url: string;
  roles: string[];
  password: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class User {
  whatsapp!: string;
  name!: string;
  imgUrl!: string;
  roles!: string[];
  password!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: UserData) {
    this.whatsapp = data.whatsapp;
    this.name = data.name;
    this.imgUrl = data.img_url;
    this.roles = data.roles;
    this.password = data.password;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }
}