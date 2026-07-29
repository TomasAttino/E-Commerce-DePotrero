import { MessageCircle } from "lucide-react";

const whatsappUrl = `https://wa.me/5491137684212?text=${encodeURIComponent(
  "Hola, quisiera hacer una consulta sobre las camisetas disponibles."
)}`;

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultar por WhatsApp sobre camisetas"
      className="fixed right-4 bottom-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition-transform hover:scale-105 hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] sm:right-6 sm:bottom-6"
    >
      <MessageCircle size={28} strokeWidth={2.25} aria-hidden="true" />
    </a>
  );
}
