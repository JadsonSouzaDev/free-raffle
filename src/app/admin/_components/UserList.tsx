"use client";

import { formatDate } from "@/app/utils/data";
import { DataList } from "./DataList";

interface User {
  whatsapp: string;
  name: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

const roleMap = {
  admin: "Administrador",
  customer: "Cliente",
};

export function UserList({ users }: { users: User[] }) {
  return (
    <DataList<User>
      data={users}
      fields={[
        {
          key: "name",
          label: "Nome",
        },
        {
          key: "whatsapp",
          label: "WhatsApp",
          render: (value) => {
            const whatsapp = (value as string).replace("+55", "");
            return whatsapp.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
          },
        },
        {
          key: "roles",
          label: "Tipo",
          render: (value) => (
            <div className="flex gap-1">
              {(value as string[]).map((role) => (
                <span
                  key={role}
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {roleMap[role as keyof typeof roleMap]}
                </span>
              ))}
            </div>
          ),
        },
        {
          key: "createdAt",
          label: "Cadastro",
          render: (value) => (
            <span className="text-xs text-foreground/50">
              {formatDate(value as string)}
            </span>
          ),
        },
      ]}
      onEdit={(user) => {
        console.log("Editar usuário", user);
      }}
      onDelete={(user) => {
        console.log("Deletar usuário", user);
      }}
    />
  );
}
