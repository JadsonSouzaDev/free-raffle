"use client";

import { getUsersSelectOptions } from "@/app/contexts/user/user.actions";
import { useEffect, useState } from "react";
import useSWR from "swr";

type UserSelectProps = {
  onChange: (value: string) => void;
};

const UserSelect = ({ onChange }: UserSelectProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: users, isLoading } = useSWR(
    debouncedSearch ? `/api/users?search=${debouncedSearch}` : "/api/users",
    () => getUsersSelectOptions({ search: debouncedSearch })
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const filteredUsers = users?.filter((user) => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex-1 text-sm relative">
      <label htmlFor="user" className="block mb-2">
        Usuário
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none"
          placeholder="Buscar por nome ou WhatsApp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <div className={`absolute z-10 w-full mt-1 bg-white border border-gray-300 text-foreground rounded-lg shadow-lg ${isOpen ? 'block' : 'hidden'}`}>
          <div className="max-h-60 overflow-auto">
            <div 
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange("");
                setSearch("");
                setIsOpen(false);
              }}
            >
              Todos
            </div>
            {isLoading ? (
              <div className="p-2 text-center text-gray-500">Carregando...</div>
            ) : (
              filteredUsers?.map((user) => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange(user.id);
                    setSearch(user.name);
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-foreground/70">
                    {user.id.replace("+55", "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelect;
