import { NavLink } from 'react-router-dom';
import { FileText, Image as ImageIcon, ImagePlus, Trash2, Network, ChevronRight, PanelTop } from 'lucide-react';
import CardImage from '../components/CardImage';

const isNote = node => !node.image || node.image.includes('photo-1618005182384-a83a8bd57fbe');

export default function GalleryPage({ nodes, boards, title = 'Все материалы', onCardClick, onAddIdea, onDelete, searchQuery, onClearSearch, sortOrder, onSortChange }) {
  return <section className="board-page">
    <header className="board-heading">
      <div><p className="board-breadcrumb">Мои темы<ChevronRight size={12} />{title}</p><h1>{title}</h1></div>
      <div className="board-controls">
        <label className="board-sort">Сортировка<select value={sortOrder} onChange={event => onSortChange(event.target.value)}>
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
          <option value="name">По названию А–Я</option>
        </select></label>
        <span className="board-summary">{searchQuery.trim() ? 'Найдено' : 'Материалов'}: {nodes.length}</span>
      </div>
    </header>
    <div className="canvas-layout">
      <aside className="canvas-toolbar" aria-label="Инструменты доски">
        <button onClick={() => onAddIdea('note')}><FileText size={23} /><span>Заметка</span></button>
        <button onClick={() => onAddIdea('image')}><ImagePlus size={23} /><span>Картинка</span></button>
        <hr /><NavLink to="/graph"><Network size={23} /><span>Граф</span></NavLink>
      </aside>
      <div className="canvas-viewport" aria-label={`Рабочее поле: ${title}`}>
        {!nodes.length && searchQuery.trim() ? <div className="empty-board"><h2>Ничего не найдено</h2><p>Попробуйте другое слово или выберите другую тему.</p><button onClick={onClearSearch}>Очистить поиск</button></div>
          : !nodes.length ? <div className="empty-board"><PanelTop size={32} /><h2>Здесь начнётся новая доска</h2><p>Добавьте картинку или запишите первую мысль.</p><button onClick={() => onAddIdea('note')}>Добавить заметку</button></div>
            : <div className="board-grid">{nodes.map(node => {
              const note = isNote(node);
              return <article key={node.id} className={`board-card ${note ? 'note-card' : 'image-card'}`}>
                <div className="card-toolbar"><span className="card-type">{note ? <FileText size={14} aria-hidden="true" /> : <ImageIcon size={14} aria-hidden="true" />}{note ? 'Заметка' : 'Изображение'}</span>
                  <button className="card-delete" aria-label={`Удалить: ${node.name}`} onClick={() => onDelete(node.id)}><Trash2 size={14} /></button>
                </div>
                <button className="board-card-content" onClick={() => onCardClick(node)}>
                  {!note && <CardImage src={node.image} alt="" className="card-image" />}
                  <div className="card-body"><h2>{node.name}</h2><p className="card-topic-names">{boards.filter(board => node.boardIds.includes(board.id)).map(board => board.name).join(' · ')}</p><p className="card-description">{node.desc || 'Добавьте описание...'}</p>
                    <div className="card-footer"><div className="card-tags">{node.tags.slice(0, 3).map(tag => <span key={tag}>#{tag}</span>)}</div></div>
                  </div>
                </button>
              </article>;
            })}</div>}
      </div>
    </div>
  </section>;
}
