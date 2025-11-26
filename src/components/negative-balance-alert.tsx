'use client'

import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, X } from 'lucide-react'

interface NegativeBalanceAlertProps {
  isNegative: boolean
}

export function NegativeBalanceAlert({ isNegative }: NegativeBalanceAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isNegative) {
      setIsVisible(false)
      return
    }

    const checkAlertStatus = () => {
      const dismissedAt = localStorage.getItem('negative_balance_dismissed_at')
      
      if (!dismissedAt) {
        setIsVisible(true)
        return
      }

      const dismissedTime = new Date(dismissedAt).getTime()
      const now = new Date().getTime()
      const twelveHoursInMs = 12 * 60 * 60 * 1000 // 12 horas em milissegundos
      
      if (now - dismissedTime >= twelveHoursInMs) {
        setIsVisible(true)
        localStorage.removeItem('negative_balance_dismissed_at')
      } else {
        setIsVisible(false)
      }
    }

    checkAlertStatus()
    
    // Verificar a cada minuto para garantir que o alerta apareça após 12 horas
    const interval = setInterval(checkAlertStatus, 60000)
    
    return () => clearInterval(interval)
  }, [isNegative])

  const handleDismiss = () => {
    const now = new Date().toISOString()
    localStorage.setItem('negative_balance_dismissed_at', now)
    setIsVisible(false)
  }

  if (!isNegative || !isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600/20 backdrop-blur-md border-b border-red-400/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Alert className="bg-red-600/10 backdrop-blur-sm border-red-400/20 text-white flex-1">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <AlertDescription className="text-white font-medium ml-2">
              ATENÇÃO: Saldo Total Negativo! Pratique e estude mais para reverter este quadra.
            </AlertDescription>
          </Alert>
          <button
            onClick={handleDismiss}
            className="ml-4 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Fechar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}