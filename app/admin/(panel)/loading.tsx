export default function AdminLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando"
      className="flex max-w-6xl flex-col gap-6 motion-safe:animate-pulse"
    >
      <div className="h-8 w-48 bg-hairline" />
      <div className="h-4 w-32 bg-hairline" />
      <div className="h-64 border border-input bg-card" />
    </div>
  );
}
