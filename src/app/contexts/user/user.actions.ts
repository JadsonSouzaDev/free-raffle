"use server";
import { neon } from "@neondatabase/serverless";
import { User, UserData } from "./user.entity";
import { z } from "zod";
import bcrypt from "bcrypt";
import * as jose from 'jose';

const createUserSchema = z.object({
  name: z.string().min(1),
  whatsapp: z.string().min(15),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export async function createUser(data: CreateUserFormData) {
  const { name, whatsapp } = createUserSchema.parse(data);
  const whatsappWithoutMask = `+55${whatsapp.replace(/\D/g, '')}`;

  const sql = neon(`${process.env.DATABASE_URL}`);

  const roles = ["customer"];

  const result = await sql`
    INSERT INTO users (whatsapp, name, roles)
    VALUES (${whatsappWithoutMask}, ${name}, ${roles})
    RETURNING whatsapp, name, roles, created_at, updated_at
  `;

  return {
    whatsapp: result[0].whatsapp,
    name: result[0].name,
    roles: result[0].roles,
    createdAt: result[0].created_at,
    updatedAt: result[0].updated_at
  };
}

const loginSchema = z.object({
  whatsapp: z.string().min(15),
  password: z.string().min(8),
});

type LoginFormData = z.infer<typeof loginSchema>;

export async function login(data: LoginFormData) {
  const { whatsapp: rawWhatsapp, password } = loginSchema.parse(data);
  const sql = neon(`${process.env.DATABASE_URL}`);
  const whatsapp = `+55${rawWhatsapp.replace(/\D/g, '')}`;
  const rawUsers = await sql`SELECT * FROM users WHERE whatsapp = ${whatsapp} AND active = true LIMIT 1`;

  if (rawUsers.length === 0) {
    return null;
  }

  if (!rawUsers[0].password) {
    return null;
  }

  const user = rawUsers[0];
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    return null;
  }

  const userData = {
    whatsapp: user.whatsapp,
    name: user.name,
    roles: user.roles,
  };

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret"
  );

  const token = await new jose.SignJWT(userData)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return {
    token,
    user: userData
  }
}

export async function getUsers() {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const rawUsers = await sql`SELECT * FROM users WHERE active = true ORDER BY created_at DESC`;
  return rawUsers.map((user) => new User(user as unknown as UserData));
}

export async function getUserByWhatsapp(maskedWhatsapp: string) {
  const sql = neon(`${process.env.DATABASE_URL}`);
  const whatsapp = `+55${maskedWhatsapp.replace(/\D/g, '')}`;
  const rawUsers = await sql`SELECT * FROM users WHERE whatsapp = ${whatsapp} AND active = true LIMIT 1`;

  if (rawUsers.length === 0) {
    return null;
  }

  const user = rawUsers[0];

  return {
    whatsapp: user.whatsapp,
    name: user.name,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }
}

export async function generatePasswordHash(password: string) {
  return bcrypt.hash(password, 10);
}
