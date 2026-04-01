'use client'

import { ReactNode, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#2d3748] border border-gray-600 rounded shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-800 px-4 py-2.5 flex items-center justify-between sticky top-0">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
