import React from 'react'
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
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    const { dataTransfer } = event

    // Check for image files
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      for (let file of dataTransfer.files) {
        if (file.type.startsWith('image/')) {
          console.log('Dropped image:', file)
          // Create an object URL for the image file
          const imageUrl = URL.createObjectURL(file)
          // Use tldraw API to add an image shape.
          // Assuming store.createImageShape is a function you implement
          store.createImageShape?.({
            src: imageUrl,
            x: event.clientX,
            y: event.clientY,
          })
        }
      }
    } else {
      // Handle dragged text (e.g., from another website)
      const text = dataTransfer.getData('text')
      if (text) {
        console.log('Dropped text:', text)
        // Use tldraw API to add a text shape.
        // Assuming store.createTextShape is a function you implement
        store.createTextShape?.({
          text,
          x: event.clientX,
          y: event.clientY,
        })
      }
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0 }}
      onDragOver={handleDragOver}
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