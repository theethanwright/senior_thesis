import React, { useEffect } from 'react'
import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'
import { BrowserShapeTool, BrowserShapeUtil } from './customElements/WebBrowser'
import { SearchShapeTool, SearchShapeUtil } from './customElements/TopicDecleration'
import { components, uiOverrides } from './customElements/ui'

const customShapes = [BrowserShapeUtil, SearchShapeUtil]
const customTools = [BrowserShapeTool, SearchShapeTool]

export default function App() {
  const store = useSyncDemo({ roomId: '1-sefgr', shapeUtils: customShapes })

  const handleDragOver = (event) => {
    event.preventDefault()
    console.debug('Drag over event:', {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransferTypes: event.dataTransfer.types,
    })
  }

  const handleDragEnter = (event) => {
    console.debug('Drag enter event:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

  const handleDropCapture = (event) => {
    console.debug('Drop capture fired:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
  }

// inside your component that wraps <Tldraw ... />
React.useEffect(() => {
  const handleDrop = (event) => {
    // Prevent the browser’s default behavior (e.g. opening the file)
    event.preventDefault();
    // Check if text data is present
    const text = event.dataTransfer.getData("text/plain");
    if (text) {
      // Convert drop coordinates from page to editor coordinates as needed.
      // Then, use the TLDraw API to create a text shape.
      editor.createShape({
        type: "text",
        x: dropX,
        y: dropY,
        props: {
          text,
          // other text props like font size, color, etc.
        },
      });
    }
  };

  const element = document.querySelector(".tldraw__canvas");
  element?.addEventListener("drop", handleDrop);
  return () => element?.removeEventListener("drop", handleDrop);
}, [editor]);


  useEffect(() => {
    const globalDropHandler = (event) => {
      console.debug('Global drop event detected:', {
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
      style={{ position: 'fixed', inset: 0 }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDropCapture={handleDropCapture}
      onDrop={handleDrop}
    >
      <Tldraw
        persistenceKey="example"
        store={store}
        shapeUtils={customShapes}
        tools={customTools}
        overrides={uiOverrides}
        components={components}
        deepLinks
      />
    </div>
  )
}