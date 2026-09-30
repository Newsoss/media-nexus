import { X, Trash2, Link2 } from 'lucide-react';

export default function CardDetailModal({ card, isOpen, onClose, nodes, links, onDelete }) {
  if (!isOpen || !card) return null;

  // находим узлы, связанные с текущей карточкой
  const connectedNodes = links
    .filter((l) => {
      const src = l.source?.id ?? l.source;
      const tgt = l.target?.id ?? l.target;
      return src === card.id || tgt === card.id;
    })
    .map((l) => {
      const src = l.source?.id ?? l.source;
      const tgt = l.target?.id ?? l.target;
      const otherId = src === card.id ? tgt : src;
      return nodes.find((n) => n.id === otherId);
    })
    .filter(Boolean);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.badge}>
            <Link2 size={13} /> {connectedNodes.length} связей
          </span>
          <button style={styles.iconBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <img src={card.image} alt={card.name} style={styles.image} />

        <div style={styles.body}>
          <h2 style={styles.title}>{card.name}</h2>
          <p style={styles.desc}>{card.desc}</p>

          <div style={styles.tags}>
            {card.tags?.map((t) => (
              <span key={t} style={styles.tag}>#{t}</span>
            ))}
          </div>

          {/* related items */}
          <div style={styles.relations}>
            <h4 style={styles.relationsTitle}>Связанные идеи:</h4>
            {connectedNodes.length === 0 ? (
              <p style={styles.emptyText}>Нет прямых связей с другими карточками</p>
            ) : (
              <div style={styles.relationList}>
                {connectedNodes.map((n) => (
                  <div key={n.id} style={styles.relationItem}>
                    <img src={n.image} alt="" style={styles.relationThumb} />
                    <span>{n.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <button style={styles.deleteBtn} onClick={() => onDelete(card.id)}>
              <Trash2 size={16} /> Удалить карточку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)'
  },
  modal: {
    backgroundColor: '#161922',
    border: '1px solid #232733',
    borderRadius: '16px',
    width: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    color: '#fff'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #1e2230'
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 600
  },
  iconBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  image: { width: '100%', height: '260px', objectFit: 'cover' },
  body: { padding: '24px' },
  title: { fontSize: '20px', fontWeight: 700, marginBottom: '8px' },
  desc: { fontSize: '14px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px' },
  tags: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' },
  tag: { backgroundColor: '#1e2230', color: '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' },
  relations: {
    backgroundColor: '#0f1117',
    border: '1px solid #1e2230',
    borderRadius: '10px',
    padding: '14px',
    marginBottom: '20px'
  },
  relationsTitle: { fontSize: '13px', color: '#cbd5e1', marginBottom: '10px' },
  emptyText: { fontSize: '12px', color: '#64748b' },
  relationList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  relationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#94a3b8'
  },
  relationThumb: { width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' },
  footer: { display: 'flex', justifyContent: 'flex-end' },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  }
};