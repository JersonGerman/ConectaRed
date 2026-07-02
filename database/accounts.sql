CREATE TABLE cuentas (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(150),
    rol VARCHAR(50) DEFAULT 'STUDENT'
);

ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir a los usuarios ver su propio perfil" 
ON cuentas 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Permitir a los usuarios actualizar su propio perfil" 
ON cuentas 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Permitir a los usuarios insertar su propio perfil" 
ON cuentas 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Función que crea automáticamente la fila en "cuentas"
-- cuando se registra un nuevo usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.cuentas (id, nombre_completo, rol)
  values (
    new.id,
    new.raw_user_meta_data->>'nombre_completo',
    coalesce(new.raw_user_meta_data->>'rol', 'STUDENT')
  );
  return new;
end;
$$;

-- Trigger que ejecuta la función cada vez que se crea un usuario
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();