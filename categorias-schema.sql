-- Schema SQL para Tabela de Categorias
-- Execute este script no SQL Editor do seu projeto Supabase

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ganho', 'despesa')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);

-- Criar trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER update_categorias_updated_at 
    BEFORE UPDATE ON categorias 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir operações no nível de linha
CREATE POLICY "Enable all operations on categorias" ON categorias
    FOR ALL USING (true)
    WITH CHECK (true);

-- Configurar Realtime para a tabela categorias
ALTER PUBLICATION supabase_realtime ADD TABLE categorias;

-- Inserir categorias padrão
INSERT INTO categorias (nome, tipo) VALUES
-- Categorias de Despesa
('Gastos em Meta Ads (Facebook/Instagram)', 'despesa'),
('Ferramentas IA (ChatGPT, Midjourney, etc.)', 'despesa'),
('Áudio (Produção, trilhas, etc.)', 'despesa'),
('Edição (Vídeo, imagem, design)', 'despesa'),
('Contratação de Freelancers', 'despesa'),
('Outros', 'despesa'),
-- Categorias de Ganho
('Venda de Infoprodutos', 'ganho'),
('Serviços de Consultoria', 'ganho'),
('Outros', 'ganho')
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE categorias IS 'Tabela para armazenar categorias personalizadas de transações';
COMMENT ON COLUMN categorias.id IS 'Identificador único da categoria (UUID)';
COMMENT ON COLUMN categorias.nome IS 'Nome da categoria';
COMMENT ON COLUMN categorias.tipo IS 'Tipo da categoria: ganho ou despesa';
COMMENT ON COLUMN categorias.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN categorias.updated_at IS 'Data e hora da última atualização do registro';

-- Mostrar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'categorias' 
AND table_schema = 'public'
ORDER BY ordinal_position;