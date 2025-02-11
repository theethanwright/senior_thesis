import React, { useRef, useEffect } from 'react'
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

  console.log('[LiveBrowser] Rendering LiveBrowser for shape:', shape)

  // Use the editor state to determine whether to show the overlay.
  const showOverlay = editor.isIn('select.idle')

  const duplicateBrowser = (clickedUrl: string | undefined) => {
    console.log('[duplicateBrowser] Called with clickedUrl:', clickedUrl)
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

    console.log('[duplicateBrowser] Creating new browser shape:', newBrowserShape)
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

    console.log('[duplicateBrowser] Creating arrow shape:', arrowShape)
    editor.createShapes([arrowShape])
  
    console.log('[duplicateBrowser] Creating bindings for shapes')
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
      console.log('[duplicateBrowser] Zooming to bounds:', shapeBounds)
      editor.zoomToBounds(shapeBounds, { animation: { duration: 200 } })
    }
  }

  useEffect(() => {
    console.log('[LiveBrowser] Mounting component and adding message event listener')
    const handleMessage = (event: MessageEvent) => {
      if (!originalIframeRef.current || event.source !== originalIframeRef.current.contentWindow) {
        return
      }
      if (event.data?.clickedLink) {
        const clickedUrl = event.data.clickedLink
        console.log("[handleMessage] User clicked on link:", clickedUrl)
        duplicateBrowser(clickedUrl)
      }
    }
  
    window.addEventListener("message", handleMessage)
    return () => {
      console.log('[LiveBrowser] Unmounting component and removing message event listener')
      window.removeEventListener("message", handleMessage)
    }
  }, [shape, editor])
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <iframe
        ref={originalIframeRef}
        src={`http://localhost:8000/proxy?url=${encodeURIComponent(shape.props.url)}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          // When the overlay is visible (editor is in select.idle), disable iframe interactions.
          pointerEvents: showOverlay ? 'none' : 'all',
        }}
        title="Live Web Page"
      />
      {/* Render the overlay only when showOverlay is true */}
      {showOverlay && (
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
    const defaultProps = {
      w: 400,
      h: 300,
      url: 'https://en.wikipedia.org/wiki/Internet',
    }
    console.log('[BrowserShapeUtil] getDefaultProps()', defaultProps)
    return defaultProps
  }

  override component(shape: BrowserShape) {
    console.log('[BrowserShapeUtil] Rendering component for shape:', shape)
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
    console.log('[BrowserShapeUtil] Rendering indicator for shape:', shape)
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}

export class BrowserShapeTool extends BaseBoxShapeTool {
  override shapeType = 'browser'
  static override id = 'browser'
  constructor() {
    super()
    console.log('[BrowserShapeTool] Instantiated Tool for BrowserShape.')
  }
}
