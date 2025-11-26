'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit, Trash2 } from 'lucide-react'
import { supabase, Transacao } from '@/lib/supabase'
import { carregarCategoriasDoBanco } from '@/lib/categorias'

interface RecentInvestmentsProps {
  transacoes: Transacao[]
  onTransacoesUpdate: () => void
}

export function RecentInvestments({ transacoes, onTransacoesUpdate }: RecentInvestmentsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null)
  const [formData, setFormData] = useState({
    categoria: '',
    descricao: '',
    valor: ''
  })
  const [categoriasGanho, setCategoriasGanho] = useState<string[]>([])
  const [categoriasDespesa, setCategoriasDespesa] = useState<string[]>([])
  const [loadingCategorias, setLoadingCategorias] = useState(true)

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      setLoadingCategorias(true)
      const { categoriasGanho, categoriasDespesa } = await carregarCategoriasDoBanco()
      setCategoriasGanho(categoriasGanho)
      setCategoriasDespesa(categoriasDespesa)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoadingCategorias(false)
    }
  }

  const transacoesRecentes = transacoes
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10)

  const formatarMoeda = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    const centavos = numeros.slice(-2)
    const reais = numeros.slice(0, -2)
    
    if (numeros.length === 0) return ''
    
    const reaisFormatados = parseInt(reais || '0').toLocaleString('pt-BR')
    return `R$ ${reaisFormatados},${centavos.padStart(2, '0')}`
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarMoeda(e.target.value)
    setFormData(prev => ({ ...prev, valor: valorFormatado }))
  }

  const converterParaNumero = (valorFormatado: string): number => {
    const numeros = valorFormatado.replace(/\D/g, '')
    if (numeros.length === 0) return 0
    return parseInt(numeros) / 100
  }

  const handleEdit = (transacao: Transacao) => {
    setEditingTransacao(transacao)
    setFormData({
      categoria: transacao.categoria,
      descricao: transacao.descricao,
      valor: `R$ ${transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTransacao || !formData.categoria || !formData.descricao || !formData.valor) {
      alert('Preencha todos os campos')
      return
    }

    try {
      const { error } = await supabase
        .from('transacoes')
        .update({
          categoria: formData.categoria,
          descricao: formData.descricao,
          valor: converterParaNumero(formData.valor)
        })
        .eq('id', editingTransacao.id)

      if (error) throw error

      setEditDialogOpen(false)
      setEditingTransacao(null)
      onTransacoesUpdate()
    } catch (error) {
      console.error('Erro ao editar transação:', error)
      alert('Erro ao editar transação')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      console.log('Tentando DELETAR permanentemente transação ID:', id)
      
      const { data, error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)
        .select()

      if (error) {
        console.error('Erro do Supabase:', error)
        throw error
      }

      console.log('Transação DELETADA com sucesso:', data)
      
      // Forçar atualização imediata
      onTransacoesUpdate()
      
    } catch (error) {
      console.error('Erro completo ao excluir transação:', error)
    }
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'ganho' ? '📈' : '📉'
  }

  const getTipoColor = (tipo: string) => {
    return tipo === 'ganho' ? 'text-green-400' : 'text-red-400'
  }

  const categoriasAtuais = editingTransacao?.tipo === 'despesa' ? categoriasDespesa : categoriasGanho

  return (
    <>
      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            💰 Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transacoesRecentes.length === 0 ? (
            <p className="text-gray-300 dark:text-gray-400 text-center py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Data</TableHead>
                  <TableHead className="text-white">Tipo</TableHead>
                  <TableHead className="text-white">Categoria</TableHead>
                  <TableHead className="text-white">Descrição</TableHead>
                  <TableHead className="text-white text-right">Valor</TableHead>
                  <TableHead className="text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoesRecentes.map((transacao) => (
                  <TableRow key={transacao.id}>
                    <TableCell className="text-white">
                      {new Date(transacao.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getTipoColor(transacao.tipo)}`}>
                        {getTipoIcon(transacao.tipo)} {transacao.tipo === 'ganho' ? 'Ganho' : 'Despesa'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs bg-white/20 dark:bg-gray-700/20">
                        {transacao.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-white">
                      {transacao.descricao}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getTipoColor(transacao.tipo)}`}>
                      {transacao.tipo === 'ganho' ? '+' : '-'} R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transacao)}
                          className="h-8 w-8 p-0 text-white hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(transacao.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoria" className="text-sm font-medium text-white">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasAtuais.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao" className="text-sm font-medium text-white">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="valor" className="text-sm font-medium text-white">Valor (R$)</Label>
              <Input
                id="valor"
                value={formData.valor}
                onChange={handleValorChange}
                className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}