// Esqueleto de la ficha: misma estructura que la página (botella | compra | secciones).
export default function ProductoLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando producto"
      className="motion-safe:animate-pulse"
    >
      <div className="px-[clamp(20px,5vw,80px)] py-4">
        <div className="h-3 w-64 bg-hairline" />
      </div>

      <div className="mx-auto grid max-w-[1200px] px-[clamp(20px,5vw,80px)] pb-20 md:grid-cols-2">
        <div className="flex justify-center py-10 md:pr-10">
          <div className="aspect-[2/3] w-full max-w-[260px] bg-hairline/60" />
        </div>
        <div className="flex flex-col gap-4 border-hairline-mid pt-10 max-md:border-t md:border-l md:pt-16 md:pl-12">
          <div className="h-3 w-56 bg-hairline" />
          <div className="h-14 w-4/5 bg-hairline" />
          <div className="h-6 w-1/2 bg-hairline" />
          <div className="my-3 h-16 w-full border-y border-hairline-mid" />
          <div className="h-12 w-40 bg-hairline" />
          <div className="h-[52px] w-full bg-hairline/60" />
        </div>
      </div>
    </div>
  );
}
