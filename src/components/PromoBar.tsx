const messages = [
  "Envíos",
  "Medios de pago",
];

export default function PromoBar() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] grid h-[34px] grid-cols-2 bg-zinc-950 text-xs font-medium text-zinc-200"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={messages.join(" • ")}
    >
      {messages.map((message, index) => (
        <span
          key={message}
          className={`flex min-w-0 items-center justify-center px-2 text-center sm:px-4 ${
            index > 0 ? "border-l border-white/15" : ""
          }`}
        >
          {message}
        </span>
      ))}
    </div>
  );
}
