import { Link2 } from 'lucide-react';

export default function GalleryPage({ nodes, links, onCardClick }) {
  const getConnectionsCount = (id) => {
    return links.filter(l => {
      const src = l.source?.id ?? l.source;
      const tgt = l.target?.id ?? l.target;
      return src === id || tgt === id;
    }).length;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Все материалы</h1>
          <p style={styles.subtitle}>Хранилище медиафайлов и концепций</p>
        </div>
      </header>

      <div style={styles.grid}>
        {nodes.map((item) => (
          <div 
            key={item.id} 
            style={styles.card} 
            onClick={() => onCardClick(item)}
          >
            <img src={item.image} alt={item.name} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{item.name}</h3>
                <span style={styles.badge}>
                  <Link2 size={12} /> {getConnectionsCount(item.id)}
                </span>
              </div>
              <p style={styles.cardDesc}>{item.desc}</p>
              <div style={styles.tagList}>
                {item.tags.map((t) => (
                  <span key={t} style={styles.tag}>#{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  header: { marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  subtitle: { color: '#64748b', fontSize: '14px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#161922',
    border: '1px solid #232733',
    borderRadius: '14px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s'
  },
  cardImage: { width: '100%', height: '180px', objectFit: 'cover' },
  cardBody: { padding: '16px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTitle: { fontSize: '16px', fontWeight: 600, color: '#f1f5f9' },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#282d3d',
    color: '#818cf8',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600
  },
  cardDesc: { fontSize: '13px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' },
  tagList: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  tag: { backgroundColor: '#1e2230', color: '#64748b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }
};