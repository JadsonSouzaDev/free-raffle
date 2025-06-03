export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <p className="text-foreground/70 text-lg">Carregando...</p>
      </div>
    </div>
  );
} 