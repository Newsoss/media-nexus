import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Network, Plus, PanelsTopLeft, Search, Sun, Moon } from 'lucide-react';

export default function Navbar({ onAddClick, searchQuery, onSearchChange, theme, onToggleTheme }) {
  return <header className="site-header">
    <NavLink to="/" className="brand" aria-label="MediaNexus — главная"><PanelsTopLeft size={22} /><span>MediaNexus</span></NavLink>
    <span className="header-divider" />
    <span className="header-project">Моё рабочее пространство</span>
    <label className="header-search"><Search size={15} aria-hidden="true" />
      <input type="search" aria-label="Поиск по карточкам" placeholder="Поиск по карточкам" value={searchQuery}
        onChange={event => onSearchChange(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') onSearchChange(''); }} />
    </label>
    <nav className="main-nav" aria-label="Вид материалов">
      <NavLink to="/" end><LayoutDashboard size={15} />Доска</NavLink>
      <NavLink to="/graph"><Network size={15} />Граф</NavLink>
    </nav>
    <button className="theme-toggle" onClick={onToggleTheme} aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'} title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}>
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
    <button className="add-idea" onClick={onAddClick}><Plus size={15} />Добавить</button>
  </header>;
}
