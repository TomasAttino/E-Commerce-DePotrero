import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen scroll-mt-[98px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
      <Image
        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000"
        alt=""
        fill
        sizes="100vw"
        quality={85}
        preload
        className="object-cover object-center scale-105 opacity-60"
      />
      
      <div className="relative z-20 text-center space-y-6 px-4">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter  italic leading-[0.9]">
          DePotrero
        </h1>
        <p className="text-xl md:text-2xl font-light text-zinc-300 max-w-2xl mx-auto">
          Colecciones exclusivas de los mejores equipos del fútbol argentino.
        </p>
        <div className="pt-8">
          <Link
            href="/catalogo"
            className="inline-flex bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Explorar catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
