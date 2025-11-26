'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, Transacao } from '@/lib/supabase'

export function SupabaseDiagnostic() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [tableData, setTableData] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking')
      
      // Testar conexão básica
      const { data: testData, error: testError } = await supabase
        .from('transacoes')
        .select('count')
        .limit(1)

      if (testError) {
        throw testError
      }

      // Carregar dados completos
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      setTableData(data || [])
      setConnectionStatus('connected')
      setError('')
    } catch (err: any) {
      console.error('Erro no diagnóstico:', err)
      setConnectionStatus('error')
      setError(err.message || 'Erro desconhecido')
    }
  }

  const testUpdate = async () => {
    if (tableData.length === 0) {
      alert('Nenhuma transação para testar')
      return
    }

    try {
      const firstId = tableData[0].id
      console.log('Testando UPDATE com ID:', firstId)
      
      const { data, error } = await supabase
        .from('transacoes')
        .update({ 
          status: 'excluido',
          updated_at: new Date().toISOString()
        })
        .eq('id', firstId)
        .select()

      if (error) {
        console.error('Erro no update:', error)
        throw error
      }

      console.log('Update bem-sucedido:', data)
      alert('Update testado com sucesso!')
      checkConnection() // Recarregar dados
    } catch (err: any) {
      console.error('Erro no teste de update:', err)
      alert(`Erro no update: ${err.message}`)
    }
  }

  const testDelete = async () => {
    if (tableData.length === 0) {
      alert('Nenhuma transação para testar DELETE')
      return
    }

    try {
      const firstId = tableData[0].id
      console.log('Testando DELETE permanente com ID:', firstId)
      
      const { data, error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', firstId)
        .select()

      if (error) {
        console.error('Erro no DELETE:', error)
        throw error
      }

      console.log('DELETE bem-sucedido:', data)
      alert('DELETE testado com sucesso! Transação removida permanentemente.')
      checkConnection() // Recarregar dados
    } catch (err: any) {
      console.error('Erro no teste de DELETE:', err)
      alert(`Erro no DELETE: ${err.message}`)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'checking':
        return <Badge variant="secondary">Verificando...</Badge>
      case 'connected':
        return <Badge className="bg-green-600">Conectado</Badge>
      case 'error':
        return <Badge variant="destructive">Erro</Badge>
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Diagnóstico do Supabase
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 font-medium">Erro detectado:</p>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium">URL do Projeto:</p>
          <code className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded block">
            https://eebynrxnzrvkfibcyjuq.supabase.co
          </code>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Status da Tabela:</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tableData.length} transações encontradas
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Dados Recentes:</p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {tableData.map((item) => (
              <div key={item.id} className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div>ID: {item.id}</div>
                <div>Status: {item.status}</div>
                <div>Valor: R$ {item.valor}</div>
                <div>Updated: {item.updated_at}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={checkConnection} variant="outline" size="sm">
            Verificar Conexão
          </Button>
          <Button onClick={testUpdate} variant="outline" size="sm">
            Testar Update
          </Button>
          <Button onClick={testDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            Testar DELETE
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}