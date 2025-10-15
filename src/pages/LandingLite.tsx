import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingLite() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav />
      <main className="pt-28">
        <Hero />
        <KPIStrip />
        <ObsessSection />
        <VisibilitySection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/lite" className="text-xl font-bold">CounterOS</Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-zinc-600 hover:text-zinc-900 transition-colors">Cómo funciona</a>
          <Link to="/login" className="text-zinc-600 hover:text-zinc-900 transition-colors">Login</Link>
          <a 
            href="#demo" 
            className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-all hover:scale-105"
          >
            Agendar demo
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="px-6">
      <div className="mx-auto max-w-5xl text-center py-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-7xl font-bold leading-tight"
        >
          Controla cada punto de tu <span className="text-zinc-600">food cost</span>.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-xl text-zinc-600"
        >
          Visibilidad en tiempo real por tienda, marca y corporativo. Sin capturas manuales.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a 
            href="#demo" 
            className="px-8 py-4 rounded-xl bg-zinc-900 text-white text-lg font-semibold hover:bg-zinc-800 transition-all hover:scale-105"
          >
            Agendar demo
          </a>
          <a 
            href="#features" 
            className="px-8 py-4 rounded-xl border-2 border-zinc-200 text-lg font-semibold hover:border-zinc-300 transition-all hover:scale-105"
          >
            Ver cómo funciona
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function KPIStrip() {
  const items = [
    { k: "30s", d: "Para detectar si algo anda mal" },
    { k: "Multi-tienda", d: "Vista consolidada y drill-down" },
    { k: "Automático", d: "SAT + POS, sin excels" },
  ];
  
  return (
    <section className="bg-zinc-50 border-y border-zinc-200">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-12">
        {items.map((it, idx) => (
          <motion.div 
            key={it.k}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="text-center"
          >
            <div className="text-4xl font-bold">{it.k}</div>
            <div className="mt-2 text-sm text-zinc-600">{it.d}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ObsessSection() {
  const cards = [
    { t: "Visibilidad diaria", d: "Compras vs ventas por tienda, hoy." },
    { t: "Diagnóstico puntual", d: "Top variaciones e insumos que disparan tu FC." },
    { t: "Alertas útiles", d: "Cuando el FC supera tu objetivo." },
  ];
  
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold"
        >
          Obsesión por food cost
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-zinc-600 text-lg"
        >
          Vivimos y respiramos food cost. Todo aquí se diseña para encontrar fugas.
        </motion.p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c, idx) => (
            <motion.div 
              key={c.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-2xl font-semibold">{c.t}</div>
              <p className="mt-2 text-zinc-600">{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisibilitySection() {
  const bullets = [
    "Compras por RFC, recetas por marca, inventario por tienda.",
    "Drill-down inmediato (corporativo → marca → tienda).",
    "Sin fricciones: intake automático de CFDI + POS.",
    "Export listo para P&L.",
  ];
  
  return (
    <section className="px-6 py-24 bg-zinc-50 border-t border-zinc-200">
      <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-2 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-zinc-200 bg-white h-[320px] shadow-sm flex items-center justify-center"
        >
          <div className="text-zinc-400 text-sm text-center px-4">
            Gráfico: Food cost real vs objetivo (30 días)
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold">Visibilidad = poder</h3>
          <ul className="mt-6 space-y-3 text-zinc-700">
            {bullets.map((b, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-zinc-900 flex-shrink-0" />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="demo" className="px-6 py-28">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl text-center"
      >
        <h2 className="text-5xl font-bold">¿Listo para ver tus números?</h2>
        <p className="mt-4 text-lg text-zinc-600">
          Agenda una demo de 30 minutos con tus datos reales.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://calendly.com/counteros/demo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-8 py-4 rounded-xl bg-zinc-900 text-white text-lg font-semibold hover:bg-zinc-800 transition-all hover:scale-105"
            aria-label="Agendar demo con CounterOS"
          >
            Agendar demo
          </a>
          <a 
            href="mailto:hola@counteros.mx" 
            className="px-8 py-4 rounded-xl border-2 border-zinc-200 text-lg font-semibold hover:border-zinc-300 transition-all hover:scale-105"
            aria-label="Contactar por correo electrónico"
          >
            Escribir por correo
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-xl font-bold">CounterOS</div>
        <div className="flex items-center gap-6 text-sm text-zinc-600">
          <Link to="/login" className="hover:text-zinc-900 transition-colors">Login</Link>
          <a href="mailto:hola@counteros.mx" className="hover:text-zinc-900 transition-colors">Contacto</a>
        </div>
      </div>
      <div className="pb-10 text-center text-sm text-zinc-500">
        © 2025 CounterOS. Hecho en México 🇲🇽
      </div>
    </footer>
  );
}
