'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { supabase, Transacao } from '@/lib/supabase'
import { carregarCategoriasDoBanco } from '@/lib/categorias'

interface KPICardsProps {
  transacoes: Transacao[]
}

export function KPICards({ transacoes }: KPICardsProps) {
  const calcularSaldos = () => {
    const ganhos = transacoes
      .filter(t => t.tipo === 'ganho')
      .reduce((sum, t) => sum + t.valor, 0)
    
    const despesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0)
    
    const saldoTotal = ganhos - despesas
    const roi = despesas > 0 ? ((ganhos - despesas) / despesas) * 100 : 0

    return { saldoTotal, totalInvestimentos: despesas, roi }
  }

  const { saldoTotal, totalInvestimentos, roi } = calcularSaldos()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Saldo Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Total Investido
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">
            R$ {totalInvestimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            ROI
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {roi.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AddTransactionDialogProps {
  onTransactionAdded: () => void
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState<'ganho' | 'despesa'>('despesa')
  const [categoria, setCategoria] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
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
    setValor(valorFormatado)
  }

  const converterParaNumero = (valorFormatado: string): number => {
    const numeros = valorFormatado.replace(/\D/g, '')
    if (numeros.length === 0) return 0
    return parseInt(numeros) / 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoria || !descricao || !valor) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const { error } = await supabase
        .from('transacoes')
        .insert({
          data: new Date().toISOString().split('T')[0],
          tipo,
          categoria,
          descricao,
          valor: converterParaNumero(valor),
          status: 'ativo'
        })

      if (error) throw error

      setCategoria('')
      setDescricao('')
      setValor('')
      setOpen(false)
      onTransactionAdded()
    } catch (error) {
      console.error('Erro ao adicionar transação:', error)
      alert('Erro ao adicionar transação')
    }
  }

  const categoriasAtuais = tipo === 'ganho' ? categoriasGanho : categoriasDespesa

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20">
        <DialogHeader>
          <DialogTitle className="text-white">Adicionar Nova Transação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tipo" className="text-sm font-medium text-white">Tipo de Transação</Label>
            <Select value={tipo} onValueChange={(value: 'ganho' | 'despesa') => setTipo(value)}>
              <SelectTrigger className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ganho">Ganho (Receita)</SelectItem>
                <SelectItem value="despesa">Despesa (Investimento)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="categoria" className="text-sm font-medium text-white">Categoria</Label>
            {loadingCategorias ? (
              <Select disabled>
                <SelectTrigger className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white">
                  <SelectValue placeholder="Carregando categorias..." />
                </SelectTrigger>
              </Select>
            ) : (
              <Select value={categoria} onValueChange={setCategoria}>
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
            )}
          </div>

          <div>
            <Label htmlFor="descricao" className="text-sm font-medium text-white">Descrição Detalhada</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva detalhadamente a transação..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div>
            <Label htmlFor="valor" className="text-sm font-medium text-white">Valor (R$)</Label>
            <Input
              id="valor"
              placeholder="R$ 0,00"
              value={valor}
              onChange={handleValorChange}
              className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium backdrop-blur-sm">
            Adicionar Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}