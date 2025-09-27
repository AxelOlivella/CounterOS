import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, TrendingUp, Zap, Bell, Shield, Layers, ArrowRight } from "lucide-react";

// ✅ Landing page listísima para pegarse en tu repo (Vite/Next + Tailwind + shadcn).
// - Idioma: Español
// - Estilo: limpio, moderno, con énfasis en valor (P&L automático, food cost, merma, energía, IA, multi‑tenant skins)
// - Animaciones: Framer Motion sutiles
// - Secciones: Navbar, Hero, Logos, Problema, Cómo funciona, Features, Mockups, Pricing CTA, Testimonios, FAQ, Footer
// - Branding flexible: cambia productName para usar CounterOS, foodOS.ai, etc.

const productName = "CounterOS"; // Cambia a "foodOS.ai" si prefieres.
const primaryCTA = {
  label: "Solicitar demo",
  href: "https://calendly.com/tu-demo", // TODO: reemplazar
};
const secondaryCTA = {
  label: "Ver ejemplo de P&L",
  href: "#ejemplo", // ancla temporal
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-zinc-100">
      <Nav />
      <Hero />
      <LogoStrip />
      <Problem />
      <HowItWorks />
      <Features />
      <Screenshots />
      <PricingCTA />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span className="font-semibold tracking-tight">{productName}</span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#funciona" className="text-sm text-zinc-300 hover:text-white">Cómo funciona</a>
          <a href="#features" className="text-sm text-zinc-300 hover:text-white">Funciones</a>
          <a href="#faq" className="text-sm text-zinc-300 hover:text-white">FAQ</a>
          <a href="/login" className="text-sm text-zinc-300 hover:text-white">Iniciar sesión</a>
          <Button asChild size="sm" className="gap-2">
            <a href={primaryCTA.href}>{primaryCTA.label} <ArrowRight className="h-4 w-4"/></a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_200px_at_50%_-20%,rgba(16,185,129,0.25),transparent)]"/>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Baja tu <span className="text-emerald-400">food cost</span> y obtén tu
            <span className="text-emerald-400"> P&L automático</span> por tienda.
          </h1>
          <p className="mt-4 max-w-xl text-zinc-300">
            {productName} convierte tus CFDIs y ventas en decisiones diarias: controla <span className="text-white">food cost y merma</span>, y genera <span className="text-white">P&L automático</span> por tienda sin hojas de cálculo.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <a href={primaryCTA.href}>{primaryCTA.label} <ArrowRight className="h-5 w-5"/></a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
              <a href={secondaryCTA.href}>{secondaryCTA.label}</a>
            </Button>
          </div>
          <ul className="mt-6 grid max-w-xl grid-cols-1 gap-2 text-sm text-zinc-400 sm:grid-cols-2">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> Reduce 2–4 pts de food cost en 30–60 días*</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> P&L por tienda en un clic (cierra mes en horas, no semanas)</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> Merma visible por receta e insumo</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> Energía por ticket y nómina/ventas</li>
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <div className="aspect-[4/3] w-full rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-800 p-3 shadow-2xl">
            <div className="h-full w-full rounded-2xl bg-[linear-gradient(120deg,rgba(16,185,129,0.2),transparent)] p-6">
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
                <span>Demo • Portal Centro</span>
                <span>Mar 2025</span>
              </div>
              <div className="grid h-full grid-rows-3 gap-4">
                <Metric label="EBITDA mensual" value="$ 142,500" trend="↑ 12%"/>
                <Metric label="Food cost %" value="29.8%" trend="↓ 2.1 pts"/>
                <Metric label="Energía por ticket" value="$ 1.92" trend="↓ 8%"/>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Metric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <Card className="border-white/10 bg-zinc-900/60">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-400">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function LogoStrip() {
  return (
    <section className="border-y border-white/10 bg-zinc-950/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-6 px-6 py-8 opacity-80 md:grid-cols-5">
        {[
          "NutrisaOS",
          "MoyoOS",
          "CrepasOS",
          "SushiOS",
          "CoffeeOS",
        ].map((name) => (
          <div key={name} className="text-center text-sm text-zinc-400">{name}</div>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">El problema</h2>
          <p className="mt-3 text-zinc-300">
            El <span className="text-white">food cost</span> y la <span className="text-white">merma</span> se detectan tarde y el P&L llega semanas después: ya es muy tarde para corregir.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> -3% EBITDA por food cost mal controlado</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> -2% por mermas invisibles</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> Cierres de mes lentos y manuales</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">La solución</h2>
          <p className="mt-3 text-zinc-300">
            {productName} integra CFDIs + POS, calcula consumo teórico vs. real y entrega <span className="text-white">P&L automático</span>. Alertas de IA te avisan cuando el <span className="text-white">food cost</span> se sale de rango.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <Layers className="h-5 w-5"/>,
      title: "Conecta datos",
      desc: "Sube CFDIs y POS (CSV/API). Onboarding de 5 pasos por tienda.",
    },
    {
      icon: <Zap className="h-5 w-5"/>,
      title: "Procesa y calcula",
      desc: "Mapeo insumos↔recetas, food cost, merma, nómina y energía.",
    },
    {
      icon: <Bell className="h-5 w-5"/>,
      title: "Alertas y P&L",
      desc: "Alertas de IA y P&L mensual consolidado listo para exportar.",
    },
  ];
  return (
    <section id="funciona" className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-6 text-center text-2xl font-semibold">Cómo funciona</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
            <Card className="border-white/10 bg-zinc-900/60">
              <CardContent className="p-6">
                <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 p-2 text-emerald-400">
                  {s.icon}
                </div>
                <div className="text-lg font-medium">{s.title}</div>
                <p className="mt-1 text-sm text-zinc-300">{s.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: <TrendingUp className="h-5 w-5"/>, title: "Food cost & merma", desc: "Reduce 2–4 pts: consumo teórico vs real por receta e insumo." },
    { icon: <Sparkles className="h-5 w-5"/>, title: "P&L automático", desc: "Estado de resultados por tienda y consolidado en segundos." },
    { icon: <Bell className="h-5 w-5"/>, title: "Alertas de IA", desc: "Desviaciones anómalas por tienda y día." },
    { icon: <Zap className="h-5 w-5"/>, title: "Energía por ticket", desc: "Controla el costo energético por transacción." },
    { icon: <Shield className="h-5 w-5"/>, title: "Multi‑tenant y skins", desc: "Aislamiento de datos + marcas personalizadas (NutrisaOS, etc.)." },
    { icon: <Layers className="h-5 w-5"/>, title: "Integraciones", desc: "POS por CSV/API y OCR de CFDIs (SAT)." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((f, i) => (
          <Card key={i} className="border-white/10 bg-zinc-900/60">
            <CardContent className="p-6">
              <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 p-2 text-emerald-400">{f.icon}</div>
              <div className="text-lg font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-zinc-300">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Screenshots() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10" id="ejemplo">
      <h2 className="mb-4 text-center text-2xl font-semibold">Ejemplo de P&L y KPIs</h2>
      <p className="mx-auto mb-8 max-w-2xl text-center text-zinc-300">
        Coloca aquí capturas reales de Metabase o del producto (P&L por tienda, food cost/merma, energía por ticket). Usa imágenes en /public y cámbialas cuando tengas screenshots.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {[1,2,3,4].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl border border-white/10 bg-zinc-900/60" />
        ))}
      </div>
    </section>
  );
}

function PricingCTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <Card className="border-white/10 bg-emerald-500/10">
        <CardContent className="grid gap-6 p-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold">ROI primero: paga solo si ahorras</h3>
            <p className="mt-2 text-zinc-200">Piloto 30 días. Si no bajas food cost o no te entregamos P&L automático, no pagas. Luego desde $1,500 MXN/tienda/mes.</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-200">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> Reducción esperada: 2–4 pts de food cost</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> P&L listo en horas, no semanas</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400"/> Alertas de IA listas desde el día 1</li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 md:items-end">
            <div className="w-full max-w-sm">
              <Input placeholder="tu@empresa.com" className="bg-white/5"/>
            </div>
            <Button asChild size="lg" className="gap-2">
              <a href={primaryCTA.href}>{primaryCTA.label} <ArrowRight className="h-5 w-5"/></a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            quote: "El P&L sale solo y por primera vez puedo ver el food cost real por tienda.",
            author: "Gerente Operaciones – Froyo",
          },
          {
            quote: "Reducimos 2 pts de merma en fruta en 30 días.",
            author: "Franquiciatario – Centro Sur",
          },
          {
            quote: "Energía por ticket se desplomó y mejoró el EBITDA.",
            author: "Director – Cadena Casual",
          },
        ].map((t, i) => (
          <Card key={i} className="border-white/10 bg-zinc-900/60">
            <CardContent className="p-6">
              <p className="text-zinc-200">"{t.quote}"</p>
              <div className="mt-3 text-sm text-zinc-400">{t.author}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "¿Sustituye mi POS?",
      a: "No. {productName} complementa tu POS y lo potencia: integra ventas con compras y gastos para generar el P&L y KPIs en automático.",
    },
    {
      q: "¿Necesito contadores?",
      a: "Puedes seguir con tu contabilidad; simplemente evitamos el armado manual del P&L por tienda y te damos alertas tempranas.",
    },
    {
      q: "¿Cómo se conecta?",
      a: "Subes POS (CSV/API) y CFDIs (XML/PDF). Tenemos wizard de onboarding y soporte en el piloto.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. Multi‑tenant con aislamiento por organización (RLS), cifrado en tránsito y export para auditoría.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="mb-6 text-center text-2xl font-semibold">Preguntas frecuentes</h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <Card key={i} className="border-white/10 bg-zinc-900/60">
            <CardContent className="p-6">
              <div className="font-medium">{f.q}</div>
              <p className="mt-1 text-zinc-300">{f.a.replace("{productName}", productName)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Sparkles className="h-4 w-4 text-emerald-400"/>
          <span>{productName} • Inteligencia Operativa para Cadenas</span>
        </div>
        <div className="text-xs text-zinc-500">© {new Date().getFullYear()} {productName}. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
};