"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  Loader2,
  Pencil,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { DetailModal } from "./DetailModal";
import {
  PaginationRequest,
  PaginationResponse,
} from "@/app/contexts/common/pagination";

type FieldConfig<T> = {
  key: keyof T;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  onlyDetail?: boolean;
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

interface DataListProps<T> {
  data: T[];
  fields: FieldConfig<T>[];
  onEdit?: (item: T) => void;
  onEditCondition?: (item: T) => boolean;
  onDelete?: (item: T) => void;
  onDeleteCondition?: (item: T) => boolean;
  onSort?: (sortConfig: SortConfig) => void;
  sortConfig?: SortConfig;
  onCreate?: () => void;
  loading?: boolean;
  pagination?: PaginationResponse;
  setPagination?: (pagination: PaginationRequest) => void;
  customActions?: {
    icon: React.ReactNode;
    label: string;
    onClick: (item: T) => void;
    condition?: (item: T) => boolean;
    className?: string;
  }[];
}

export function DataList<T>({
  data,
  fields,
  onEdit,
  onEditCondition,
  onDelete,
  onDeleteCondition,
  onSort,
  sortConfig,
  onCreate,
  loading,
  pagination,
  setPagination,
  customActions,
}: DataListProps<T>) {
  const [currentSort, setCurrentSort] = useState<SortConfig | undefined>(
    sortConfig
  );
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const handleSort = (key: string) => {
    const direction: "asc" | "desc" =
      currentSort?.key === key && currentSort?.direction === "asc"
        ? "desc"
        : "asc";
    const newSort: SortConfig = { key, direction };
    setCurrentSort(newSort);
    onSort?.(newSort);
  };

  const visibleFields = fields.filter((field) => !field.onlyDetail);
  const allFields = fields;

  // Visualização em cards para mobile
  const MobileView = () => (
    <div className="grid grid-cols-1 gap-2 text-white bg-white/10">
      {data.map((item, index) => (
        <div
          key={index}
          className="bg-white/10 rounded-lg shadow p-4 border border-white/10"
        >
          {visibleFields.map((field) => (
            <div key={field.key as string} className="flex flex-col gap-1 mb-2">
              <span className="text-xs text-white/60">{field.label}</span>
              <div className="font-medium text-sm">
                {field.render
                  ? field.render(item[field.key], item)
                  : String(item[field.key] ?? "-")}
              </div>
            </div>
          ))}
          {(onEdit || onDelete) && (
            <div className="grid grid-cols-1 justify-center items-center gap-2 mt-4 pt-4 border-t border-white/10 font-bold">
              <button
                onClick={() => setSelectedItem(item)}
                className="flex items-center justify-center gap-2 px-3 py-3 bg-foreground hover:bg-foreground/90 rounded-lg transition-colors text-white"
              >
                <Eye className="w-4 h-4" />
                <span className="text-xs">Detalhes</span>
              </button>
              {onEdit && onEditCondition?.(item) && (
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-foreground hover:bg-foreground/90 rounded-lg transition-colors text-white"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-xs">Editar</span>
                </button>
              )}
              {onDelete && onDeleteCondition?.(item) && (
                <button
                  onClick={() => onDelete(item)}
                  className="flex items-center justify-center gap-2 px-3 py-3 bg-red-600 hover:bg-red-600/90 rounded-lg transition-colors text-white"
                >
                  <Trash className="w-4 h-4" />
                  <span className="text-xs">Excluir</span>
                </button>
              )}
              {customActions?.map((action, index) => {
                if (action.condition && !action.condition(item)) return null;
                return (
                  <button
                    key={index}
                    onClick={() => action.onClick(item)}
                    className={`flex items-center justify-center gap-1 px-3 py-3 rounded-lg transition-colors text-white ${action.className ?? "bg-foreground hover:bg-foreground/90"}`}
                  >
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Visualização em tabela para desktop
  const DesktopView = () => (
    <table className="w-full text-sm text-left text-white">
      <thead className="text-xs uppercase bg-white/10">
        <tr>
          {visibleFields.map((field) => (
            <th
              key={field.key as string}
              className="px-4 py-3 cursor-pointer select-none"
              onClick={() => handleSort(field.key as string)}
            >
              <div className="flex items-center gap-1 text-white/90">
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
          {(onEdit || onDelete || customActions) && (
            <th className="px-4 py-3 text-right">Ações</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr
            key={index}
            className="border-b border-white/10 hover:bg-white/10 transition-colors"
          >
            {visibleFields.map((field) => (
              <td key={field.key as string} className="px-4 py-3">
                {field.render
                  ? field.render(item[field.key], item)
                  : String(item[field.key] ?? "-")}
              </td>
            ))}
            {(onEdit || onDelete || customActions) && (
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="cursor-pointer p-1 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && onEditCondition?.(item) && (
                    <button
                      onClick={() => onEdit(item)}
                      className="cursor-pointer p-1 text-white hover:bg-white/10 rounded-lg transition-colors "
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && onDeleteCondition?.(item) && (
                    <button
                      onClick={() => onDelete(item)}
                      className="cursor-pointer p-1 text-red-600 hover:bg-red-600/10 rounded-lg transition-colors"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                  {customActions?.map((action, index) => {
                    if (action.condition && !action.condition(item)) return null;
                    return (
                      <button
                        key={index}
                        onClick={() => action.onClick(item)}
                        className={`cursor-pointer p-1 rounded-lg transition-colors ${action.className ?? "text-white hover:bg-white/10"}`}
                      >
                        {action.icon}
                      </button>
                    );
                  })}
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
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-foreground hover:bg-foreground/90 rounded-lg transition-colors text-white font-medium"
          >
            <span className="text-sm">Criar Novo</span>
          </button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="hidden md:block">
            <DesktopView />
          </div>
          <div className="md:hidden">
            <MobileView />
          </div>
        </div>
      )}
      {pagination && (
        <div className="flex justify-end items-center gap-3 pt-4">
          <button
            onClick={() => {
              setPagination?.({ ...pagination, page: pagination.page - 1 })
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            }
            className="bg-foreground/30 p-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/50 transition-colors font-bold"
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white/60">{pagination.page} de {pagination.totalPages}</span>
          <button
            onClick={() => {
              setPagination?.({ ...pagination, page: pagination.page + 1 })
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            }
            className="bg-foreground/30 p-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/50 transition-colors font-bold"
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      <DetailModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem as T}
        fields={allFields}
      />
    </div>
  );
}
