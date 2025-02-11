//// filepath: /Users/ethanwright/Code_Projects/senior_thesis/senior-thesis-app/src/components/BrowserOverlay.tsx
import React, { useEffect, useState } from 'react'
import { BrowserOverlayEmitter } from '../utils/BrowserOverlayEmitter'

export function BrowserOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.url) {
        setUrl(detail.url)
        setIsOpen(true)
      }
    }

    BrowserOverlayEmitter.addEventListener('open', handleOpen)
    return () => {
      BrowserOverlayEmitter.removeEventListener('open', handleOpen)
    }
  }, [])

  const closeOverlay = () => {
    setIsOpen(false)
    setUrl('')
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '-2px 0px 5px rgba(0,0,0,0.3)',
        transition: 'opacity 0.5s ease-in-out',
        opacity: isOpen ? 1 : 0,
        zIndex: 10000,
      }}
    >
      <button
        onClick={closeOverlay}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 10001,
          padding: '8px 12px',
          border: 'none',
          borderRadius: '4px',
          background: '#333',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Close
      </button>
      <iframe
        src={url}
        title="Focused WebView"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </div>
  )
}