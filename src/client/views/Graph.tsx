/**
 * 知识图谱 v1.1：受力布局 + 章节簇 + 悬停聚焦。
 *
 * 设计取向：把"有哪些知识点、谁依赖谁、我哪里弱"一眼看懂——
 *  - 概念按依赖关系自然散开，不再排成死板的列；
 *  - 同一章的知识点被柔和的色块包住，颜色越浓表示掌握越好；
 *  - 鼠标移上去只留它和它的邻居，其余淡出，避免满屏线条；
 *  - 点一下固定在右侧详情，可以立刻出题练习。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, masteryLabel, type GraphData } from '../api'
import { Badge, Button, EmptyState, ErrorBox, Icon, Loading, Section, useResource } from '../ui'
import { askTutor, graphAsk } from '../tutor'

const CANVAS_W = 1240
const CANVAS_H = 780
const PAD = 80

type Node = GraphData['nodes'][number]
type Edge = GraphData['edges'][number]

const TIER = (mastery: number) => (mastery >= 0.85 ? 'mastered' : mastery >= 0.6 ? 'familiar' : mastery >= 0.3 ? 'learning' : 'weak')
const CHAPTER_PALETTE = ['var(--eg-brand)', 'var(--eg-success)', 'var(--eg-warn)', 'var(--eg-info)', 'var(--eg-error)', '#8b5cf6', '#0ea5e9']

const TIER_COLOR: Record<string, string> = {
  mastered: 'var(--eg-success)',
  familiar: 'var(--eg-info)',
  learning: 'var(--eg-warn)',
  weak: 'var(--eg-error)',
  untouched: 'var(--eg-text-3)',
}

/** 凸包（Andrew monotone chain），用来给章节画柔和的簇。 */
function convexHull(points: { x: number; y: number }[]) {
  if (points.length < 3) return points
  const sorted = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))
  const cross = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lower: any[] = []
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop()
    lower.push(point)
  }
  const upper: any[] = []
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const point = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop()
    upper.push(point)
  }
  upper.pop(); lower.pop()
  return lower.concat(upper)
}

/** 把凸包向外扩一圈并转成平滑路径。 */
function hullPath(points: { x: number; y: number }[], expand = 34) {
  if (points.length < 3) return ''
  const cx = points.reduce((n, p) => n + p.x, 0) / points.length
  const cy = points.reduce((n, p) => n + p.y, 0) / points.length
  const moved = points.map((p) => {
    const dx = p.x - cx
    const dy = p.y - cy
    const len = Math.hypot(dx, dy) || 1
    return { x: p.x + (dx / len) * expand, y: p.y + (dy / len) * expand }
  })
  // Catmull-Rom -> Bezier，得到柔软闭合曲线
  const count = moved.length
  let d = `M ${moved[0].x.toFixed(1)} ${moved[0].y.toFixed(1)}`
  for (let i = 0; i < count; i += 1) {
    const p0 = moved[(i - 1 + count) % count]
    const p1 = moved[i]
    const p2 = moved[(i + 1) % count]
    const p3 = moved[(i + 2) % count]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return `${d} Z`
}

/** 受力布局：斥力散开 + 依赖关系拉近 + 章节成团。 */
function buildLayout(graph: GraphData) {
  const nodes = graph.nodes
  const index = new Map(nodes.map((node, i) => [node.id, i]))
  const chapters = [...graph.chapters].sort((a, b) => a.order - b.order)
  const groups = new Map<string, number[]>()
  for (const node of nodes) {
    const key = node.chapterId ?? '__none__'
    groups.set(key, [...(groups.get(key) ?? []), index.get(node.id)!])
  }
  const W = CANVAS_W
  const H = CANVAS_H
  const xs = new Float64Array(nodes.length)
  const ys = new Float64Array(nodes.length)
  const vx = new Float64Array(nodes.length)
  const vy = new Float64Array(nodes.length)

  // 初始：章节围成一圈，章内节点小范围散开
  const groupKeys = [...groups.keys()]
  const centroids = new Map<string, { x: number; y: number }>()
  groupKeys.forEach((key, gi) => {
    const angle = (gi / Math.max(1, groupKeys.length)) * Math.PI * 2
    const radius = groupKeys.length === 1 ? 0 : Math.min(W, H) * 0.3
    const cx = W / 2 + Math.cos(angle) * radius
    const cy = H / 2 + Math.sin(angle) * radius
    centroids.set(key, { x: cx, y: cy })
    const members = groups.get(key)!
    members.forEach((nodeIndex, mi) => {
      const a = (mi / Math.max(1, members.length)) * Math.PI * 2
      const r = 30 + (mi % 3) * 22
      xs[nodeIndex] = cx + Math.cos(a) * r + (Math.random() - 0.5) * 10
      ys[nodeIndex] = cy + Math.sin(a) * r + (Math.random() - 0.5) * 10
    })
  })

  const degree = new Map<string, number>()
  for (const edge of graph.edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
  }

  const ITER = 300
  const density = 1 + Math.min(2.4, nodes.length / 90)
  for (let step = 0; step < ITER; step += 1) {
    const cooling = 1 - step / ITER
    // 斥力
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        let dx = xs[i] - xs[j]
        let dy = ys[i] - ys[j]
        let dist2 = dx * dx + dy * dy
        if (dist2 < 1) { dx = (Math.random() - 0.5) * 2; dy = (Math.random() - 0.5) * 2; dist2 = 4 }
        const dist = Math.sqrt(dist2)
        const force = Math.min(18, (3600 * density) / dist2)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        vx[i] += fx; vy[i] += fy
        vx[j] -= fx; vy[j] -= fy
      }
    }
    // 依赖/相关弹簧
    for (const edge of graph.edges) {
      const a = index.get(edge.source)
      const b = index.get(edge.target)
      if (a === undefined || b === undefined) continue
      const targetLen = (edge.type === 'prerequisite' ? 130 : 168) * (1 + Math.min(0.8, nodes.length / 220))
      const dx = xs[b] - xs[a]
      const dy = ys[b] - ys[a]
      const dist = Math.hypot(dx, dy) || 1
      const strength = 0.018 + (edge.weight ?? 0.5) * 0.03
      const pull = (dist - targetLen) * strength
      const fx = (dx / dist) * pull
      const fy = (dy / dist) * pull
      vx[a] += fx; vy[a] += fy
      vx[b] -= fx; vy[b] -= fy
    }
    // 章节重心 + 画布重心
    for (const [key, members] of groups) {
      const center = centroids.get(key)!
      for (const nodeIndex of members) {
        vx[nodeIndex] += (center.x - xs[nodeIndex]) * 0.012
        vy[nodeIndex] += (center.y - ys[nodeIndex]) * 0.012
      }
    }
    for (let i = 0; i < nodes.length; i += 1) {
      vx[i] += (W / 2 - xs[i]) * 0.0016
      vy[i] += (H / 2 - ys[i]) * 0.0016
      vx[i] *= 0.72; vy[i] *= 0.72
      const speed = Math.hypot(vx[i], vy[i])
      const cap = 14 * cooling + 2
      if (speed > cap) { vx[i] = (vx[i] / speed) * cap; vy[i] = (vy[i] / speed) * cap }
      xs[i] += vx[i] * cooling
      ys[i] += vy[i] * cooling
    }
  }

  // 归一化到画布
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const spanX = Math.max(1, maxX - minX)
  const spanY = Math.max(1, maxY - minY)
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY)
  const positions = new Map<string, { x: number; y: number }>()
  nodes.forEach((node, i) => {
    positions.set(node.id, {
      x: PAD + (xs[i] - minX) * scale + (W - PAD * 2 - spanX * scale) / 2,
      y: PAD + (ys[i] - minY) * scale + (H - PAD * 2 - spanY * scale) / 2,
    })
  })

  // 章节簇
  const hulls = chapters.map((chapter) => {
    const members = nodes.filter((node) => node.chapterId === chapter.id)
    if (members.length < 2) return null
    const points = members.map((node) => positions.get(node.id)!).filter(Boolean)
    const hull = convexHull(points)
    const path = hullPath(hull, members.length > 6 ? 42 : 30)
    const center = {
      x: points.reduce((n, p) => n + p.x, 0) / points.length,
      y: points.reduce((n, p) => n + p.y, 0) / points.length,
    }
    return { id: chapter.id, title: chapter.title, path, center }
  }).filter(Boolean) as { id: string; title: string; path: string; center: { x: number; y: number } }[]

  return { positions, hulls, degree }
}

export function GraphView({ courseId, revision, notify, onPractice }: {
  courseId: string
  revision: number
  notify: (message: string) => void
  onPractice: (conceptIds: string[]) => void
}) {
  const { data, error, loading } = useResource(() => api.graph(courseId), [courseId, revision])
  const graph = data as (GraphData & { ok: boolean }) | null
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: Node } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [chapterFilter, setChapterFilter] = useState('')
  const [query, setQuery] = useState('')
  const [showRelated, setShowRelated] = useState(true)
  const [animated, setAnimated] = useState(true)
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const [panning, setPanning] = useState(false)
  const shellRef = useRef<HTMLDivElement | null>(null)

  const fit = useCallback(() => { setZoom(1); setOffset({ x: 0, y: 0 }) }, [])
  // 只看某一章时，按这一章的子图重新布局，点才会铺满画布。
  const visibleGraph = useMemo(() => {
    if (!graph) return null
    if (!chapterFilter) return graph
    const nodes = graph.nodes.filter((node) => node.chapterId === chapterFilter)
    const ids = new Set(nodes.map((node) => node.id))
    return {
      ...graph,
      nodes,
      edges: graph.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target)),
      chapters: graph.chapters.filter((chapter) => chapter.id === chapterFilter),
    }
  }, [graph, chapterFilter])
  const layout = useMemo(() => (visibleGraph ? buildLayout(visibleGraph) : null), [visibleGraph])
  useEffect(() => { setAnimated(true); const timer = window.setTimeout(() => setAnimated(false), 2000); return () => window.clearTimeout(timer) }, [graph])

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>()
    if (!graph) return map
    for (const edge of graph.edges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set())
      if (!map.has(edge.target)) map.set(edge.target, new Set())
      map.get(edge.source)!.add(edge.target)
      map.get(edge.target)!.add(edge.source)
    }
    return map
  }, [graph])

  const large = (visibleGraph?.nodes.length ?? 0) > 40
  const chapterColor = useMemo(() => {
    const map = new Map<string, string>()
    ;(graph?.chapters ?? []).forEach((chapter, index) => map.set(chapter.id, CHAPTER_PALETTE[index % CHAPTER_PALETTE.length]))
    return map
  }, [graph])
  const colorOf = (node: Node) => chapterColor.get(node.chapterId ?? '') ?? 'var(--eg-brand)'

  // 大图一进来先聚焦到内容最多的那一章，避免一屏 100 多个点看不清。
  useEffect(() => {
    if (!graph || chapterFilter || graph.nodes.length <= 60) return
    const top = [...graph.chapters].sort((a, b) => (b.conceptCount ?? 0) - (a.conceptCount ?? 0))[0]
    if (top) setChapterFilter(top.id)
  }, [graph, chapterFilter])
  if (loading && !graph) return <Loading />
  if (error) return <ErrorBox error={error} />
  if (!graph || !layout) return null
  if (!graph.nodes.length) {
    return <Section><EmptyState title="还没有知识图谱" text="上传资料并等它解析完，这里就会画出课程的概念和它们的先后关系。" /></Section>
  }

  const focusId = hovered ?? selected
  const focusSet = focusId ? new Set([focusId, ...(neighbors.get(focusId) ?? [])]) : null
  const q = query.trim()
  const matches = q ? new Set(graph.nodes.filter((node) => node.name.toLowerCase().includes(q.toLowerCase())).map((node) => node.id)) : null
  const visible = (node: Node) => (!chapterFilter || node.chapterId === chapterFilter)

  const edges = (visibleGraph?.edges ?? []).filter((edge) => showRelated || edge.type === 'prerequisite')

  const selectedNode = graph.nodes.find((node) => node.id === selected) ?? null
  const selectedRelated = selectedNode
    ? graph.edges
      .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
      .map((edge) => graph.nodes.find((node) => node.id === (edge.source === selectedNode.id ? edge.target : edge.source))?.name)
      .filter((name): name is string => Boolean(name))
      .slice(0, 6)
    : []
  const mastered = graph.nodes.filter((node) => node.mastery >= 0.85).length
  const showLabels = !large || zoom > 1.2
  const hullOpacity = large && !chapterFilter && !focusId ? 0 : 1

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as Element).closest('.eg-graph-node')) return
    drag.current = { startX: event.clientX, startY: event.clientY, ox: offset.x, oy: offset.y }
    setPanning(true)
    ;(event.currentTarget as Element).setPointerCapture?.(event.pointerId)
  }
  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current) return
    setOffset({ x: drag.current.ox + (event.clientX - drag.current.startX), y: drag.current.oy + (event.clientY - drag.current.startY) })
  }
  const onPointerUp = () => { drag.current = null; setPanning(false) }
  const onWheel = (event: React.WheelEvent) => {
    event.preventDefault()
    const next = Math.max(0.45, Math.min(2.6, zoom - event.deltaY * 0.0012))
    setZoom(next)
  }
  const focusNode = (node: Node) => {
    const point = layout.positions.get(node.id)
    if (!point) return
    setSelected(node.id)
    setZoom(1.35)
    setOffset({ x: (CANVAS_W / 2 - point.x) * 1.35, y: (CANVAS_H / 2 - point.y) * 1.35 })
  }

  return (
    <div className="eg-grid" style={{ gap: 14 }}>
      <div className="eg-row between" style={{ alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 660, letterSpacing: '-0.2px' }}>知识图谱</div>
          <div className="eg-graph-stats">
            <span>{graph.nodes.length} 个知识点</span>
            <span>{graph.edges.length} 条关系</span>
            <span>{mastered} 个已掌握</span>
            <span>线越实，越像"先学它才能学它"</span>
          </div>
        </div>
        <div className="eg-row">
          <input className="eg-input" style={{ width: 160 }} placeholder="找一个知识点" value={query}
            onChange={(event) => setQuery(event.target.value)} />
          <Button size="sm" variant={showRelated ? 'primary' : 'default'} onClick={() => setShowRelated((value) => !value)}>相关边</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0, maxWidth: '100%' }}>
        <select className="eg-select" style={{ width: 210, flex: 'none' }} value={chapterFilter}
          onChange={(event) => setChapterFilter(event.target.value)}>
          <option value="">全部章节（{graph.chapters.length}）</option>
          {graph.chapters.filter((chapter) => graph.nodes.some((node) => node.chapterId === chapter.id)).map((chapter) => (
            <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, flex: 1, minWidth: 0 }}>
          <button type="button" className="eg-graph-chip" data-active={!chapterFilter} style={{ flex: 'none', whiteSpace: 'nowrap' }} onClick={() => setChapterFilter('')}>
            <i style={{ background: 'var(--eg-brand)' }} />全部
          </button>
          {graph.chapters.filter((chapter) => graph.nodes.some((node) => node.chapterId === chapter.id)).map((chapter, index) => (
            <button key={chapter.id} type="button" className="eg-graph-chip" data-active={chapterFilter === chapter.id}
              style={{ flex: 'none' }} onClick={() => setChapterFilter(chapterFilter === chapter.id ? '' : chapter.id)}>
              <i style={{ background: CHAPTER_PALETTE[index % CHAPTER_PALETTE.length] }} />
              {chapter.title.length > 14 ? `${chapter.title.slice(0, 14)}…` : chapter.title}
            </button>
          ))}
        </div>
      </div>

      {chapterFilter ? (
        <div className="eg-row" style={{ marginTop: -6 }}>
          <Button size="sm" variant="ghost" onClick={() => setChapterFilter('')}>← 回到章节总览</Button>
          <span className="eg-muted" style={{ fontSize: 12 }}>当前只看这一章。</span>
        </div>
      ) : null}

      <div className="eg-graph-shell" ref={shellRef}>
        <svg className="eg-graph-svg" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} preserveAspectRatio="xMidYMid meet"
          data-panning={panning} onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerLeave={onPointerUp} onWheel={onWheel}>
          <defs>
            {Object.entries(TIER_COLOR).map(([tier, color]) => (
              <radialGradient key={tier} id={`eg-node-${tier}`} cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor={color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={color} stopOpacity="0.62" />
              </radialGradient>
            ))}
            <filter id="eg-soft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <marker id="eg-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3.2" orient="auto">
              <path d="M0 0 L6.5 3.2 L0 6.4 Z" fill="var(--eg-text-3)" opacity="0.75" />
            </marker>
          </defs>
          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            {layout.hulls.map((hull) => {
              const hasFocus = focusSet ? [...(focusSet ?? [])].some((id) => graph.nodes.find((n) => n.id === id)?.chapterId === hull.id) : false
              const dim = Boolean((focusSet && !hasFocus) || (chapterFilter && chapterFilter !== hull.id))
              const faded = hullOpacity === 0 && !hasFocus
              return (
                <g key={hull.id} className="eg-graph-hull" data-dim={dim} opacity={faded ? 0.18 : dim ? 0.5 : 1}>
                  <path d={hull.path} fill={chapterColor.get(hull.id) ?? 'var(--eg-brand)'} fillOpacity={large ? 0.04 : 0.06}
                    stroke={chapterColor.get(hull.id) ?? 'var(--eg-brand)'} strokeOpacity={large ? 0.12 : 0.2}
                    strokeWidth={large ? 10 : 16} strokeLinejoin="round" />
                  {(hasFocus || (!large && !chapterFilter) || chapterFilter === hull.id) ? (
                    <text x={hull.center.x} y={hull.center.y - 6} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--eg-text-3)">{hull.title}</text>
                  ) : null}
                </g>
              )
            })}

            {edges.map((edge, index) => {
              const from = layout.positions.get(edge.source)
              const to = layout.positions.get(edge.target)
              if (!from || !to) return null
              const related = focusSet ? focusSet.has(edge.source) && focusSet.has(edge.target) : true
              const isPrereq = edge.type === 'prerequisite'
              const mx = (from.x + to.x) / 2 + (to.y - from.y) * 0.07
              const my = (from.y + to.y) / 2 - (to.x - from.x) * 0.07
              return (
                <path key={edge.id ?? `${edge.source}-${edge.target}-${index}`}
                  className={animated ? 'eg-edge-in' : undefined}
                  style={animated ? { animationDelay: `${Math.min(600, index * 8)}ms` } : undefined}
                  d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isPrereq ? `color-mix(in srgb, ${chapterColor.get(graph.nodes.find((n) => n.id === edge.source)?.chapterId ?? '') ?? 'var(--eg-warn)'} 62%, var(--eg-text-3))` : 'var(--eg-border-strong)'}
                  strokeWidth={isPrereq ? 1.15 + (edge.weight ?? 0.5) * 0.9 : 1}
                  strokeDasharray={isPrereq ? undefined : '3 5'}
                  strokeOpacity={related ? (isPrereq ? (large ? 0.34 : 0.55) : (large ? 0.16 : 0.38)) : 0.05}
                  markerEnd={isPrereq ? 'url(#eg-arrow)' : undefined}
                />
              )
            })}

            {graph.nodes.filter(visible).map((node, index) => {
              const point = layout.positions.get(node.id)
              if (!point) return null
              const degree = layout.degree.get(node.id) ?? 0
              const base = large ? 5.2 : 8
              const spread = large ? 5 : 9
              const radius = base + Math.min(spread, degree * (large ? 0.7 : 1.35)) * (0.72 + (node.confidence ?? 0.5) * 0.28)
              const tier = node.attempts ? TIER(node.mastery) : 'untouched'
              const dim = Boolean((focusSet && !focusSet.has(node.id)) || (matches && !matches.has(node.id)))
              const isFocus = focusId === node.id
              const isMatch = matches?.has(node.id)
              return (
                <g key={node.id} className="eg-graph-node"
                  data-focus={isFocus} data-dim={dim} transform={`translate(${point.x} ${point.y})`}
                  onClick={() => focusNode(node)}
                  onPointerEnter={(event) => {
                    setHovered(node.id)
                    const rect = shellRef.current?.getBoundingClientRect()
                    if (rect) setTooltip({ x: event.clientX - rect.left + 14, y: event.clientY - rect.top + 12, node })
                  }}
                  onPointerMove={(event) => {
                    const rect = shellRef.current?.getBoundingClientRect()
                    if (rect && tooltip) setTooltip({ x: event.clientX - rect.left + 14, y: event.clientY - rect.top + 12, node })
                  }}
                  onPointerLeave={() => { setHovered(null); setTooltip(null) }}>
                  <g className={animated ? 'eg-node-in' : undefined} style={animated ? { animationDelay: `${Math.min(700, index * 14)}ms` } : undefined}>
                  <circle className="eg-node-halo" r={radius * 2.4} fill={colorOf(node)} filter="url(#eg-soft)" />
                  {isMatch ? <circle className="eg-pulse" r={radius + 4} fill="none" stroke="var(--eg-brand)" strokeWidth="2" /> : null}
                  <circle r={radius}
                    fill={node.attempts
                      ? `url(#eg-node-${tier})`
                      : `color-mix(in srgb, ${colorOf(node)} 42%, var(--eg-layer2))`}
                    stroke={isFocus ? 'var(--eg-brand)' : node.attempts ? 'rgba(255,255,255,.55)' : `color-mix(in srgb, ${colorOf(node)} 78%, transparent)`}
                    strokeWidth={isFocus ? 2.4 : 1} />
                  {(showLabels || isFocus || isMatch) && (
                    <text x={radius + 7} y={4} fontSize="11.5" fill="var(--eg-text)" opacity={dim ? 0.4 : 0.92}>
                      {node.name.length > 14 ? `${node.name.slice(0, 14)}…` : node.name}
                    </text>
                  )}
                  </g>
                </g>
              )
            })}
          </g>
        </svg>

        {tooltip ? (
          <div className="eg-graph-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <b>{tooltip.node.name}</b>
            <div className="eg-muted">{[masteryLabel(tooltip.node.level).text, `熟练度 ${Math.round(tooltip.node.mastery * 100)}%`, `练过 ${tooltip.node.attempts} 次`].join(' · ')}</div>
            {tooltip.node.definition ? <div style={{ marginTop: 4, color: 'var(--eg-text-2)' }}>{tooltip.node.definition.slice(0, 90)}</div> : null}
          </div>
        ) : null}

        <div className="eg-graph-tools">
          <Button size="sm" onClick={() => setZoom((value) => Math.min(2.6, value + 0.15))}>＋</Button>
          <Button size="sm" onClick={() => setZoom((value) => Math.max(0.45, value - 0.15))}>－</Button>
          <Button size="sm" onClick={fit}>适配</Button>
        </div>
        <div className="eg-graph-legend">
          <span><span className="eg-dot" data-tone="success" />已掌握</span>
          <span><span className="eg-dot" data-tone="brand" />熟悉</span>
          <span><span className="eg-dot" data-tone="warn" />学习中</span>
          <span><span className="eg-dot" data-tone="error" />薄弱</span>
          <span>虚线圆 = 还没学过</span>
        </div>
      </div>

      {selectedNode ? (
        <Section
          title={selectedNode.name}
          hint={`${masteryLabel(selectedNode.level).text} · 熟练度 ${Math.round(selectedNode.mastery * 100)}% · 练过 ${selectedNode.attempts} 次 · ${selectedNode.sourceCount} 处原文`}
          actions={<>
            <Button size="sm" variant="ghost" className="eg-ask"
              onClick={() => askTutor(graphAsk(selectedNode.name, selectedNode.definition, selectedRelated), selectedNode.name)}>
              <Icon name="chat" size={13} />问导师
            </Button>
            <Button size="sm" variant="primary" onClick={() => onPractice([selectedNode.id])}><Icon name="quiz" size={13} />练这个</Button>
            <Button size="sm" variant="ghost" onClick={() => { setSelected(null); fit() }}>收起</Button>
          </>}>
          <div className="eg-concept-def">{selectedNode.definition || '资料里没给出定义，可以去「资料」页翻原文。'}</div>
          <div className="eg-wrap">
            {graph.edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id).slice(0, 10).map((edge) => {
              const otherId = edge.source === selectedNode.id ? edge.target : edge.source
              const other = graph.nodes.find((node) => node.id === otherId)
              if (!other) return null
              const isPrereq = edge.type === 'prerequisite'
              const label = isPrereq ? (edge.source === selectedNode.id ? `要先学会：${other.name}` : `学完它才能学：${other.name}`) : `相关：${other.name}`
              return <Badge key={edge.id ?? otherId} tone={isPrereq ? 'warn' : 'business'}>{label}</Badge>
            })}
          </div>
        </Section>
      ) : (
        <div className="eg-muted" style={{ fontSize: 12 }}>提示：点一个点看它是什么、要不要先补前置；拖动空白处平移，滚轮缩放。</div>
      )}
    </div>
  )
}
