'use client'

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface NegativeBalanceAlertProps {
  isNegative: boolean
}

export function NegativeBalanceAlert({ isNegative }: NegativeBalanceAlertProps) {
  if (!isNegative) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600/20 backdrop-blur-md border-b border-red-400/20">
      <div className="container mx-auto px-4 py-3">
        <Alert className="bg-red-600/10 backdrop-blur-sm border-red-400/20 text-white">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-white font-medium">
            ATENÇÃO: Saldo Total Negativo! Pratique e estude mais para reverter este quadro.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}