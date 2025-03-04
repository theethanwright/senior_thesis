import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
    useEditor,
    TLParentId,
    TLShapeId
 } from 'tldraw'
import { BrowserOverlayEmitter } from '../utils/BrowserOverlayEmitter'

// Make sure to import TLParentId if needed.
// import { TLParentId } from 'your-types-module';

export function BrowserOverlay() {
  const editor = useEditor()
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [parentShapeId, setParentShapeId] = useState<TLParentId | null>(null)
  const overlayIframeRef = useRef<HTMLIFrameElement>(null)

  // Listen for the "open" event from onDoubleClickEdge.
  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.url && detail?.parentShapeId) {
        setUrl(detail.url)
        setParentShapeId(detail.parentShapeId)
        setIsOpen(true)
      }
    }
    BrowserOverlayEmitter.addEventListener('open', handleOpen)
    return () => {
      BrowserOverlayEmitter.removeEventListener('open', handleOpen)
    }
  }, [])

  // Listen for messages from the overlay's iframe.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!overlayIframeRef.current || event.source !== overlayIframeRef.current.contentWindow) return
      if (event.data?.clickedLink) {
        const clickedUrl = event.data.clickedLink
        console.log('Overlay clicked link:', clickedUrl)
        duplicateBrowser(clickedUrl)
      }
    }
    if (isOpen) {
      window.addEventListener('message', handleMessage)
    }
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [isOpen, parentShapeId])

  const duplicateBrowser = (clickedUrl: string) => {
    if (!parentShapeId) return
    const parentShape = editor.getShape(parentShapeId)
    if (!parentShape) {
      console.error('Parent shape not found:', parentShapeId)
      return
    }
    const { x, y } = parentShape
    const { w, h } = parentShape.props as { w: number; h: number; url: string }

    const newBrowserShape = {
      id: `shape:${Date.now()}` as TLShapeId,
      type: 'browser' as const,
      props: {
        w,
        h,
        url: clickedUrl,
      },
      x: x + w + 50, // placed 50px right of the parent shape
      y: y + h / 2,  // vertically centered
      rotation: 0,
    }

    editor.createShapes([newBrowserShape])

    const { x: newX, y: newY } = newBrowserShape
    const { w: newW } = newBrowserShape.props

    const arrowShape = {
      id: `shape:${Date.now() + 1}`,
      type: 'arrow',
      props: {
        color: 'black',
        start: {
          x: x + w / 2,
          y: y + h / 2,
        },
        end: {
          x: newX + newW / 2,
          y: newY + h / 2,
        },
      },
    }

    editor.createShapes([arrowShape])

    editor.createBindings([
      {
        fromId: arrowShape.id,
        toId: parentShapeId,
        type: 'arrow',
        props: {
          terminal: 'start',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      },
      {
        fromId: arrowShape.id,
        toId: newBrowserShape.id,
        type: 'arrow',
        props: {
          terminal: 'end',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
        },
      },
    ])

    const shapeBounds = editor.getShapePageBounds(newBrowserShape.id)
    if (shapeBounds) {
      editor.zoomToBounds(shapeBounds, { animation: { duration: 200 } })
    }
    // Close the overlay after duplicating.
    closeOverlay()
  }

  const closeOverlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setIsOpen(false)
    setUrl('')
    setParentShapeId(null)
  }

  if (!isOpen) return null

  return createPortal(
    <div
      onClick={(e) => e.stopPropagation()}
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
        pointerEvents: 'all',
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
        ref={overlayIframeRef}
        src={url}
        title="Focused WebView"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          pointerEvents: 'all',
        }}
      />
    </div>,
    document.body
  )
}