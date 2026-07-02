# Vercel — Referencia Avanzada

## vercel.json configuración completa

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "regions": ["iad1"],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## Comandos CLI avanzados

```bash
# Ver todos los deploys
vercel ls

# Inspeccionar un deploy específico
vercel inspect <url-del-deploy>

# Ver logs en tiempo real
vercel logs <url-del-deploy> --follow

# Rollback a deploy anterior
vercel rollback

# Eliminar deploy
vercel remove <url-del-deploy>

# Ver dominios
vercel domains ls

# Agregar dominio personalizado
vercel domains add mi-dominio.com

# Linkear proyecto existente
vercel link
```

---

## Ambientes: Production, Preview, Development

```bash
# Variables por ambiente
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Preview deploy (rama feature)
git push origin feature/nueva-feature
# → Vercel crea URL automática tipo: proyecto-git-feature-user.vercel.app

# Producción (rama main)
git push origin main
# → Deploy automático a dominio principal
```

---

## API Routes / Serverless Functions

### Next.js App Router (recomendado)
```typescript
// app/api/ruta/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data, error } = await supabase.from('tabla').select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // ... procesar
  return NextResponse.json({ success: true }, { status: 201 })
}
```

### Middleware para autenticación
```typescript
// middleware.ts (raíz del proyecto)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/privado/:path*']
}
```

---

## Optimización de performance

```bash
# Analizar bundle size
ANALYZE=true npm run build

# Verificar Core Web Vitals
vercel inspect <url> --logs
```

```javascript
// next.config.js optimizado
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['<ref>.supabase.co'],  // Permitir imágenes de Supabase Storage
    formats: ['image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig
```

---

## Diagnóstico de errores de build

```bash
# Ver build logs localmente
npm run build 2>&1 | tee build.log

# Error: Type errors en TypeScript
npx tsc --noEmit

# Error: ESLint
npm run lint

# Limpiar cache y rebuilding
rm -rf .next
npm run build
```

### Errores frecuentes en Vercel

| Código | Mensaje | Solución |
|--------|---------|---------|
| P1001 | Can't reach database | Verificar DATABASE_URL y conexión |
| ENOTFOUND | DNS lookup failed | Verificar variable SUPABASE_URL |
| 504 | Gateway Timeout | Función > 10s, aumentar `maxDuration` |
| ERR_MODULE_NOT_FOUND | Módulo no encontrado | `npm install` faltante o typo en import |
