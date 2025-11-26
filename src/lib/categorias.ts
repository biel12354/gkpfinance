import { supabase, Categoria } from './supabase'

export async function carregarCategoriasDoBanco() {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    // Separar categorias por tipo
    const categorias = data || []
    const categoriasGanho = categorias
      .filter(c => c.tipo === 'ganho')
      .map(c => c.nome)
    
    const categoriasDespesa = categorias
      .filter(c => c.tipo === 'despesa')
      .map(c => c.nome)

    return { categoriasGanho, categoriasDespesa }
  } catch (error) {
    console.error('Erro ao carregar categorias do banco:', error)
    // Retornar categorias padrão em caso de erro
    return {
      categoriasGanho: ['Venda de Infoprodutos', 'Serviços de Consultoria', 'Outros'],
      categoriasDespesa: [
        'Gastos em Meta Ads (Facebook/Instagram)',
        'Ferramentas IA (ChatGPT, Midjourney, etc.)',
        'Áudio (Produção, trilhas, etc.)',
        'Edição (Vídeo, imagem, design)',
        'Contratação de Freelancers',
        'Outros'
      ]
    }
  }
}