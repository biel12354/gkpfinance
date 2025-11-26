'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Plus,
  History,
  BarChart3,
  Settings,
  Moon,
  Sun,
  LogOut
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export function Sidebar({ activeTab, onTabChange, onLogout }: SidebarProps) {
  const { theme, setTheme } = useTheme()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transacoes', label: 'Transações', icon: DollarSign },
    { id: 'investimentos', label: 'Investimentos', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-r border-white/20 dark:border-gray-700/20 h-screen flex flex-col">
      <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">GKP</h1>
            <p className="text-sm text-gray-300">Finance</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 text-white hover:text-white hover:bg-white/10"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === item.id 
                    ? 'bg-blue-600/80 text-white hover:bg-blue-700/80 backdrop-blur-sm' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/20 dark:border-gray-700/20">
        <Button 
          variant="ghost" 
          onClick={onLogout}
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-white/10 backdrop-blur-sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}