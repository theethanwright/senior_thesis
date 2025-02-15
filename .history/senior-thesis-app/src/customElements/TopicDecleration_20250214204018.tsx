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
		const [isImageSearch, setIsImageSearch] = useState(false)

		const API_KEY = import.meta.env.VITE_API_KEY
		const CX = import.meta.env.VITE_CX
		console.log('API_KEY:', API_KEY, 'CX:', CX)

		const handleSearch = async () => {
			if (!query.trim()) return
			setLoading(true)
			setError(null)
			try {
				// Append &searchType=image if image search is enabled.
				const searchTypeParam = isImageSearch ? '&searchType=image' : ''
				const res = await fetch(
					`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}${searchTypeParam}`
				)
				const data = await res.json()

				let urls: string[] = []
				if (data.items) {
					if (isImageSearch) {
						// Use up to 12 results for image search.
						urls = data.items.slice(0, 12).map((item: any) => item.link)
					} else {
						urls = data.items.slice(0, 3).map((item: any) => item.link)
						// If there is at least one result but fewer than three, just use one.
						if (urls.length < 3 && urls.length > 0) {
							urls = [urls[0]]
						}
					}
				}

				// Return early if no URLs found.
				if (urls.length === 0) {
					setError('No results found.')
					return
				}

				// Define dimensions and gaps.
				const browserWidth = 1000
				const browserHeight = 500
				const horizontalGap = 50
				// For image search grid, we add a vertical gap between rows.
				const verticalGap = 50
				const margin = 1000 // distance between search shape and new shapes

				let newShapes: any[] = []
				if (isImageSearch) {
					// 3 columns grid:
					const columns = 3
					const rows = Math.ceil(urls.length / columns)
					const totalGroupWidth = columns * browserWidth + (columns - 1) * horizontalGap
					const totalGroupHeight = rows * browserHeight + (rows - 1) * verticalGap
					const startX = shape.x + shape.props.w / 2 - totalGroupWidth / 2
					const startY = shape.y + shape.props.h + margin

					newShapes = urls.map((url: string, i: number) => {
						const col = i % columns
						const row = Math.floor(i / columns)
						return {
							id: `shape:${Date.now() + i}` as TLShapeId,
							type: 'browser' as const,
							x: startX + col * (browserWidth + horizontalGap),
							y: startY + row * (browserHeight + verticalGap),
							rotation: 0,
							props: {
								w: browserWidth,
								h: browserHeight,
								url,
							},
						}
					})
				} else {
					// Single row layout (as before)
					const count = urls.length
					const totalGroupWidth = count * browserWidth + (count - 1) * horizontalGap
					const startX = shape.x + shape.props.w / 2 - totalGroupWidth / 2
					const startY = shape.y + shape.props.h + margin

					newShapes = urls.map((url: string, i: number) => ({
						id: `shape:${Date.now() + i}` as TLShapeId,
						type: 'browser' as const,
						x: startX + i * (browserWidth + horizontalGap),
						y: startY,
						rotation: 0,
						props: {
							w: browserWidth,
							h: browserHeight,
							url,
						},
					}))
				}

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

				// Compute the union bounds of the new shapes.
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
				{/* Toggle switch for search type */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<label htmlFor="search-toggle">Image Search</label>
					<input
						id="search-toggle"
						type="checkbox"
						checked={isImageSearch}
						onChange={(e) => setIsImageSearch(e.target.checked)}
						onPointerDown={stopEventPropagation}
					/>
				</div>
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
