import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingLite() {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
    <nav className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-primary">CounterOS</Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Cómo funciona</a>
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
          <a 
            href="#demo" 
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all"
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
          Controla cada punto de tu <span className="text-secondary">food cost</span>.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-xl text-muted-foreground"
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
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-semibold hover:opacity-90 transition-all hover:scale-105"
          >
            Agendar demo
          </a>
          <a 
            href="#features" 
            className="px-8 py-4 rounded-xl border-2 border-border text-lg font-semibold hover:border-primary transition-all hover:scale-105"
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
    <section className="bg-muted/30 border-y border-border">
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
            <div className="text-4xl font-bold text-secondary">{it.k}</div>
            <div className="mt-2 text-sm text-muted-foreground">{it.d}</div>
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
          className="text-4xl font-bold text-primary"
        >
          Obsesión por food cost
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-muted-foreground text-lg"
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
              className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm hover:shadow-md transition-all hover:border-secondary"
            >
              <div className="text-2xl font-semibold text-foreground">{c.t}</div>
              <p className="mt-2 text-muted-foreground">{c.d}</p>
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
    <section className="px-6 py-24 bg-muted/30 border-t border-border">
      <div className="mx-auto max-w-6xl grid gap-10 md:grid-cols-2 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border bg-card p-8 h-[320px] shadow-sm flex flex-col"
        >
          <div className="text-sm font-medium text-muted-foreground mb-6">Food Cost Real vs Objetivo (30 días)</div>
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="50" x2="400" y2="50" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
              
              {/* Objetivo line (horizontal at 28%) */}
              <line x1="0" y1="100" x2="400" y2="100" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />
              
              {/* Real line (variable) - animated */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d="M 0,60 L 66,90 L 133,70 L 200,30 L 266,130 L 333,80 L 400,100"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Area under line */}
              <motion.path
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d="M 0,60 L 66,90 L 133,70 L 200,30 L 266,130 L 333,80 L 400,100 L 400,200 L 0,200 Z"
                fill="hsl(var(--secondary))"
              />
            </svg>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--secondary))' }} />
              <span className="text-muted-foreground">Food Cost Real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-muted-foreground" />
              <span className="text-muted-foreground">Objetivo (28%)</span>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-primary">Visibilidad = poder</h3>
          <ul className="mt-6 space-y-3 text-foreground">
            {bullets.map((b, i) => (
              <motion.li 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex gap-3"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-secondary flex-shrink-0" />
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
        <h2 className="text-5xl font-bold text-primary">¿Listo para ver tus números?</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Agenda una demo de 30 minutos con tus datos reales.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://calendly.com/counteros/demo" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-semibold hover:opacity-90 transition-all hover:scale-105"
            aria-label="Agendar demo con CounterOS"
          >
            Agendar demo
          </a>
          <a 
            href="mailto:hola@counteros.mx" 
            className="px-8 py-4 rounded-xl border-2 border-border text-lg font-semibold hover:border-primary transition-all hover:scale-105"
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
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-xl font-bold text-primary">CounterOS</div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          <a href="mailto:hola@counteros.mx" className="hover:text-foreground transition-colors">Contacto</a>
        </div>
      </div>
      <div className="pb-10 text-center text-sm text-muted-foreground">
        © 2025 CounterOS. Hecho en México 🇲🇽
      </div>
    </footer>
  );
}
