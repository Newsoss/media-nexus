import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Plus, PanelsTopLeft } from 'lucide-react';

export default function Navbar({ onAddClick }) {
  return <header className="site-header">
    <NavLink to="/" className="brand" aria-label="MediaNexus — главная"><PanelsTopLeft size={22} /><span>MediaNexus</span></NavLink>
    <span className="header-divider" />
    <span className="header-project">Моё рабочее пространство</span>
    <nav className="main-nav" aria-label="Вид материалов">
      <NavLink to="/" end><LayoutDashboard size={15} />Доска</NavLink>
      <NavLink to="/graph"><Network size={15} />Граф</NavLink>
    </nav>
    <button className="add-idea" onClick={onAddClick}><Plus size={15} />Добавить</button>
  </header>;
}
