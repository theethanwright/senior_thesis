import React, { useState } from 'react'
import {
	BaseBoxShapeUtil,
	HTMLContainer,
	T,
	TLBaseShape,
	useEditor,
	stopEventPropagation,
	BaseBoxShapeTool,
	TLShapeId,
} from 'tldraw'

// Define the SearchShape type with basic width and height properties.
type SearchShape = TLBaseShape<'search', { w: number; h: number }>

// The SearchShapeUtil renders the input UI and performs the API call.
export class SearchShapeUtil extends BaseBoxShapeUtil<SearchShape> {
	static override type = 'search' as const
	static override props = {
		w: T.positiveNumber,
		h: T.positiveNumber,
	}

	override getDefaultProps() {
		return {
			w: 300,
			h: 50,
		}
	}

	override component(shape: SearchShape) {
		const editor = useEditor()
		const [query, setQuery] = useState('')
		const [loading, setLoading] = useState(false)
		const [error, setError] = useState<string | null>(null)

		console.log('API_KEY:', API_KEY, 'CX:', CX);

		const API_KEY = process.env.REACT_APP_API_KEY
		const CX = process.env.REACT_APP_CX

		const handleSearch = async () => {
			if (!query.trim()) return
			setLoading(true)
			setError(null)
			try {
				const res = await fetch(
					`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(
						query
					)}`
				)
				const data = await res.json()

				// Get the top three result URLs.
				let urls: string[] = data.items
					? data.items.slice(0, 3).map((item: any) => item.link)
					: []

				// If there are fewer than three results (but at least one), create one browser shape.
				if (urls.length < 3 && urls.length > 0) {
					urls = [urls[0]]
				}

				// Define a margin of 50px between shapes.
				const margin = 1000

				// For each URL, create a new browser shape positioned below the search shape and centered.
				const browserWidth = 1000
				const horizontalGap = 50
				const count = urls.length
				const totalGroupWidth = count * browserWidth + (count - 1) * horizontalGap
				const startX = shape.x + shape.props.w / 2 - totalGroupWidth / 2

				const newShapes = urls.map((url: string, i: number) => ({
					id: `shape:${Date.now() + i}` as TLShapeId,
					type: 'browser' as const,
					x: startX + i * (browserWidth + horizontalGap),
					y: shape.y + shape.props.h + 1000, // vertical gap remains 1000
					rotation: 0,
					props: {
						w: browserWidth,
						h: 500,
						url,
					},
				}))
				editor.createShapes(newShapes)

				// Create arrows from the search shape to each new browser shape.
				const searchCenter = {
					x: shape.x + shape.props.w / 2,
					y: shape.y + shape.props.h / 2,
				}

				const arrowShapes = []
				const bindings = []

				newShapes.forEach((browserShape, i) => {
					const browserCenter = {
						x: browserShape.x + browserShape.props.w / 2,
						y: browserShape.y + browserShape.props.h / 2,
					}

					const arrow = {
						id: `shape:${Date.now()}_${i}` as TLShapeId,
						type: 'arrow' as const,
						props: {
							color: 'black',
							start: searchCenter,
							end: browserCenter,
						},
					}

					arrowShapes.push(arrow)

					bindings.push(
						{
							fromId: arrow.id,
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
							fromId: arrow.id,
							toId: browserShape.id,
							type: 'arrow',
							props: {
								terminal: 'end',
								normalizedAnchor: { x: 0.5, y: 0.5 },
								isExact: false,
								isPrecise: false,
							},
						}
					)
				})

				editor.createShapes(arrowShapes)
				editor.createBindings(bindings)

				// Compute the total bounds by reducing over the newShapes array:
				const unionBounds = newShapes.reduce((acc, shape) => {
					const b = editor.getShapePageBounds(shape.id)
					if (!b) return acc
					if (!acc) return b
					const x = Math.min(acc.x, b.x)
					const y = Math.min(acc.y, b.y)
					const right = Math.max(acc.x + acc.w, b.x + b.w)
					const bottom = Math.max(acc.y + acc.h, b.y + b.h)
					return { x, y, w: right - x, h: bottom - y }
				}, null as { x: number; y: number; w: number; h: number } | null)

				// Only zoom if BrowserOverlay is not open.
				if (unionBounds && !(window as any).__browserOverlayOpen) {
					editor.zoomToBounds(unionBounds, { animation: { duration: 200 } })
				}

			} catch (err) {
				console.error(err)
				setError('Search failed. Try again.')
			} finally {
				setLoading(false)
			}
		}

		return (
			<HTMLContainer
				style={{
					pointerEvents: 'all',
					background: '#fff',
					display: 'flex',
					flexDirection: 'column',
					padding: '8px',
					gap: '8px',
				}}
			>
				<div style={{ display: 'flex', gap: '8px' }}>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						style={{ flex: 1, padding: '4px' }}
						onPointerDown={stopEventPropagation}
					/>
					<button
						onClick={(e) => {
							e.stopPropagation()
							handleSearch()
						}}
						disabled={loading}
						onPointerDown={stopEventPropagation}
					>
						{loading ? 'Loading...' : 'Enter'}
					</button>
				</div>
				{error && <div style={{ color: 'red' }}>{error}</div>}
			</HTMLContainer>
		)
	}

	override indicator(shape: SearchShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}

// Define a tool for the search shape.
export class SearchShapeTool extends BaseBoxShapeTool {
	static override id = 'search'
	override shapeType = 'search'
}
