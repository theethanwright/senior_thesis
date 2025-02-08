import React, { useState, useRef, useEffect } from 'react'
import {
  BaseBoxShapeTool,
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
  useEditor,
  TLShapeId,
  getArrowBindings,
} from 'tldraw'

type BrowserShape = TLBaseShape<'browser', { w: number; h: number; url: string }>;

export function LiveBrowser({ shape }: { shape: BrowserShape }) {
  const originalIframeRef = useRef<HTMLIFrameElement>(null);
  const editor = useEditor();
  
  const duplicateBrowser = (clickedUrl: string | undefined) => {
    if (typeof clickedUrl !== 'string' || !clickedUrl) {
      console.error("Invalid clickedUrl received:", clickedUrl);
      return;
    }
  
    const { x, y } = shape;
    const { w, h } = shape.props;
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
    };
  
    // Create the new browser shape.
    editor.createShapes([newBrowserShape]);

    const { x: newX, y: newY } = newBrowserShape;
    const { w: newW, h: newH } = newBrowserShape.props;
  
    // Create the arrow shape without binding properties.
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
    };
  
    // Create all records together.
    editor.createShapes([arrowShape]);

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
    ]);

    // Zoom to the new shape.
    const shapeBounds = editor.getShapePageBounds(newBrowserShape.id);
    if (shapeBounds) {
      editor.zoomToBounds(shapeBounds, { animation: { duration: 1000 } });
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
    // Only process messages coming from this component's iframe.
    if (!originalIframeRef.current || event.source !== originalIframeRef.current.contentWindow) {
      return;
    }
      if (event.data?.clickedLink) {
        const clickedUrl = event.data.clickedLink;
        console.log("User clicked on link:", clickedUrl);
        duplicateBrowser(clickedUrl);
      }
    };
  
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [shape]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <iframe
        ref={originalIframeRef}
        src={`http://localhost:8000/proxy?url=${encodeURIComponent(shape.props.url)}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Live Web Page"
      />
    </div>
  )
}

export class BrowserShapeUtil extends BaseBoxShapeUtil<BrowserShape> {
    static override type = 'browser' as const
    static override props = {
      w: T.positiveNumber,
      h: T.positiveNumber,
      url: T.string,
      // Remove point from here since that belongs on the shape's top level.
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
