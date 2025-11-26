'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Transacao } from '@/lib/supabase'

interface FinancialChartsProps {
  transacoes: Transacao[]
}

export function FinancialCharts({ transacoes }: FinancialChartsProps) {
  const despesasPorCategoria = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => {
      acc[t.categoria] = (acc[t.categoria] || 0) + t.valor
      return acc
    }, {} as Record<string, number>)

  const pieData = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
    name: categoria.length > 20 ? categoria.substring(0, 20) + '...' : categoria,
    value: valor
  }))

  const saldoPorMes = transacoes
    .reduce((acc, t) => {
      const mes = new Date(t.data).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      if (!acc[mes]) {
        acc[mes] = { ganhos: 0, despesas: 0 }
      }
      if (t.tipo === 'ganho') {
        acc[mes].ganhos += t.valor
      } else {
        acc[mes].despesas += t.valor
      }
      return acc
    }, {} as Record<string, { ganhos: number; despesas: number }>)

  const lineData = Object.entries(saldoPorMes)
    .map(([mes, valores]) => ({
      mes,
      ganhos: valores.ganhos,
      despesas: valores.despesas,
      saldo: valores.ganhos - valores.despesas
    }))
    .sort((a, b) => {
      const dateA = new Date(a.mes)
      const dateB = new Date(b.mes)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-6)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md p-3 border border-white/20 dark:border-gray-700/20 rounded-lg shadow-lg">
          <p className="font-medium text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-white">
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Distribuição de Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-300">
              Nenhuma despesa registrada
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white">Evolução do Saldo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {lineData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-300">
              Nenhum dado histórico
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff/20" />
                <XAxis dataKey="mes" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ganhos" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Ganhos"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Despesas"
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Saldo"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}