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

const productName = "CounterOS";
const primaryCTA = {
  label: "Probar gratis 30 días",
  href: "/login",
};
const secondaryCTA = {
  label: "Ver demo de costos",
  href: "#ejemplo",
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
    <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-dark" />
          <span className="font-semibold tracking-tight text-foreground">{productName}</span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Iniciar sesión</a>
          <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
            <a href={primaryCTA.href}>{primaryCTA.label} <ArrowRight className="h-4 w-4"/></a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_200px_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]"/>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
            El sistema operativo <span className="text-secondary">obsesionado</span> con tus costos.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Una herramienta simple que conecta tus operaciones y te ayuda a <span className="text-primary font-medium">gastar menos desde el primer día</span>.
          </p>
          <p className="mt-3 max-w-xl text-muted-foreground">
            No somos un POS más. Somos la capa que da <span className="text-primary font-medium">visibilidad y control práctico</span> para reducir mermas y mejorar márgenes.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
              <a href={primaryCTA.href}>{primaryCTA.label} <ArrowRight className="h-5 w-5"/></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <a href={secondaryCTA.href}>{secondaryCTA.label}</a>
            </Button>
          </div>
          <ul className="mt-6 grid max-w-xl grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> Control básico de inventarios → menos desperdicio</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> Integración simple de delivery → menos comisiones ocultas</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> Data esencial en tiempo real → decisiones rápidas</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> P&L automatizado por tienda</li>
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
          <div className="aspect-[4/3] w-full rounded-3xl border border-border bg-gradient-to-br from-card to-muted p-3 shadow-xl">
            <div className="h-full w-full rounded-2xl bg-gradient-primary/10 p-6">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>CounterOS • Portal Centro</span>
                <span>Mar 2025</span>
              </div>
              <div className="grid h-full grid-rows-3 gap-4">
                <Metric label="Food cost %" value="28.4%" trend="↓ 3.2 pts"/>
                <Metric label="Ahorro mensual" value="$ 24,500" trend="↑ Real"/>
                <Metric label="Tiempo de cierre" value="2.5 hrs" trend="vs 2 semanas"/>
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
    <Card className="border-border bg-card/80">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold text-foreground">{value}</div>
        </div>
        <div className="flex items-center gap-2 text-success">
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-medium">{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function LogoStrip() {
  return (
    <section className="border-y border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <p className="text-center text-xs text-muted-foreground mb-4">Sistema probado con</p>
        <div className="grid grid-cols-2 items-center gap-6 md:grid-cols-5">
          {[
            "QSR Centro",
            "Froyo Norte", 
            "Crepas Plaza",
            "Coffee Local",
            "Yogurt Express",
          ].map((name) => (
            <div key={name} className="text-center text-sm font-medium text-muted-foreground">{name}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Cada peso cuenta</h2>
          <p className="mt-3 text-muted-foreground">
            Los costos se descontrolan porque <span className="text-foreground font-medium">no los ves en tiempo real</span>. Cuando te das cuenta, ya perdiste el mes.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">• Food cost se come 3-5 puntos extra sin que lo notes</li>
            <li className="flex items-center gap-2">• Merma invisible en ingredientes caros</li>
            <li className="flex items-center gap-2">• P&L llega semanas tarde, cuando ya no puedes actuar</li>
            <li className="flex items-center gap-2">• Gastos ocultos en delivery y comisiones</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Control práctico, desde el día 1</h2>
          <p className="mt-3 text-muted-foreground">
            {productName} te da <span className="text-foreground font-medium">visibilidad inmediata</span> de dónde se va tu dinero. Simple de configurar, útil desde la primera semana.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-success">
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> Ves tu food cost real cada día</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> Detectas merma antes de que se vuelva pérdida</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> P&L listo para revisar, no para calcular</li>  
            <li className="flex items-center gap-2"><Check className="h-4 w-4"/> Data útil, no reportes bonitos</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: <Layers className="h-5 w-5"/>,
      title: "Setup básico",
      desc: "5 pasos: tienda, productos, costos, gastos fijos. Listo en 20 minutos.",
    },
    {
      icon: <Zap className="h-5 w-5"/>,
      title: "Datos diarios",
      desc: "Conecta ventas y gastos. Empiezas a ver food cost real desde la primera semana.",
    },
    {
      icon: <Bell className="h-5 w-5"/>,
      title: "Alertas útiles",
      desc: "Te avisa cuando algo se sale de rango. No ruido, solo lo que importa.",
    },
  ];
  return (
    <section id="funciona" className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">Funciona simple</h2>
      <p className="mb-8 text-center text-muted-foreground max-w-2xl mx-auto">
        No necesitas integraciones complejas ni cambiar tu POS. Empezamos simple y agregamos valor desde el primer día.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
            <Card className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="mb-3 inline-flex rounded-full border border-border bg-primary-light p-2 text-primary-dark">
                  {s.icon}
                </div>
                <div className="text-lg font-medium text-foreground">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
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
    { icon: <TrendingUp className="h-5 w-5"/>, title: "Control de inventarios", desc: "Menos desperdicio. Ves exactamente qué se gasta de más y dónde." },
    { icon: <Sparkles className="h-5 w-5"/>, title: "Integración delivery", desc: "Menos comisiones ocultas. Consolidas costos reales de plataformas." },
    { icon: <Bell className="h-5 w-5"/>, title: "Data en tiempo real", desc: "Decisiones rápidas para ahorrar. Food cost, merma y P&L actualizados." },
    { icon: <Zap className="h-5 w-5"/>, title: "P&L automatizado", desc: "Por tienda y consolidado. De semanas de trabajo a un clic." },
    { icon: <Shield className="h-5 w-5"/>, title: "Alertas inteligentes", desc: "Solo lo importante. Cuando algo se sale de rango, lo sabes al día siguiente." },
    { icon: <Layers className="h-5 w-5"/>, title: "Enfoque directo", desc: "Empezamos simple, con foco absoluto en rentabilidad. Sin promesas vacías." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-16">
      <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">Beneficios inmediatos</h2>
      <p className="mb-8 text-center text-muted-foreground max-w-2xl mx-auto">
        Todo está ligado a costo. Si no te ayuda a gastar menos o generar más, no lo incluimos.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((f, i) => (
          <Card key={i} className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="mb-3 inline-flex rounded-full border border-border bg-primary-light p-2 text-primary-dark">{f.icon}</div>
              <div className="text-lg font-semibold text-foreground">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Screenshots() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 bg-muted/30" id="ejemplo">
      <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">Sistema en acción</h2>
      <p className="mx-auto mb-8 max-w-2xl text-center text-muted-foreground">
        Pantallas reales del sistema. Sin mockups bonitos, esto es lo que ves cuando empiezas a usar CounterOS.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: "Food cost por tienda", desc: "28.4% vs meta 30%" },
          { title: "P&L consolidado", desc: "Listo en 2.5 horas" },
          { title: "Alertas de merma", desc: "Fruta +15% esta semana" },
          { title: "Control de gastos", desc: "Delivery 8.2% de ventas" }
        ].map((item, i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-center items-center p-6">
            <div className="text-lg font-medium text-foreground mb-2">{item.title}</div>
            <div className="text-2xl font-bold text-primary-dark mb-2">{item.desc}</div>
            <div className="text-xs text-muted-foreground">[ Captura real próximamente ]</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingCTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <Card className="border-border bg-gradient-success/10">
        <CardContent className="grid gap-6 p-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-foreground">CounterOS está hecho para probar algo</h3>
            <p className="mt-2 text-muted-foreground">Que el costo sí se puede controlar con tecnología. Empezamos simple, pero con foco absoluto en rentabilidad.</p>
            <p className="mt-3 text-sm text-muted-foreground">30 días gratis. Si no ves mejoras reales en food cost o P&L, no pagas nada.</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> Setup en 20 minutos, útil desde la primera semana</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> Ves exactamente dónde se va tu dinero</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-success"/> P&L listo para revisar, no para calcular</li>
            </ul>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 md:items-end">
            <div className="w-full max-w-sm">
              <Input 
                placeholder="tu@empresa.com" 
                className="bg-background"
                type="email"
                onChange={(e) => {/* Email subscription handler */}}
              />
            </div>
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
              <a href={primaryCTA.href}>Probar gratis <ArrowRight className="h-5 w-5"/></a>
            </Button>
            <p className="text-xs text-muted-foreground">Luego $1,500 MXN/tienda/mes</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">Resultados reales del sistema</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            quote: "Veo exactamente dónde se va el dinero. Food cost bajó 2.8 puntos en 6 semanas.",
            author: "Gerente – QSR Centro",
          },
          {
            quote: "El P&L sale en 2 horas, antes me tomaba toda la semana. Es útil de verdad.",
            author: "Dueño – 3 tiendas Froyo",
          },
          {
            quote: "Detectamos merma en mango que nos costaba $4,500 mensual. Ya no.",
            author: "Operaciones – Yogurt Norte",
          },
        ].map((t, i) => (
          <Card key={i} className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <p className="text-foreground">{t.quote}</p>
              <div className="mt-3 text-sm text-muted-foreground">{t.author}</div>
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
      q: "¿Es otro POS más?",
      a: "No. CounterOS se conecta a tu POS actual y le da visibilidad de costos. No cambias nada de tu operación.",
    },
    {
      q: "¿Qué necesito para empezar?",
      a: "Tu POS debe exportar CSV de ventas. El resto lo configuramos en el onboarding de 20 minutos.",
    },
    {
      q: "¿Cuánto tiempo toma ver resultados?",
      a: "Food cost real desde la primera semana. P&L completo desde el primer mes con datos suficientes.",
    },
    {
      q: "¿Realmente funciona siendo tan simple?",
      a: "Sí. Empezamos simple pero útil: reduces costos desde el día 1. Las integraciones avanzadas vienen después.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Aislamiento completo por tenant, cifrado estándar y export de datos cuando quieras. Sin candados.",
    },
    {
      q: "¿Qué pasa si no veo mejoras?",
      a: "30 días gratis. Si no reduces food cost o no tienes tu P&L automático, no pagas. Simple.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 py-14 bg-muted/30">
      <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">Preguntas directas</h2>
      <p className="mb-8 text-center text-muted-foreground">Lo que nos preguntan los operadores reales</p>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <Card key={i} className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="font-medium text-foreground">{f.q}</div>
              <p className="mt-2 text-muted-foreground">{f.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary-dark"/>
          <span>{productName} • Inteligencia Operativa para Cadenas</span>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} {productName}. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
};