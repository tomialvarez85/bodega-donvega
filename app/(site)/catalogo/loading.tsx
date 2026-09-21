// Esqueleto del catálogo para que mantenga la estructura de la página.
export default function CatalogoLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando catálogo"
      className="bg-ink"
    >
      <section className="border-b-[0.5px] border-hairline px-[clamp(16px,4vw,48px)] pt-12 pb-10 motion-safe:animate-pulse">
        <div className="mb-3 h-2.5 w-20 bg-hairline" />
        <div className="h-12 w-72 bg-hairline md:h-14" />
      </section>

      <div className="mx-auto flex max-w-[1440px]">
        <div className="hidden w-[257px] shrink-0 border-r-[0.5px] border-hairline min-[900px]:block" />
        <ul className="grid min-w-0 flex-1 grid-cols-1 border-x-[0.5px] border-hairline min-[421px]:grid-cols-2 min-[720px]:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              key={index}
              className="border-b-[0.5px] border-hairline p-5 motion-safe:animate-pulse"
            >
              <div className="h-[300px] bg-hairline/50" />
              <div className="mt-5 h-2.5 w-24 bg-hairline" />
              <div className="mt-3 h-6 w-3/4 bg-hairline" />
              <div className="mt-4 h-10 w-full bg-hairline/60" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
