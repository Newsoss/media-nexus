import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, GitMerge, Plus } from 'lucide-react';

export default function Navbar({ onAddClick }) {
  const { pathname } = useLocation();

  const getLinkStyle = (path) => ({
    ...styles.link,
    backgroundColor: pathname === path ? '#282d3d' : 'transparent',
    color: pathname === path ? '#fff' : '#94a3b8'
  });

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={{ color: '#818cf8' }}>Media</span>Nexus
      </div>

      <div style={styles.menu}>
        <Link to="/" style={getLinkStyle('/')}>
          <LayoutGrid size={18} /> Доска
        </Link>
        <Link to="/graph" style={getLinkStyle('/graph')}>
          <GitMerge size={18} /> Граф связей
        </Link>
      </div>

      <button style={styles.addButton} onClick={onAddClick}>
        <Plus size={18} /> Новая идея
      </button>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 32px',
    backgroundColor: 'rgba(15, 17, 23, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #1e2230',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' },
  menu: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#161922',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid #232733'
  },
  link: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600
  }
};