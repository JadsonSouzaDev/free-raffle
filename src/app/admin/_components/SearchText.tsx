"use client";

import { useEffect, useState } from "react";

interface SearchTextProps {
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchText = ({ onChange, placeholder = "Pesquisar" }: SearchTextProps) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    onChange(debouncedSearch);
  }, [debouncedSearch, onChange]);

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 text-sm bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/60"
      />
    </div>
  );
};

export default SearchText;