//// filepath: /Users/ethanwright/Code_Projects/senior_thesis/senior-thesis-app/src/CustomUiExample.tsx
import React from 'react'
import { Tldraw, track } from 'tldraw'
import 'tldraw/tldraw.css'
import './custom-ui.css'
import { BrowserOverlay } from './customElements/BrowserOverlay'

export default function CustomUiExample() {
  return (
    <div className="tldraw__editor">
      <Tldraw hideUi>
        <CustomUi />
        <BrowserOverlay />
      </Tldraw>
    </div>
  )
}

const CustomUi = track(() => {
  // ...existing custom UI code...
  return (
    <div className="custom-layout">
      <div className="custom-toolbar">
        <button
          className="custom-button"
          data-isactive
          onClick={() => {}}
        >
          Select
        </button>
        <button
          className="custom-button"
          data-isactive
          onClick={() => {}}
        >
          Pencil
        </button>
        <button
          className="custom-button"
          data-isactive
          onClick={() => {}}
        >
          Eraser
        </button>
      </div>
    </div>
  )
})