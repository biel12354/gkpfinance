-- Schema SQL Simplificado para o GKP Finance
-- Execute este script no SQL Editor do seu projeto Supabase
-- Este script corrige problemas de permissão

-- 1. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow all operations on transacoes" ON transacoes;

-- 2. Desabilitar RLS temporariamente para testar
ALTER TABLE transacoes DISABLE ROW LEVEL SECURITY;

-- 3. Criar política mais simples e permissiva
CREATE POLICY "Enable all operations for all users" ON transacoes
    FOR ALL USING (true)
    WITH CHECK (true);

-- 4. Reabilitar RLS
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se a publicação realtime existe
-- Se não existir, criar uma nova
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transacoes') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE transacoes;
    END IF;
END
$$;

-- 6. Testar permissões com uma query simples
SELECT 'Permissões verificadas' as status;

-- 7. Mostrar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transacoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;