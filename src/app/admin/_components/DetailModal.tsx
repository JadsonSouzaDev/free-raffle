"use client";

import { X } from "lucide-react";

interface DetailModalProps<T> {
  open: boolean;
  onClose: () => void;
  item: T;
  fields: {
    key: keyof T;
    label: string;
    render?: (value: unknown, item: T) => React.ReactNode;
  }[];
}

export function DetailModal<T>({
  open,
  onClose,
  item,
  fields,
}: DetailModalProps<T>) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs text-foreground z-50">
      <div className="rounded-xl p-4 md:p-6 w-full max-w-2xl text-foreground bg-white">
        <div className="flex flex-row justify-between items-center mb-4 md:mb-8">
          <h2 className="text-xl font-bold">Detalhes</h2>
          <button
            onClick={onClose}
            className="text-foreground cursor-pointer hover:text-foreground/80"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[80vh]">
          {fields.map((field) => (
            <div key={field.key as string} className="flex flex-col gap-1">
              <span className="text-sm text-foreground/60">
                {field.label}
              </span>
              <div className="text-sm">
                {field.render
                  ? field.render(item[field.key], item)
                  : String(item[field.key] ?? "-")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 