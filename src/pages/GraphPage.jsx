import { useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { X, Link2 } from 'lucide-react';

// mock graph data
const INITIAL_DATA = {
  nodes: [
    { 
      id: 1, 
      name: 'Минимализм в веб-дизайне', 
      tags: ['UI/UX', 'Сетка'],
      desc: 'Референс компоновки карточек и цветовых акцентов.',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
      val: 12,
      color: '#818cf8' 
    },
    { 
      id: 2, 
      name: 'Архитектура микросервисов', 
      tags: ['Backend', 'Postgres'],
      desc: 'Диаграмма взаимодействия Node.js и PostgreSQL.',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
      val: 16,
      color: '#38bdf8' 
    },
    { 
      id: 3, 
      name: 'Киберпанк палитра', 
      tags: ['Inspiration', 'Цвет'],
      desc: 'Неоновые градиенты для будущей темы оформления.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
      val: 10,
      color: '#f43f5e' 
    },
    { 
      id: 4, 
      name: 'Дизайн-система компонентов', 
      tags: ['UI/UX', 'React'],
      desc: 'Набор кнопок, модалок и карточек для интерфейса.',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&auto=format&fit=crop&q=60',
      val: 14,
      color: '#a855f7' 
    }
  ],
  links: [
    { source: 1, target: 4 },
    { source: 1, target: 3 },
    { source: 2, target: 4 }
  ]
};

export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 400);
      fgRef.current.zoom(2.5, 400);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* graph canvas */}
      <ForceGraph2D
        ref={fgRef}
        graphData={INITIAL_DATA}
        backgroundColor="#0f1117"
        nodeColor={(node) => node.color}
        nodeRelSize={6}
        linkColor={() => '#2a3042'}
        linkWidth={2}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // custom node paint
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(label, node.x, node.y + 12);
        }}
        onNodeClick={handleNodeClick}
      />

      {/* side detail panel */}
      {selectedNode && (
        <aside style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelBadge}>
              <Link2 size={12} /> Связанный узел
            </span>
            <button style={styles.closeBtn} onClick={() => setSelectedNode(null)}>
              <X size={18} />
            </button>
          </div>

          <img src={selectedNode.image} alt={selectedNode.name} style={styles.panelImg} />
          
          <h3 style={styles.panelTitle}>{selectedNode.name}</h3>
          <p style={styles.panelDesc}>{selectedNode.desc}</p>

          <div style={styles.tagList}>
            {selectedNode.tags.map((tag) => (
              <span key={tag} style={styles.tag}>#{tag}</span>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    height: 'calc(100vh - 61px)',
    overflow: 'hidden'
  },
  panel: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '320px',
    backgroundColor: '#161922',
    border: '1px solid #232733',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    zIndex: 10
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  panelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 600
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 0
  },
  panelImg: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  panelTitle: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#f8fafc'
  },
  panelDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.4,
    marginBottom: '12px'
  },
  tagList: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#1e2230',
    color: '#64748b',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px'
  }
};