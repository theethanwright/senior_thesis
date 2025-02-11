import React, { useState } from 'react'
import { BaseBoxShapeUtil, HTMLContainer, RecordProps, T, TLBaseShape } from 'tldraw'

// Google API constants (replace with your own values)
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const GOOGLE_CX = 'YOUR_SEARCH_ENGINE_ID';

// Define the shape type with desired properties
type IGoogleSearchShape = TLBaseShape<
  'google-search-shape',
  {
    w: number;
    h: number;
    text: string; // The search query input
  }
>

// Custom shape class
export class GoogleSearchShape extends BaseBoxShapeUtil<IGoogleSearchShape> {
  static override type = 'google-search-shape' as const;

  static override props: RecordProps<IGoogleSearchShape> = {
    w: T.number,
    h: T.number,
    text: T.string,
  };

  getDefaultProps(): IGoogleSearchShape['props'] {
    return {
      w: 300,
      h: 100,
      text: '',
    }
  }

  // Use a separate functional component to handle the UI
  component(shape: IGoogleSearchShape) {
    return <GoogleSearchComponent shape={shape} editor={this.editor} />;
  }

  // Simple selection indicator
  indicator(shape: IGoogleSearchShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}

// Functional component for the search UI
function GoogleSearchComponent({
  shape,
  editor,
}: {
  shape: IGoogleSearchShape,
  editor: any, // Replace with the proper type if available
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Async function to perform the Google search
  const handleSearch = async () => {
    const query = shape.props.text.trim();
    if (!query) return; // Do nothing if the input is empty

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        setError('No results found.');
      } else {
        // Extract top 3 result URLs
        const urls = data.items.slice(0, 3).map((item: any) => item.link);
        // Create three webbrowser shapes arranged horizontally
        createWebbrowserShapes(editor, shape, urls);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during search.');
    } finally {
      setLoading(false);
    }
  };

  // Update the shape's text property when the input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor.updateShape<IGoogleSearchShape>({
      id: shape.id,
      type: 'google-search-shape',
      props: { text: e.currentTarget.value },
    });
  };

  return (
    <HTMLContainer
      style={{
        padding: 16,
        height: shape.props.h,
        width: shape.props.w,
        pointerEvents: 'all', // Allow interaction
        backgroundColor: '#efefef',
        overflow: 'hidden',
      }}
    >
      <input
        type="text"
        placeholder="Enter search query..."
        value={shape.props.text}
        onChange={handleInputChange}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{ width: '70%', marginRight: 8 }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSearch();
        }}
        disabled={loading}
      >
        Enter
      </button>
      {loading && <div style={{ marginTop: 8 }}>Loading...</div>}
      {error && <div style={{ marginTop: 8, color: 'red' }}>{error}</div>}
    </HTMLContainer>
  );
}

// Helper function to create three webbrowser shapes to the right of the current shape
function createWebbrowserShapes(editor: any, currentShape: IGoogleSearchShape, urls: string[]) {
  // Assume currentShape has x and y coordinates; adjust if necessary
  const baseX = (currentShape as any).x + currentShape.props.w + 20; // 20px gap to the right
  const baseY = (currentShape as any).y;
  const webWidth = 300;  // Default width for webbrowser shapes
  const webHeight = 200; // Default height for webbrowser shapes
  const gap = 10;      // Gap between shapes

  urls.forEach((url, index) => {
    // Create a new webbrowser shape.
    // (This uses the assumed editor API for creating shapes.)
    editor.createShape({
      type: 'webbrowser', // Pre-existing webbrowser shape type
      x: baseX + index * (webWidth + gap),
      y: baseY,
      props: {
        url,
        w: webWidth,
        h: webHeight,
      },
    });
  });
}

export class BrowserShapeTool extends BaseBoxShapeTool {
  override shapeType = 'browser'
  static override id = 'browser'
}
