import React, { useEffect } from 'react'

export default function App() {
  const handleDragOver = (event) => {
    event.preventDefault()
    console.debug('Container Drag over:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  const handleDrop = (event) => {
    event.preventDefault()
    console.debug('Container Drop event:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  useEffect(() => {
    const globalDropHandler = (event) => {
      console.debug('Global drop event:', {
        clientX: event.clientX,
        clientY: event.clientY,
        target: event.target,
      })
    }
    window.addEventListener('drop', globalDropHandler, true)
    return () => {
      window.removeEventListener('drop', globalDropHandler, true)
    }
  }, [])

  return (
    <div
      style={{ width: '100vw', height: '100vh', backgroundColor: '#f0f0f0' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      Drop something here...
    </div>
  )
}