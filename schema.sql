-- Schema SQL para o GKP Finance
-- Execute este script no SQL Editor do seu projeto Supabase

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS transacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('ganho', 'despesa')),
    categoria VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(12,2) NOT NULL CHECK (valor >= 0),
    status VARCHAR(10) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'excluido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_at ON transacoes(created_at DESC);

-- Criar trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transacoes_updated_at 
    BEFORE UPDATE ON transacoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir operações no nível de linha
CREATE POLICY "Allow all operations on transacoes" ON transacoes
    FOR ALL USING (true)
    WITH CHECK (true);

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO transacoes (data, tipo, categoria, descricao, valor, status) VALUES
    (CURRENT_DATE - INTERVAL '7 days', 'despesa', 'Gastos em Meta Ads (Facebook/Instagram)', 'Campanha de Retargeting para Infoproduto X', 250.00, 'ativo'),
    (CURRENT_DATE - INTERVAL '5 days', 'despesa', 'Ferramentas IA (ChatGPT, Midjourney, etc.)', 'Assinatura Mensal do ChatGPT Plus', 35.00, 'ativo'),
    (CURRENT_DATE - INTERVAL '3 days', 'ganho', 'Venda de Infoproduto A', 'Venda do curso de Marketing Digital', 297.00, 'ativo'),
    (CURRENT_DATE - INTERVAL '2 days', 'despesa', 'Edição (Vídeo, imagem, design)', 'Edição de vídeo para propaganda', 150.00, 'ativo'),
    (CURRENT_DATE - INTERVAL '1 day', 'ganho', 'Serviços de Consultoria', 'Consultoria de 2 horas para cliente Y', 400.00, 'ativo');

-- Configurar Realtime para a tabela transacoes
ALTER PUBLICATION supabase_realtime ADD TABLE transacoes;

-- Comentários para documentação
COMMENT ON TABLE transacoes IS 'Tabela principal para armazenar todas as transações financeiras do GKP Finance';
COMMENT ON COLUMN transacoes.id IS 'Identificador único da transação (UUID)';
COMMENT ON COLUMN transacoes.data IS 'Data da transação';
COMMENT ON COLUMN transacoes.tipo IS 'Tipo da transação: ganho ou despesa';
COMMENT ON COLUMN transacoes.categoria IS 'Categoria da transação (ex: Meta Ads, Ferramentas IA, etc.)';
COMMENT ON COLUMN transacoes.descricao IS 'Descrição detalhada da transação';
COMMENT ON COLUMN transacoes.valor IS 'Valor da transação em reais (R$)';
COMMENT ON COLUMN transacoes.status IS 'Status da transação: ativo ou excluido (soft delete)';
COMMENT ON COLUMN transacoes.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN transacoes.updated_at IS 'Data e hora da última atualização do registro';