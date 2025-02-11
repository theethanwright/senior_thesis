import React, { useRef, useEffect, useState } from 'react'
import {
  BaseBoxShapeTool,
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
  useEditor,
  TLShapeId,
} from 'tldraw'

type BrowserShape = TLBaseShape<'browser', { w: number; h: number; url: string }>;

export function LiveBrowser({ shape }: { shape: BrowserShape }) {
  const originalIframeRef = useRef<HTMLIFrameElement>(null)
  const editor = useEditor()
  
  // Define showOverlay state. Here we initialize it based on whether editor is in 'select.idle'
  const [showOverlay, setShowOverlay] = useState<boolean>(!editor.isIn('select.idle'))

  const duplicateBrowser = (clickedUrl: string | undefined) => {
    if (typeof clickedUrl !== 'string' || !clickedUrl) {
      console.error("Invalid clickedUrl received:", clickedUrl)
      return
    }
  
    const { x, y } = shape
    const { w, h } = shape.props
    const newBrowserShape = {
      id: `shape:${Date.now()}` as TLShapeId,
      type: 'browser' as const,
      props: {
        w,
        h,
        url: clickedUrl,
      },
      x: x + w + 50,
      y: y + h / 2,
      rotation: 0,
    }
  
    editor.createShapes([newBrowserShape])
  
    const { x: newX, y: newY } = newBrowserShape
    const { w: newW } = newBrowserShape.props
    
    const arrowShape = {
      id: `shape:${Date.now() + 1}` as TLShapeId,
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
        toId: shape.id,
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
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!originalIframeRef.current || event.source !== originalIframeRef.current.contentWindow) {
        return
      }
      if (event.data?.clickedLink) {
        const clickedUrl = event.data.clickedLink
        console.log("User clicked on link:", clickedUrl)
        duplicateBrowser(clickedUrl)
      }
    }
  
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [shape])

  useEffect(() => {
    // Locate the TLDraw workspace container element. Adjust the selector if needed.
    const tlDrawContainer = document.querySelector('.tl-container')
    if (!tlDrawContainer) {
      console.warn('TLDraw container not found')
      return
    }

    const clickActivate = (e: MouseEvent) => {
      const isSelected = editor.getSelectedShapeIds().includes(shape.id)
      const isInSelectIdle = editor.isIn('select.idle')
      const newShowOverlay = isInSelectIdle && isSelected
      setShowOverlay(newShowOverlay)
      console.log('Clicked:', e, { isSelected, isInSelectIdle, showOverlay: newShowOverlay })
    }

    tlDrawContainer.addEventListener('click', clickActivate)
    return () => {
      tlDrawContainer.removeEventListener('click', clickActivate)
    }
  }, [editor, shape])

  useEffect(() => {
    const tlDrawContainer = document.querySelector('.tl-container')
    if (!tlDrawContainer) {
      console.warn('TLDraw container not found')
      return
    }

    const zoomIn = (e: MouseEvent) => {
      const selectedShape = editor.getSelectedShapeIds()
      console.log('Selected shape:', selectedShape)
      const shapeBounds = editor.getShapePageBounds(selectedShape)
      editor.zoomToBounds(shapeBounds, { animation: { duration: 200 } })
    }
    console.log('Zooming in on double click')
    tlDrawContainer.addEventListener('dblclick', zoomIn)
    return () => {
      tlDrawContainer.removeEventListener('dblclick', zoomIn)
    }
  }, [editor, shape])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        ref={originalIframeRef}
        src={`http://localhost:8000/proxy?url=${encodeURIComponent(shape.props.url)}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          // Use pointerEvents based on showOverlay
          pointerEvents: showOverlay ? 'all' : 'none',
        }}
        title="Live Web Page"
      />
      {/* Render the overlay only when showOverlay is false */}
      {!showOverlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            background: 'rgba(0,0,0,0.1)',
            cursor: 'default',
            pointerEvents: 'auto',
          }}
        />
      )}
    </div>
  )
}

export class BrowserShapeUtil extends BaseBoxShapeUtil<BrowserShape> {
  static override type = 'browser' as const
  static override props = {
    w: T.positiveNumber,
    h: T.positiveNumber,
    url: T.string,
  }

  override getDefaultProps() {
    return {
      w: 400,
      h: 300,
      url: 'https://en.wikipedia.org/wiki/Internet',
    }
  }

  override component(shape: BrowserShape) {
    return (
      <HTMLContainer
        style={{
          pointerEvents: 'all',
          background: '#efefef',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          width: '100%',
          height: '100%',
        }}
      >
        <LiveBrowser shape={shape} />
      </HTMLContainer>
    )
  }

  override indicator(shape: BrowserShape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}

export class BrowserShapeTool extends BaseBoxShapeTool {
  override shapeType = 'browser'
  static override id = 'browser'
}
