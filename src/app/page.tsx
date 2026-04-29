import Link from 'next/link'
import {
  Store,
  Clock,
  MessageCircle,
  Moon,
  CheckCircle,
  Smartphone,
  Zap,
  Globe,
  Settings,
  Palette,
  Timer
} from 'lucide-react'

/**
 * Platform landing page — shown at the root URL.
 * Rediseñado como una SaaS landing page orientada a conversión.
 */
export default function PlatformLanding() {
  const whatsappNumber = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || ''
  const whatsappMessage = encodeURIComponent('Hola, me interesa crear mi tienda online en MultiStore.')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-950 text-white min-h-[90vh] flex flex-col justify-center">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black opacity-80" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-gray-300 text-xs font-semibold tracking-wider uppercase mb-8">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Plataforma SaaS E-commerce
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-8">
            Tu tienda online <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">lista en minutos.</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Los pedidos llegan directamente a tu WhatsApp, sin comisiones por venta ni complejas pasarelas de pago.
            Empezá a vender como un profesional hoy mismo.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-gray-950 font-bold px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 min-h-[56px]"
          >
            Quiero mi tienda
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">¿Te suena familiar?</h2>
            <p className="text-gray-500">Vender por redes sociales sin una plataforma es agotador.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Tus stories desaparecen en 24 horas', desc: 'Todo tu esfuerzo publicando productos se pierde al día siguiente.' },
              { icon: MessageCircle, title: 'Respondés precio por DM todo el día', desc: 'Perdés horas valiosas respondiendo la misma pregunta cientos de veces.' },
              { icon: Moon, title: 'Perdés ventas mientras dormís', desc: 'Si no estás despierto para responder al momento, el cliente se va.' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <card.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section (Cómo funciona) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Cómo funciona</h2>
            <p className="text-gray-500">Vender nunca fue tan simple y organizado.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 z-0"></div>
            
            {[
              { num: '1', title: 'Compartís tu catálogo', desc: 'El cliente entra a tu tienda y ve todos tus productos organizados con su precio y fotos.' },
              { num: '2', title: 'El cliente arma su pedido', desc: 'Agrega productos al carrito de forma fácil e intuitiva desde su celular.' },
              { num: '3', title: 'El pedido llega a tu WhatsApp', desc: 'Recibís un mensaje organizado listo para confirmar la venta y coordinar el pago.' },
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-950 text-white rounded-full flex items-center justify-center text-3xl font-black mb-8 shadow-xl shadow-gray-900/20">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Todo lo que necesitás</h2>
            <p className="text-gray-400">Diseñado específicamente para negocios que quieren crecer.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { icon: Globe, title: 'Catálogo 24/7', desc: 'Disponible siempre para tus clientes.' },
              { icon: Zap, title: 'Sin comisiones por venta', desc: 'El 100% de tus ingresos es tuyo.' },
              { icon: Smartphone, title: 'Pedidos por WhatsApp integrado', desc: 'Comunicación directa y sin fricciones.' },
              { icon: Settings, title: 'Panel de administración propio', desc: 'Gestioná tus productos fácilmente.' },
              { icon: Palette, title: 'Diseño con tu marca y colores', desc: 'Tu tienda se ve exactamente como tu negocio.' },
              { icon: Timer, title: 'Listo en menos de 5 minutos', desc: 'Configuración ultra rápida y sin código.' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1 bg-gray-800 p-3 rounded-xl">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Planes simples y transparentes</h2>
            <p className="text-gray-500">Invertí en tu negocio sin sorpresas a fin de mes.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Setup */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold text-gray-500 mb-2">Setup Inicial</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black tracking-tight">₡25,000</span>
                <span className="text-gray-500">único</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Configuración inicial de la tienda',
                  'Carga de tus primeros productos',
                  'Personalización de colores y logo',
                  'Dominio configurado bajo la plataforma',
                  'Capacitación de uso del panel'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-gray-600 text-sm">
                    <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mensualidad */}
            <div className="bg-gray-950 text-white p-10 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-white text-gray-950 text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                Recomendado
              </div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">Mensualidad</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black tracking-tight">₡15,000</span>
                <span className="text-gray-400">/mes</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Hosting y mantenimiento incluidos',
                  'Productos y categorías ilimitadas',
                  'Pedidos por WhatsApp ilimitados',
                  'Soporte técnico prioritario',
                  'Actualizaciones y nuevas funciones'
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-gray-300 text-sm">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 font-medium mb-6">Sin comisiones. Sin contratos. Cancelás cuando querés.</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-900 text-white font-bold px-8 py-4 rounded-xl text-sm hover:bg-gray-800 transition-all shadow-lg hover:scale-105 active:scale-95 min-h-[48px]"
            >
              Empezar ahora
            </a>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">¿Listo para tener tu tienda online?</h2>
          <p className="text-xl text-gray-400 mb-10 font-light">Escribinos y en menos de 24 horas tu tienda está funcionando.</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-white text-gray-950 font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-base sm:text-lg hover:bg-gray-100 transition-all shadow-xl hover:scale-105 active:scale-95 min-h-[56px]"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="py-8 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <Store className="w-4 h-4" /> MultiStore
          </div>
          <div>© {new Date().getFullYear()} MultiStore. Todos los derechos reservados.</div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto mt-4 sm:mt-0 text-center hover:text-gray-900 transition-colors py-2 px-4 bg-gray-50 rounded-lg sm:bg-transparent sm:p-0">
            Soporte por WhatsApp
          </a>
        </div>
      </footer>
    </div>
  )
}
