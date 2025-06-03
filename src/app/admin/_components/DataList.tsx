"use client";

import { ChevronDown, ChevronUp, Pencil, Trash } from "lucide-react";
import { useState } from "react";

type FieldConfig<T> = {
  key: keyof T;
  label: string;
  render?: (value: unknown) => React.ReactNode;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

interface DataListProps<T> {
  data: T[];
  fields: FieldConfig<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onSort?: (sortConfig: SortConfig) => void;
  sortConfig?: SortConfig;
  onCreate?: () => void;
}

export function DataList<T>({
  data,
  fields,
  onEdit,
  onDelete,
  onSort,
  sortConfig,
  onCreate,
}: DataListProps<T>) {
  const [currentSort, setCurrentSort] = useState<SortConfig | undefined>(
    sortConfig
  );

  const handleSort = (key: string) => {
    const direction: "asc" | "desc" =
      currentSort?.key === key && currentSort?.direction === "asc"
        ? "desc"
        : "asc";
    const newSort: SortConfig = { key, direction };
    setCurrentSort(newSort);
    onSort?.(newSort);
  };

  // Visualização em cards para mobile
  const MobileView = () => (
    <div className="grid grid-cols-1 gap-4 text-foreground">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 border border-foreground/10"
        >
          {fields.map((field) => (
            <div key={field.key as string} className="flex flex-col gap-1 mb-2">
              <span className="text-xs font-medium text-foreground/60">
                {field.label}
              </span>
              <div className="font-medium">
                {field.render
                  ? field.render(item[field.key])
                  : String(item[field.key] ?? "-")}
              </div>
            </div>
          ))}
          {(onEdit || onDelete) && (
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-foreground/10 font-bold">
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-2 px-3 py-2 bg-foreground hover:bg-foreground/90 rounded-lg transition-colors text-white"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-600/90 rounded-lg transition-colors text-white"
                >
                  <Trash className="w-4 h-4" />
                  <span className="text-sm">Excluir</span>
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Visualização em tabela para desktop
  const DesktopView = () => (
    <table className="w-full text-sm text-left text-foreground">
      <thead className="text-xs uppercase bg-foreground/5">
        <tr>
          {fields.map((field) => (
            <th
              key={field.key as string}
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort(field.key as string)}
            >
              <div className="flex items-center gap-1">
                {field.label}
                {currentSort?.key === field.key &&
                  (currentSort.direction === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
          ))}
          {(onEdit || onDelete) && (
            <th className="px-4 py-3 text-right">Ações</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors"
          >
            {fields.map((field) => (
              <td key={field.key as string} className="px-4 py-3">
                {field.render
                  ? field.render(item[field.key])
                  : String(item[field.key] ?? "-")}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="cursor-pointer p-1 text-foreground hover:bg-foreground/10 rounded-lg transition-colors "
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="cursor-pointer p-1 text-red-600 hover:bg-red-600/10 rounded-lg transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      {onCreate && (
        <div className="mb-4">
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-foreground hover:bg-foreground/90 rounded-lg transition-colors text-white font-medium"
          >
            <span className="text-sm">Criar Novo</span>
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <div className="hidden md:block">
          <DesktopView />
        </div>
        <div className="md:hidden">
          <MobileView />
        </div>
      </div>
    </div>
  );
}
