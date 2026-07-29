"use client";

const messages = [
  "10% OFF en tu primera compra",
  "Todos tus equipos en un solo lugar",
  "Envíos a todo el país",
  "Encontrá tu camiseta favorita",
];

function MessageGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="promo-message-group" aria-hidden={hidden}>
      {messages.map((message) => (
        <span key={message} className="inline-flex items-center gap-8">
          <span>{message}</span>
          <span aria-hidden="true"></span>
        </span>
      ))}
    </div>
  );
}

export default function PromoBar() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex h-[34px] items-center overflow-hidden bg-black px-4 text-xs font-medium text-white"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="promo-marquee-track" aria-label={messages.join(" • ")}>
        <MessageGroup />
        <MessageGroup hidden />
      </div>
      <style jsx>{`
        .promo-marquee-track {
          display: flex;
          width: max-content;
          min-width: 100%;
          flex-shrink: 0;
          animation: promo-marquee 28s linear infinite;
        }

        .promo-message-group {
           display: flex;
           width: max-content;
           flex-wrap: nowrap;
           flex-shrink: 0;
           align-items: center;
           gap: 2rem;
           padding-right: 2rem;
           white-space: nowrap;
        }

        .promo-message-group > span {
          flex-shrink: 0;
          white-space: nowrap;
        }

        @keyframes promo-marquee {
          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-marquee-track {
            max-width: 100%;
            overflow-x: auto;
            scrollbar-width: none;
            animation: none;
          }

          .promo-marquee-track::-webkit-scrollbar {
            display: none;
          }

          .promo-message-group[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
