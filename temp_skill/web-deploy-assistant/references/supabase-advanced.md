# Supabase — Referencia Avanzada

## Edge Functions

```bash
# Crear nueva edge function
supabase functions new nombre-funcion

# Estructura: supabase/functions/nombre-funcion/index.ts
# Servir localmente
supabase functions serve nombre-funcion

# Deploy
supabase functions deploy nombre-funcion

# Con variables de entorno
supabase secrets set NOMBRE=valor
supabase functions deploy nombre-funcion --no-verify-jwt
```

```typescript
// supabase/functions/nombre-funcion/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase.from('tabla').select('*')
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

## Storage (Archivos)

```javascript
// Subir archivo
const { data, error } = await supabase.storage
  .from('mi-bucket')
  .upload('carpeta/archivo.jpg', file)

// Obtener URL pública
const { data } = supabase.storage
  .from('mi-bucket')
  .getPublicUrl('carpeta/archivo.jpg')

// Descargar
const { data, error } = await supabase.storage
  .from('mi-bucket')
  .download('carpeta/archivo.jpg')

// Eliminar
const { error } = await supabase.storage
  .from('mi-bucket')
  .remove(['carpeta/archivo.jpg'])
```

---

## Realtime (Suscripciones en tiempo real)

```javascript
// Escuchar cambios en una tabla
const channel = supabase
  .channel('cambios-tabla')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'mi_tabla' },
    (payload) => {
      console.log('Cambio recibido:', payload)
    }
  )
  .subscribe()

// Cancelar suscripción
supabase.removeChannel(channel)
```

---

## Queries avanzados

```javascript
// JOIN entre tablas
const { data } = await supabase
  .from('pedidos')
  .select(`
    id,
    total,
    usuarios (
      nombre,
      email
    ),
    productos (
      nombre,
      precio
    )
  `)

// Paginación
const { data, count } = await supabase
  .from('tabla')
  .select('*', { count: 'exact' })
  .range(0, 9)  // Página 1 (10 items)

// Búsqueda de texto completo
const { data } = await supabase
  .from('articulos')
  .select()
  .textSearch('contenido', 'búsqueda aquí')

// Ordenar y filtrar combinados
const { data } = await supabase
  .from('tabla')
  .select('*')
  .gte('precio', 100)
  .lte('precio', 500)
  .order('precio', { ascending: true })
  .limit(20)
```

---

## RLS — Políticas comunes

```sql
-- Ver todas las políticas activas
SELECT * FROM pg_policies;

-- Acceso público de solo lectura
CREATE POLICY "acceso_publico" ON public.mi_tabla
  FOR SELECT USING (true);

-- Solo usuarios autenticados pueden leer
CREATE POLICY "solo_autenticados" ON public.mi_tabla
  FOR SELECT TO authenticated USING (true);

-- Usuario ve solo sus datos (multi-tenant)
CREATE POLICY "datos_propios_select" ON public.mi_tabla
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "datos_propios_insert" ON public.mi_tabla
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "datos_propios_update" ON public.mi_tabla
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "datos_propios_delete" ON public.mi_tabla
  FOR DELETE USING (auth.uid() = user_id);

-- Admin ve todo (basado en rol en tabla de perfiles)
CREATE POLICY "admin_ve_todo" ON public.mi_tabla
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.perfiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

---

## Optimización de queries SQL

```sql
-- Crear índice para queries frecuentes
CREATE INDEX idx_tabla_campo ON public.mi_tabla (campo);

-- Índice compuesto
CREATE INDEX idx_tabla_user_fecha ON public.mi_tabla (user_id, created_at DESC);

-- Verificar uso de índices
EXPLAIN ANALYZE SELECT * FROM mi_tabla WHERE user_id = 'uuid-aqui';

-- Ver queries lentos (activar en Supabase Dashboard → Reports → Slow Queries)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Variables de entorno en Supabase

```bash
# Secretos para Edge Functions
supabase secrets set API_KEY=valor_secreto
supabase secrets set ANOTHER_KEY=otro_valor

# Ver secretos configurados
supabase secrets list

# En la edge function
const apiKey = Deno.env.get('API_KEY')
```

---

## Debugging común

```javascript
// Siempre desestructura el error
const { data, error } = await supabase.from('tabla').select('*')
if (error) {
  console.error('Código:', error.code)
  console.error('Mensaje:', error.message)
  console.error('Detalle:', error.details)
  console.error('Hint:', error.hint)
}

// Errores comunes:
// PGRST301 → RLS bloqueando (falta política)
// PGRST116 → No se encontraron filas cuando se esperaba una
// 42P01    → Tabla no existe
// 23505    → Violación de unique constraint
```
