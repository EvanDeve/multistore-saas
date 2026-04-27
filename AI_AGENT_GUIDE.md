# Guía para Agentes de IA: Mantenimiento y Despliegue (Multi-Tenant SaaS)

**¡Hola, futuro agente de IA (o desarrollador)!** 
Si estás leyendo esto, el usuario te ha pedido que modifiques o actualices el código de esta plataforma. Lee esta guía antes de hacer cambios para mantener la integridad de la arquitectura multi-tenant.

## Arquitectura Base (Modo SaaS)
1. **Framework:** Next.js 16+ (App Router). Ubicación principal del código: `src/app/`.
2. **Routing:** Path-based (`/t/[slug]`). No usamos subdominios debido a limitaciones en Vercel Free. Middleware no es necesario porque el layout `/t/[slug]/layout.tsx` resuelve la tienda.
3. **Plataforma Core:** `src/app/page.tsx` es el _landing_ de la plataforma. `src/app/super-admin` es el panel principal para gestionar tiendas.
4. **Base de Datos / RLS:** Supabase con _Row Level Security_. Toda query en el frontend se limita por `is_active=true` y `is_available=true`. Los admins solo pueden modificar la tienda asociada a su email.
5. **Autenticación (Super Admin / Admin):** Supabase Auth (Email & Password). Las rutas `/api/admin/*` y `/api/super-admin/*` verifican los JWT a través de los helpers compartidos en `src/lib/api-auth.ts`.
6. **Estilos:** Tailwind CSS v4. Se usan variables CSS inyectadas dinámicamente (`--color-primary`, etc.) desde la DB de cada tienda para colorear los componentes usando `color-mix()` etc. No uses constantes hardcodeadas.
7. **Storage:** Las descargas y subidas van al bucket de Supabase `stores-assets`.

## Reglas Críticas (No romper)
- **Aislamiento Multi-Tenant:** **NUNCA** aceptes el parámetro `store_id` desde peticiones POST/PUT de clientes para las rutas de `/api/admin/`. El `store_id` se debe derivar servidor-adentro basado en el email del token con `getStoreByAdminEmail(email)`. Solo un super admin puede pasar explícitamente un `store_id` en peticiones a `api/super-admin`.
- **Rutas Protegidas:** Siempre invoca `authenticateStoreAdmin` o `authenticateSuperAdmin` al principio de las API Routes.
- **Evitar `fs` / Archivos Locales:** Ya no se usan seeds estáticos ni constantes de mock. Todo el inventario es dinámico leyendo de la DB.
- **Carrito Local:** El carrito sigue viviendo enteramente en el cliente (`localStorage`). Esto permite que el checkout sea sin fricciones a través de un mensaje precompilado por WhatsApp, lo que no consume servidor.

## Proceso de Despliegue (Cómo subir cambios a producción)

El usuario tiene el proyecto conectado a **Vercel** mediante "Continuous Deployment" vinculado a la rama `main` de su repositorio en GitHub.

Si el usuario te pide: **"Publica los cambios"**, **"Aplica esto a la web"**, o **"Súbelo a producción"**, **DEBES EJECUTAR COMANDOS DE GIT automáticamente**. 

Secuencia obligatoria paso a paso para el Agente:
1. Asegúrate de haber completado tus tareas de código y correr `npm run build` para cerciorarse de que nada falló.
2. Ejecuta:
   ```bash
   git add .
   git commit -m "AI Update: [Breve descripción de tus cambios aquí]"
   git push origin main
   ```
3. Informa al usuario que Vercel ha recibido la actualización y que los cambios se reflejarán en internet en unos minutos.

*Fin de instrucciones.*
