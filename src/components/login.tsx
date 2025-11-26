'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

interface LoginProps {
  onLogin: () => void
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(false)

    // Simulação de delay para melhor UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Validação simples
    if (username === 'admin' && password === 'Gbfernandesrj12*') {
      // Salvar apenas no localStorage (não no Supabase)
      localStorage.setItem('gkp_authenticated', 'true')
      localStorage.setItem('gkp_login_time', new Date().toISOString())
      onLogin()
    } else {
      setError('Usuário ou senha incorretos')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Vídeo de Fundo */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          style={{ filter: 'brightness(0.3)' }}
        >
          <source src="https://i.imgur.com/mU8Giun.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-md relative z-20">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white">GKP</h1>
            <p className="text-lg text-gray-300">Finance</p>
          </div>
          <p className="text-sm text-gray-400">
            Sistema de Controle Financeiro
          </p>
        </div>

        <Card className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-white">
              Acesso ao Sistema
            </CardTitle>
            <p className="text-sm text-gray-300">
              Entre com suas credenciais para continuar
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de Usuário */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-white">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="pl-10 h-11 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
              </div>

              {/* Campo de Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 h-11 bg-white/10 dark:bg-gray-700/10 backdrop-blur-sm border-white/20 dark:border-gray-600/20 text-white placeholder:text-white/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-white/70 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <Alert className="border-red-200/50 bg-red-500/20 dark:border-red-800/50 dark:bg-red-900/20 backdrop-blur-sm">
                  <AlertDescription className="text-red-100 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botão de Entrar */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium backdrop-blur-sm"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 GKP Finance. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}