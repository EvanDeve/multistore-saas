'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Product } from '@/lib/supabase'

export interface CartItem {
  id: string
  name: string
  price: number
  compare_price: number | null
  image_url: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('multistore_cart')
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (e) {
      console.error('Failed to parse cart', e)
    }
    setIsLoaded(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('multistore_cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id)
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          compare_price: product.compare_price,
          image_url: product.image_url,
          quantity,
        },
      ]
    })
    setIsCartOpen(true)
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(currentItems => currentItems.filter(item => item.id !== productId))
      return
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
