'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { NegativeBalanceAlert } from '@/components/negative-balance-alert'
import { KPICards, AddTransactionDialog } from '@/components/financial-components'
import { RecentInvestments } from '@/components/recent-investments'
import { FinancialCharts } from '@/components/financial-charts'
import { Configuracoes } from '@/components/configuracoes'
import { Login } from '@/components/login'
import { supabase, Transacao } from '@/lib/supabase'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [loading, setLoading] = useState(true)

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('gkp_authenticated')
      const loginTime = localStorage.getItem('gkp_login_time')
      
      if (auth === 'true' && loginTime) {
        const loginDate = new Date(loginTime)
        const now = new Date()
        const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
        
        // Manter logado por 24 horas
        if (hoursDiff < 24) {
          setIsAuthenticated(true)
          carregarTransacoes()
        } else {
          // Limpar autenticação expirada
          localStorage.removeItem('gkp_authenticated')
          localStorage.removeItem('gkp_login_time')
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const carregarTransacoes = async () => {
    try {
      console.log('Carregando transações do Supabase...')
      
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar transações:', error)
        throw error
      }

      console.log('Transações carregadas:', data?.length || 0)
      console.log('Dados brutos:', data)
      
      // Não precisa mais filtrar por status, pois estamos usando DELETE permanente
      setTransacoes(data || [])
    } catch (error) {
      console.error('Erro completo ao carregar transações:', error)
      // Em caso de erro, não deixar o sistema sem dados
      setTransacoes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      carregarTransacoes()

      const subscription = supabase
        .channel('transacoes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transacoes' },
          (payload) => {
            console.log('Mudança detectada:', payload)
            carregarTransacoes()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    setIsAuthenticated(true)
    carregarTransacoes()
  }

  const handleLogout = () => {
    localStorage.removeItem('gkp_authenticated')
    localStorage.removeItem('gkp_login_time')
    setIsAuthenticated(false)
    setTransacoes([])
  }

  const calcularSaldos = () => {
    const ganhos = transacoes
      .filter(t => t.tipo === 'ganho')
      .reduce((sum, t) => sum + t.valor, 0)
    
    const despesas = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0)
    
    return ganhos - despesas
  }

  const saldoTotal = calcularSaldos()
  const isNegative = saldoTotal < 0

  // Mostrar tela de login se não estiver autenticado
  if (!isAuthenticated) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }
    return <Login onLogin={handleLogin} />
  }

  // Mostrar tela principal se estiver autenticado
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-black flex">
      <NegativeBalanceAlert isNegative={isNegative} />
      
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      
      <main className={`flex-1 ${isNegative ? 'pt-16' : ''}`}>
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'transacoes' && 'Transações'}
                {activeTab === 'investimentos' && 'Investimentos'}
                {activeTab === 'configuracoes' && 'Configurações'}
              </h1>
              <p className="text-gray-300 mt-1">
                {activeTab === 'dashboard' && 'Visão geral do seu financeiro'}
                {activeTab === 'transacoes' && 'Gerencie todas as suas transações'}
                {activeTab === 'investimentos' && 'Controle seus investimentos'}
                {activeTab === 'configuracoes' && 'Personalize suas categorias'}
              </p>
            </div>
            
            {(activeTab === 'dashboard' || activeTab === 'transacoes') && (
              <AddTransactionDialog onTransactionAdded={carregarTransacoes} />
            )}
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <KPICards transacoes={transacoes} />
              <FinancialCharts transacoes={transacoes} />
              <RecentInvestments 
                transacoes={transacoes} 
                onTransacoesUpdate={carregarTransacoes} 
              />
            </div>
          )}

          {activeTab === 'transacoes' && (
            <div className="space-y-8">
              <KPICards transacoes={transacoes} />
              <RecentInvestments 
                transacoes={transacoes} 
                onTransacoesUpdate={carregarTransacoes} 
              />
            </div>
          )}

          {activeTab === 'investimentos' && (
            <div className="space-y-8">
              <RecentInvestments 
                transacoes={transacoes} 
                onTransacoesUpdate={carregarTransacoes} 
              />
            </div>
          )}

          {activeTab === 'configuracoes' && (
            <Configuracoes />
          )}
        </div>
      </main>
    </div>
  )
}