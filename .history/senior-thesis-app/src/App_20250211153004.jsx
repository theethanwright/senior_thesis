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
    console.debug('Container Drag over:', {
      clientX: event.clientX,
      clientY: event.clientY,
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

  const handleDrop = async (event) => {
    event.preventDefault()
    console.debug('Container Drop event:', {
      clientX: event.clientX,
      clientY: event.clientY,
    })
    const { dataTransfer } = event
    console.debug('dataTransfer:', dataTransfer)

    if (dataTransfer.files && dataTransfer.files.length > 0) {
      console.debug('Files dropped:', dataTransfer.files)
      for (let file of dataTransfer.files) {
        if (file.type.startsWith('image/')) {
          console.log('Dropped image file:', file.name, file)
          const imageUrl = URL.createObjectURL(file)
          console.debug('Image URL created:', imageUrl)
          store.createImageShape?.({
            src: imageUrl,
            x: event.clientX,
            y: event.clientY,
          })
        }
      }
    } else {
      const text = dataTransfer.getData('text')
      if (text) {
        console.log('Dropped text:', text)
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
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#f0f0f0' }}
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