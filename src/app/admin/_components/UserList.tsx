"use client";

import { formatDateAndTime } from "@/app/utils/data";
import { DataList } from "./DataList";
import {
  DEFAULT_PAGINATION,
  PaginationRequest,
  PaginationResponse,
} from "@/app/contexts/common/pagination";
import { useEffect, useState } from "react";
import { getUsers } from "@/app/contexts/user/user.actions";
import useSWR from "swr";
import SearchText from "./SearchText";
import { Camera } from "lucide-react";
import { UserPhotoModal } from "./UserPhotoModal";

interface User {
  whatsapp: string;
  name: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
  imgUrl?: string;
}

const roleMap = {
  admin: "Administrador",
  customer: "Cliente",
};

export function UserList({
  users,
  initialPagination,
}: {
  users: User[];
  initialPagination: PaginationResponse;
}) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [search, setSearch] = useState<string>("");
  const [pagination, setPagination] =
    useState<PaginationRequest>(DEFAULT_PAGINATION);
  const [paginationResponse, setPaginationResponse] =
    useState<PaginationResponse>(initialPagination);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: usersData, isLoading: isLoadingUsers } = useSWR(
    `/api/users?search=${search}&page=${pagination.page}&limit=${pagination.limit}`,
    () => getUsers({ search, pagination })
  );

  useEffect(() => {
    if (usersData) {
      const { data, ...rest } = usersData;
      setFilteredUsers(data as unknown as User[]);
      setPaginationResponse(rest);
    }
  }, [usersData, pagination]);

  return (
    <>
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="font-bold">Filtrar por</h2>
        <div className="grid md:grid-cols-2 gap-2">
          <SearchText onChange={(value) => {
            setSearch(value);
            setPagination(DEFAULT_PAGINATION);
          }} />
        </div>
      </div>
      <DataList<User>
        data={filteredUsers}
        pagination={paginationResponse}
        setPagination={setPagination}
        loading={isLoadingUsers}
        customActions={[
          {
            icon: <Camera className="w-4 h-4" />,
            label: "Editar foto",
            onClick: (user) => setSelectedUser(user),
            className: "hover:bg-white/10 bg-foreground/70 text-white md:bg-transparent md:hover:bg-white/10"
          }
        ]}
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
              <span className="">{formatDateAndTime(value as string)}</span>
            ),
          },
        ]}
        onDeleteCondition={(user) => {
          return !user.roles.includes("admin");
        }}
      />

      <UserPhotoModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </>
  );
}
