-- Supabase Schema Migration: 00001_init.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: profiles (Extends auth.users to store custom user data like rol, estado, nombre)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rol TEXT DEFAULT 'user',
  estado TEXT DEFAULT 'activo',
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: usuarios (Miembros de la junta/comunidad)
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: pagos
CREATE TABLE pagos (
  id_pago UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  mes_target TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monto DECIMAL(10, 2),
  estado TEXT DEFAULT 'completado'
);

-- Table: saldos
CREATE TABLE saldos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mes TEXT NOT NULL,
  estado TEXT NOT NULL,
  UNIQUE(usuario_id, mes)
);

-- Table: gastos
CREATE TABLE gastos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  categoria TEXT
);

-- Table: jornales
CREATE TABLE jornales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  miembro_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  descripcion TEXT,
  horas INT
);

-- Table: config
CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Table: foro
CREATE TABLE foro (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  autor UUID REFERENCES auth.users(id),
  contenido TEXT NOT NULL
);

-- Table: juntas
CREATE TABLE juntas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  ruc TEXT,
  estado TEXT DEFAULT 'activo'
);

-- Table: auditoria
CREATE TABLE auditoria (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accion TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  afectado_id UUID,
  detalles JSONB
);

-- Table: archivos
CREATE TABLE archivos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pago_id UUID REFERENCES pagos(id_pago) ON DELETE CASCADE,
  file_hash TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: puntos_historial
CREATE TABLE puntos_historial (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tipo_transaccion TEXT NOT NULL,
  puntos INT NOT NULL
);

-- Table: notificaciones
CREATE TABLE notificaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE
);

-- Table: mensajes
CREATE TABLE mensajes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversacion_id TEXT NOT NULL,
  de UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  para UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE
);

-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornales ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE foro ENABLE ROW LEVEL SECURITY;
ALTER TABLE juntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_historial ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Base Policies (For simplicity, allowing authenticated users read/write access to most resources while building. 
-- In production, these should be strictly tailored to user roles).

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- App Data (Allow all authenticated users for now)
CREATE POLICY "Authed users can select all" ON usuarios FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authed users can insert all" ON usuarios FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authed users can update all" ON usuarios FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authed users can select pagos" ON pagos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authed users can insert pagos" ON pagos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authed users can update pagos" ON pagos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authed users can select saldos" ON saldos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authed users can insert saldos" ON saldos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authed users can update saldos" ON saldos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authed users can select gastos" ON gastos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authed users can insert gastos" ON gastos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authed users can read config" ON config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authed users can write config" ON config FOR ALL USING (auth.role() = 'authenticated');

-- Personal Data (Restricted to owner)
CREATE POLICY "Users can view their notifications" ON notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can update their notifications" ON notificaciones FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can view their messages" ON mensajes FOR SELECT USING (auth.uid() = de OR auth.uid() = para);
CREATE POLICY "Users can insert messages" ON mensajes FOR INSERT WITH CHECK (auth.uid() = de);

-- Set up realtime for chat and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE mensajes;
ALTER PUBLICATION supabase_realtime ADD TABLE notificaciones;

-- Function to handle new user registration automatically via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol, estado)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nombre', 'user', 'activo');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on sign-up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
