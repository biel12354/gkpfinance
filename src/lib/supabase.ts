import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eebynrxnzrvkfibcyjuq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlYnlucnhuenJ2a2ZpYmN5anVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMTY2MjgsImV4cCI6MjA3OTY5MjYyOH0.CupWYmclltHZhWkfsmLKSH123y0LXkMsxSZXEh0GOt8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Transacao {
  id: string
  data: string
  tipo: 'ganho' | 'despesa'
  categoria: string
  descricao: string
  valor: number
  status: 'ativo' | 'excluido'
  created_at: string
}

export interface Categoria {
  id: string
  nome: string
  tipo: 'ganho' | 'despesa'
  created_at: string
}

export const CATEGORIAS_DESPESA = [
  'Gastos em Meta Ads (Facebook/Instagram)',
  'Ferramentas IA (ChatGPT, Midjourney, etc.)',
  'Áudio (Produção, trilhas, etc.)',
  'Edição (Vídeo, imagem, design)',
  'Contratação de Freelancers',
  'Outros'
]

export const CATEGORIAS_GANHO = [
  'Venda de Infoprodutos',
  'Serviços de Consultoria',
  'Outros'
]