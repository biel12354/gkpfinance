-- Schema SQL Atualizado para DELETE Permanente
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Enable all operations for all users" ON transacoes;

-- 2. Remover campo status (opcional - se quiser limpar a tabela)
-- ATENÇÃO: Isso vai remover todas as transações existentes!
-- Se quiser manter os dados, comente a linha abaixo
-- TRUNCATE TABLE transacoes;

-- 3. Remover coluna status (opcional)
-- ALTER TABLE transacoes DROP COLUMN IF EXISTS status;

-- 4. Criar política simples para DELETE
CREATE POLICY "Enable all operations for all users" ON transacoes
    FOR ALL USING (true)
    WITH CHECK (true);

-- 5. Garantir que RLS está habilitado
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- 6. Verificar se a publicação realtime existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transacoes') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE transacoes;
    END IF;
END
$$;

-- 7. Inserir dados de teste (se a tabela estiver vazia)
INSERT INTO transacoes (data, tipo, categoria, descricao, valor) 
SELECT 
    CURRENT_DATE - INTERVAL '7 days', 
    'despesa', 
    'Gastos em Meta Ads (Facebook/Instagram)', 
    'Campanha de Retargeting para Infoproduto X', 
    250.00
WHERE NOT EXISTS (SELECT 1 FROM transacoes LIMIT 1);

INSERT INTO transacoes (data, tipo, categoria, descricao, valor) 
SELECT 
    CURRENT_DATE - INTERVAL '5 days', 
    'despesa', 
    'Ferramentas IA (ChatGPT, Midjourney, etc.)', 
    'Assinatura Mensal do ChatGPT Plus', 
    35.00
WHERE (SELECT COUNT(*) FROM transacoes) = 1;

INSERT INTO transacoes (data, tipo, categoria, descricao, valor) 
SELECT 
    CURRENT_DATE - INTERVAL '3 days', 
    'ganho', 
    'Venda de Infoproduto A', 
    'Venda do curso de Marketing Digital', 
    297.00
WHERE (SELECT COUNT(*) FROM transacoes) = 2;

-- 8. Testar permissões com uma query simples
SELECT 'Schema atualizado para DELETE permanente' as status;

-- 9. Mostrar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transacoes' 
AND table_schema = 'public'
ORDER BY ordinal_position;