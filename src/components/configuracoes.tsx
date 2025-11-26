'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Trash2, Settings, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Categoria {
  id: string
  nome: string
  tipo: 'ganho' | 'despesa'
  created_at: string
}

export function Configuracoes() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [tipoCategoria, setTipoCategoria] = useState<'ganho' | 'despesa'>('despesa')
  const [editando, setEditando] = useState<string | null>(null)
  const [categoriaEditada, setCategoriaEditada] = useState('')

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarCategoria = async () => {
    if (!novaCategoria.trim()) {
      alert('Digite o nome da categoria')
      return
    }

    try {
      const { error } = await supabase
        .from('categorias')
        .insert({
          nome: novaCategoria.trim(),
          tipo: tipoCategoria
        })

      if (error) throw error

      setNovaCategoria('')
      carregarCategorias()
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
      alert('Erro ao adicionar categoria')
    }
  }

  const excluirCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

      if (error) throw error

      carregarCategorias()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      alert('Erro ao excluir categoria')
    }
  }

  const iniciarEdicao = (categoria: Categoria) => {
    setEditando(categoria.id)
    setCategoriaEditada(categoria.nome)
  }

  const salvarEdicao = async (id: string) => {
    if (!categoriaEditada.trim()) {
      alert('Digite o nome da categoria')
      return
    }

    try {
      const { error } = await supabase
        .from('categorias')
        .update({ nome: categoriaEditada.trim() })
        .eq('id', id)

      if (error) throw error

      setEditando(null)
      setCategoriaEditada('')
      carregarCategorias()
    } catch (error) {
      console.error('Erro ao editar categoria:', error)
      alert('Erro ao editar categoria')
    }
  }

  const cancelarEdicao = () => {
    setEditando(null)
    setCategoriaEditada('')
  }

  const categoriasGanho = categorias.filter(c => c.tipo === 'ganho')
  const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5 text-blue-400" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adicionar Nova Categoria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Adicionar Nova Categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nome" className="text-white">Nome da Categoria</Label>
                <Input
                  id="nome"
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value)}
                  placeholder="Ex: Hospedagem de Sites"
                  className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <Label htmlFor="tipo" className="text-white">Tipo</Label>
                <Select value={tipoCategoria} onValueChange={(value: 'ganho' | 'despesa') => setTipoCategoria(value)}>
                  <SelectTrigger className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20">
                    <SelectItem value="ganho">Ganho</SelectItem>
                    <SelectItem value="despesa">Despesa (Investimento)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={adicionarCategoria} className="w-full bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Categoria
                </Button>
              </div>
            </div>
          </div>

          {/* Categorias de Ganhos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-400">Categorias de Ganhos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoriasGanho.map((categoria) => (
                <div key={categoria.id} className="flex items-center justify-between p-3 bg-green-500/10 dark:bg-green-900/10 backdrop-blur-sm border border-green-400/20 dark:border-green-600/20 rounded-lg">
                  {editando === categoria.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={categoriaEditada}
                        onChange={(e) => setCategoriaEditada(e.target.value)}
                        className="flex-1 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => salvarEdicao(categoria.id)} className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelarEdicao} className="h-8 px-2 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20">
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-sm bg-green-500/20 text-green-300 border-green-400/30">
                        {categoria.nome}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => iniciarEdicao(categoria)}
                          className="h-8 w-8 p-0 text-white hover:bg-white/10"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Excluir Categoria</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Tem certeza que deseja excluir a categoria "{categoria.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => excluirCategoria(categoria.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categoriasGanho.length === 0 && (
                <p className="text-gray-300 col-span-full text-center py-4">
                  Nenhuma categoria de ganhos cadastrada
                </p>
              )}
            </div>
          </div>

          {/* Categorias de Despesas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400">Categorias de Despesas (Investimentos)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categoriasDespesa.map((categoria) => (
                <div key={categoria.id} className="flex items-center justify-between p-3 bg-red-500/10 dark:bg-red-900/10 backdrop-blur-sm border border-red-400/20 dark:border-red-600/20 rounded-lg">
                  {editando === categoria.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={categoriaEditada}
                        onChange={(e) => setCategoriaEditada(e.target.value)}
                        className="flex-1 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => salvarEdicao(categoria.id)} className="h-8 px-2 bg-red-600 hover:bg-red-700 text-white">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelarEdicao} className="h-8 px-2 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20">
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-sm bg-red-500/20 text-red-300 border-red-400/30">
                        {categoria.nome}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => iniciarEdicao(categoria)}
                          className="h-8 w-8 p-0 text-white hover:bg-white/10"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Excluir Categoria</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Tem certeza que deseja excluir a categoria "{categoria.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white hover:bg-white/20">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => excluirCategoria(categoria.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {categoriasDespesa.length === 0 && (
                <p className="text-gray-300 col-span-full text-center py-4">
                  Nenhuma categoria de despesas cadastrada
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}