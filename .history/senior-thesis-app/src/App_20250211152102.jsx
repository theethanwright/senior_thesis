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
    console.debug('Drag over event:', {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransferTypes: event.dataTransfer.types,
    })
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    console.debug('Drop event received:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
    const { dataTransfer } = event

    // Log the complete dataTransfer object
    console.debug('dataTransfer:', dataTransfer)

    // Check for image files
    if (dataTransfer.files && dataTransfer.files.length > 0) {
      console.debug('Files dropped:', dataTransfer.files)
      for (let file of dataTransfer.files) {
        if (file.type.startsWith('image/')) {
          console.log('Dropped image file:', file.name, file)
          // Create an object URL for the image file
          const imageUrl = URL.createObjectURL(file)
          console.debug('Image URL created:', imageUrl)
          // Use tldraw API to add an image shape.
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
        store.createTextShape?.({
          text,
          x: event.clientX,
          y: event.clientY,
        })
      } else {
        console.debug('No image or text data found in drop event.')
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