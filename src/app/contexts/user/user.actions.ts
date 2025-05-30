import { neon } from "@neondatabase/serverless";
import { User } from "./user.entity";

export async function createUser(formData: FormData) {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  const whatsapp = formData.get("whatsapp");
  const name = formData.get("name");
  const roles = ["customer"];

  await sql`INSERT INTO users (whatsapp, name, roles) VALUES (${whatsapp}, ${name}, ${roles})`;
}

export async function getUsers(): Promise<User[]> {
  "use server";
  const sql = neon(`${process.env.DATABASE_URL}`);

  const rawUsers = await sql`SELECT * FROM users`;
  return rawUsers.map((user) => new User(user));
}
