const messages = [
  "Envíos a todo el país",
  "Medios de pago",
  "Camisetas retro",
];

export default function PromoBar() {
  return (
    <div className="promo-marquee-viewport fixed inset-x-0 top-0 z-[60] h-[34px] overflow-hidden bg-zinc-950 text-xs font-medium text-zinc-200">
      <div className="promo-marquee-track flex h-full w-max items-center" aria-hidden="true">
        {[0, 1].map((group) => (
          <div key={group} className="flex shrink-0 items-center" aria-hidden="true">
            {messages.map((message) => (
              <span key={`${group}-${message}`} className="px-5 whitespace-nowrap sm:px-8">
                {message}
                <span className="ml-5 text-lime-400/80 sm:ml-8" aria-hidden="true">•</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {messages.join(". ")}
      </p>
    </div>
  );
}
