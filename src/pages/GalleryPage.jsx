import { Link2 } from 'lucide-react';

// mock data для теста
const MOCK_ITEMS = [
  {
    id: 1,
    title: 'Минимализм в веб-дизайне',
    desc: 'Референс компоновки карточек и цветовых акцентов.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
    tags: ['UI/UX', 'Сетка'],
    linksCount: 3
  },
  {
    id: 2,
    title: 'Архитектура микросервисов',
    desc: 'Диаграмма взаимодействия Node.js и PostgreSQL.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
    tags: ['Backend', 'Postgres'],
    linksCount: 5
  },
  {
    id: 3,
    title: 'Киберпанк палитра',
    desc: 'Неоновые градиенты для будущей темы оформления.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
    tags: ['Inspiration', 'Цвет'],
    linksCount: 1
  }
];

export default function GalleryPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Все материалы</h1>
          <p style={styles.subtitle}>Хранилище медиафайлов и концепций</p>
        </div>
      </header>

      {/* grid */}
      <div style={styles.grid}>
        {MOCK_ITEMS.map((item) => (
          <div key={item.id} style={styles.card}>
            <img src={item.image} alt={item.title} style={styles.cardImage} />
            <div style={styles.cardBody}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <span style={styles.badge}>
                  <Link2 size={12} /> {item.linksCount}
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
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  header: {
    marginBottom: '28px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '4px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px'
  },
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
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'pointer'
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    display: 'block'
  },
  cardBody: {
    padding: '16px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#f1f5f9'
  },
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
  cardDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.4',
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
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px'
  }
};