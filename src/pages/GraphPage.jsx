import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphPage({ nodes, links, onCardClick }) {
  const container = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  // Библиотека изменяет узлы и связи при расчёте графа, поэтому передаём копии.
  const graphData = useMemo(() => ({ nodes: nodes.map(node => ({ ...node })), links: links.map(link => ({ ...link })) }), [nodes, links]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} className="graph-wrapper">
    {!nodes.length ? <p className="status-message">Пока нет карточек для отображения.</p> : <>
      <p className="graph-hint">Нажмите на узел, чтобы открыть карточку. Показаны связи внутри выбранной темы.</p>
      <ForceGraph2D graphData={graphData} width={size.width} height={size.height}
        backgroundColor="#ffffff" nodeColor={() => '#555555'} linkColor={() => '#bbbbbb'} linkWidth={2}
        nodeCanvasObject={(node, ctx, globalScale) => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#555555';
          ctx.fill();
          ctx.font = `${12 / globalScale}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#555555';
          ctx.fillText(node.name, node.x, node.y + 14);
        }} onNodeClick={onCardClick} />
    </>}
  </div>;
}
