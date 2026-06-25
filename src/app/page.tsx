import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Store,
  CheckCircle,
  Zap,
  MessageCircle,
  ShoppingBag,
  BarChart3,
  Globe,
  Palette,
  Shield,
  Star,
  ArrowRight,
  Sparkles,
  Package,
  Clock,
  TrendingUp,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'TicoMerce — Tu tienda online lista en minutos',
  description:
    'Crea tu tienda online profesional. Catálogo 24/7, pedidos por WhatsApp, sin comisiones por venta. Para negocios en Costa Rica.',
}

export default function PlatformLanding() {
  const whatsappNumber = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '50671139391'
  const whatsappMessage = encodeURIComponent('Hola, me interesa crear mi tienda online en TicoMerce.')
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: '#fff', color: '#0a0a0a', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .hover-opacity:hover {
          opacity: 0.8 !important;
        }
        .hover-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 14px 40px rgba(0,0,0,0.25) !important;
        }
        .hover-secondary:hover {
          background: rgba(0,0,0,0.07) !important;
        }
        .hover-step:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important;
          transform: translateY(-4px) !important;
        }
        .hover-feat:hover {
          background: #fff !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important;
          border-color: #e8e8e8 !important;
        }
        .hover-wa:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 14px 50px rgba(37,211,102,0.5) !important;
        }
        .hover-footer-link:hover {
          color: #999 !important;
        }
      `}} />

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#0a0a0a', borderRadius: 10, padding: 7, display: 'flex' }}>
            <Store size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px' }}>TicoMerce</span>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-opacity"
          style={{
            background: '#0a0a0a', color: '#fff',
            fontWeight: 700, fontSize: 13,
            padding: '9px 20px', borderRadius: 10,
            textDecoration: 'none', letterSpacing: '-0.2px',
            transition: 'opacity 0.2s',
          }}
        >
          Quiero mi tienda →
        </a>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 80px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #e8f4ff 0%, #f8f0ff 40%, #fff 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '15%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 100, padding: '6px 14px', marginBottom: 28,
        }}>
          <Sparkles size={12} color="#6366f1" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.02em' }}>
            Plataforma e-commerce para PYMES en Costa Rica
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(42px, 7vw, 88px)',
          fontWeight: 900,
          letterSpacing: '-3px',
          lineHeight: 1,
          maxWidth: 760,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #4f4f4f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Tu catálogo online.<br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Los pedidos a WhatsApp.
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 21px)',
          color: '#666', fontWeight: 400, lineHeight: 1.6,
          maxWidth: 520, marginBottom: 44,
        }}>
          Creá tu tienda profesional en menos de 5 minutos. Sin comisiones por venta,
          sin complicaciones. Vendé más mientras dormís.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-primary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0a0a0a', color: '#fff',
              fontWeight: 800, fontSize: 16,
              padding: '16px 36px', borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
              transition: 'all 0.25s ease',
            }}
          >
            <MessageCircle size={18} />
            Quiero mi tienda gratis
          </a>
          <a
            href="#como-funciona"
            className="hover-secondary"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,0,0,0.04)', color: '#333',
              fontWeight: 700, fontSize: 15,
              padding: '16px 28px', borderRadius: 14,
              textDecoration: 'none', border: '1px solid rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Ver cómo funciona <ArrowRight size={16} />
          </a>
        </div>

        {/* Social proof strip */}
        <div style={{
          marginTop: 52, display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 100, padding: '10px 20px',
        }}>
          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
          <span style={{ fontSize: 13, fontWeight: 700, color: '#555', marginLeft: 4 }}>
            Tiendas activas vendiendo hoy
          </span>
        </div>
      </section>

      {/* ── STORE MOCKUP SECTION ─────────────────────────── */}
      <section style={{
        padding: '80px 24px',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32, alignItems: 'center',
          }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 100, padding: '5px 12px', marginBottom: 20,
              }}>
                <Globe size={11} color="#a5f3fc" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#a5f3fc', letterSpacing: '0.04em' }}>LIVE 24/7</span>
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
                color: '#fff', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20,
              }}>
                Tu catálogo siempre disponible,<br />
                <span style={{ color: '#6366f1' }}>en todos los dispositivos.</span>
              </h2>
              <p style={{ color: '#888', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>
                Tus clientes pueden ver tus productos, agregar al carrito y enviarte el pedido por WhatsApp desde su celular, tablet o computadora. Sin instalar nada.
              </p>
              {[
                'Catálogo con fotos y precios actualizados',
                'Carrito de compras integrado',
                'Pedido llega organizado a tu WhatsApp',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <CheckCircle size={16} color="#22c55e" />
                  <span style={{ color: '#ccc', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Phone Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 280,
                background: '#111',
                borderRadius: 36,
                padding: 8,
                boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                position: 'relative',
              }}>
                <div style={{
                  background: '#fff', borderRadius: 30, overflow: 'hidden',
                  height: 520,
                }}>
                  {/* Mockup Navbar */}
                  <div style={{ background: '#0a0a0a', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '-0.5px' }}>Mi Tienda</span>
                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={13} color="#fff" />
                    </div>
                  </div>
                  {/* Mockup Banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    padding: '20px 16px',
                  }}>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>BIENVENIDOS</p>
                    <p style={{ color: '#fff', fontSize: 16, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>Los mejores productos para vos</p>
                    <div style={{
                      background: '#fff', color: '#6366f1',
                      fontWeight: 800, fontSize: 10,
                      padding: '6px 14px', borderRadius: 8,
                      display: 'inline-block',
                    }}>Ver Catálogo</div>
                  </div>
                  {/* Mockup Products */}
                  <div style={{ padding: '12px 12px 0' }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#111', marginBottom: 10, letterSpacing: '-0.2px' }}>Destacados</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { name: 'Camisa Polo', price: '₡18,000', color: '#fde68a' },
                        { name: 'Pantalón', price: '₡24,500', color: '#bfdbfe' },
                        { name: 'Zapatos', price: '₡32,000', color: '#d1fae5' },
                        { name: 'Gorra', price: '₡9,500', color: '#fce7f3' },
                      ].map((p, i) => (
                        <div key={i} style={{
                          background: '#fafafa', borderRadius: 12,
                          overflow: 'hidden', border: '1px solid #f0f0f0',
                        }}>
                          <div style={{
                            height: 70, background: p.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Package size={22} color="rgba(0,0,0,0.3)" />
                          </div>
                          <div style={{ padding: '6px 8px' }}>
                            <p style={{ fontSize: 9, fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.2 }}>{p.name}</p>
                            <p style={{ fontSize: 10, fontWeight: 900, color: '#6366f1', margin: '2px 0 0' }}>{p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ───────────────────────────────── */}
      <section id="como-funciona" style={{ padding: '100px 24px', background: '#f8f8f8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Proceso
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
            De cero a vendiendo en 3 pasos
          </h2>
          <p style={{ color: '#888', fontSize: 17, marginBottom: 60, maxWidth: 480, margin: '0 auto 60px' }}>
            Configuración sencilla sin necesidad de conocimientos técnicos.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              {
                num: '01',
                icon: MessageCircle,
                title: 'Nos contactás',
                desc: 'Escribinos por WhatsApp con el nombre de tu tienda, logo y colores. Nosotros hacemos el resto.',
                color: '#6366f1',
                bg: '#ede9fe',
              },
              {
                num: '02',
                icon: Package,
                title: 'Cargamos tus productos',
                desc: 'Mandás las fotos y precios. Tu catálogo queda online con diseño profesional en menos de 24h.',
                color: '#0891b2',
                bg: '#e0f2fe',
              },
              {
                num: '03',
                icon: TrendingUp,
                title: 'Empezás a vender',
                desc: 'Compartís el link de tu tienda. Los pedidos llegan organizados directo a tu WhatsApp.',
                color: '#16a34a',
                bg: '#dcfce7',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="hover-step"
                style={{
                  background: '#fff', borderRadius: 20,
                  padding: '32px 28px',
                  border: '1px solid #f0f0f0',
                  textAlign: 'left',
                  position: 'relative', overflow: 'hidden',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 20, right: 20,
                  fontSize: 48, fontWeight: 900, color: 'rgba(0,0,0,0.04)',
                  lineHeight: 1, letterSpacing: '-3px',
                }}>{step.num}</span>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: step.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <step.icon size={22} color={step.color} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' }}>{step.title}</h3>
                <p style={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Funcionalidades</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 0 }}>
              Todo lo que tu negocio necesita
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { icon: Globe, title: 'Catálogo 24/7', desc: 'Tu tienda nunca cierra. Los clientes pueden ver tus productos a cualquier hora desde cualquier dispositivo.', color: '#6366f1', bg: '#ede9fe' },
              { icon: Zap, title: 'Sin comisiones por venta', desc: 'El 100% de cada venta es tuyo. Nosotros cobramos solo la mensualidad fija, sin sorpresas.', color: '#f59e0b', bg: '#fef3c7' },
              { icon: MessageCircle, title: 'WhatsApp nativo', desc: 'Los pedidos llegan organizados con todos los productos, cantidades y total. Listo para confirmar.', color: '#22c55e', bg: '#dcfce7' },
              { icon: Palette, title: 'Tu identidad de marca', desc: 'Colores, logo, banner y texto personalizados. Tu tienda se ve exactamente como tu negocio.', color: '#ec4899', bg: '#fce7f3' },
              { icon: BarChart3, title: 'Panel de administración', desc: 'Gestioná productos, categorías, precios e inventario desde un panel intuitivo y rápido.', color: '#0891b2', bg: '#e0f2fe' },
              { icon: Shield, title: 'Seguro y confiable', desc: 'Infraestructura en la nube con 99.9% de disponibilidad. Tus datos y los de tus clientes protegidos.', color: '#16a34a', bg: '#dcfce7' },
            ].map((feat, i) => (
              <div
                key={i}
                className="hover-feat"
                style={{
                  display: 'flex', gap: 16,
                  padding: '24px 22px',
                  borderRadius: 18,
                  border: '1px solid #f0f0f0',
                  background: '#fafafa',
                  transition: 'all 0.25s',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: feat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                }}>
                  <feat.icon size={20} color={feat.color} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 5, letterSpacing: '-0.3px' }}>{feat.title}</h3>
                  <p style={{ color: '#888', fontSize: 13, lineHeight: 1.65 }}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#f8f8f8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Inversión</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 12 }}>
              Precios simples y transparentes
            </h2>
            <p style={{ color: '#888', fontSize: 17 }}>Sin contratos, sin comisiones. Cancelás cuando querés.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 740, margin: '0 auto' }}>
            {/* Setup Card */}
            <div style={{
              background: '#fff', borderRadius: 24, padding: '36px 32px',
              border: '1px solid #eee',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Clock size={15} color="#888" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Setup Inicial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-3px', color: '#111' }}>₡25,000</span>
              </div>
              <p style={{ color: '#bbb', fontSize: 12, fontWeight: 600, marginBottom: 28 }}>Pago único</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Configuración inicial completa',
                  'Carga de primeros productos',
                  'Personalización de marca',
                  'Capacitación de uso del panel',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#555' }}>
                    <CheckCircle size={15} color="#22c55e" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Monthly Card */}
            <div style={{
              background: '#0a0a0a', borderRadius: 24, padding: '36px 32px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 200, height: 200, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 10, fontWeight: 800,
                padding: '4px 12px', borderRadius: 100,
                letterSpacing: '0.05em',
              }}>RECOMENDADO</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <TrendingUp size={15} color="#888" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mensualidad</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-3px', color: '#fff' }}>₡15,000</span>
                <span style={{ color: '#666', fontSize: 15 }}>/mes</span>
              </div>
              <p style={{ color: '#555', fontSize: 12, fontWeight: 600, marginBottom: 28 }}>Cancelá cuando querás</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Hosting y mantenimiento incluidos',
                  'Productos y categorías ilimitadas',
                  'Pedidos por WhatsApp ilimitados',
                  'Soporte técnico prioritario',
                  'Actualizaciones y nuevas funciones',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#aaa' }}>
                    <CheckCircle size={15} color="#22c55e" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Preguntas frecuentes</h2>
          </div>
          {[
            { q: '¿Necesito saber de tecnología para usar la plataforma?', a: 'No. Nosotros configuramos todo por vos. Solo necesitás mandarnos el nombre, logo, colores y los productos. El resto lo hacemos nosotros.' },
            { q: '¿Cómo llegan los pedidos?', a: 'Cuando un cliente termina su pedido, se genera un mensaje automático organizado con todos los productos y el total. Ese mensaje llega directo a tu WhatsApp.' },
            { q: '¿Puedo personalizar los colores y logo de mi tienda?', a: 'Sí. Cada tienda tiene su propia identidad visual: colores primarios, logo, imagen de banner y mensajes personalizados.' },
            { q: '¿Hay contrato de permanencia?', a: 'No. Podés cancelar la mensualidad cuando querás sin penalizaciones ni cargos adicionales.' },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                borderBottom: '1px solid #f0f0f0',
                padding: '22px 0',
              }}
            >
              <p style={{ fontWeight: 800, fontSize: 15, color: '#111', marginBottom: 8, letterSpacing: '-0.3px' }}>{faq.q}</p>
              <p style={{ color: '#777', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────── */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 100, padding: '6px 14px', marginBottom: 24,
          }}>
            <Sparkles size={12} color="#a5b4fc" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>Empezá hoy mismo</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900,
            color: '#fff', letterSpacing: '-2.5px', lineHeight: 1.1, marginBottom: 16,
          }}>
            ¿Listo para tener tu<br />
            <span style={{ color: '#818cf8' }}>tienda online?</span>
          </h2>
          <p style={{ color: '#666', fontSize: 17, marginBottom: 40 }}>
            Escribinos y en menos de 24 horas tu tienda está funcionando.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-wa"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#25D366', color: '#fff',
              fontWeight: 800, fontSize: 17,
              padding: '18px 44px', borderRadius: 16,
              textDecoration: 'none',
              boxShadow: '0 8px 40px rgba(37,211,102,0.4)',
              transition: 'all 0.25s',
            }}
          >
            <MessageCircle size={20} />
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{
        padding: '28px 24px',
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, display: 'flex' }}>
            <Store size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '-0.5px' }}>TicoMerce</span>
        </div>
        <p style={{ fontSize: 13, color: '#444' }}>
          © {new Date().getFullYear()} TicoMerce. Todos los derechos reservados.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-footer-link"
          style={{ fontSize: 13, color: '#666', textDecoration: 'none', transition: 'color 0.2s' }}
        >
          Soporte por WhatsApp
        </a>
      </footer>
    </div>
  )
}
