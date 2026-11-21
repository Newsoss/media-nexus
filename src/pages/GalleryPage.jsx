import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, ImagePlus, GripHorizontal, Network, ChevronRight, PanelTop } from 'lucide-react';
import CardImage from '../components/CardImage';

const CARD_WIDTH = 236;
const clamp = value => Math.round(Math.max(16, Math.min(10000, value)));
const isNote = node => !node.image || node.image.includes('photo-1618005182384-a83a8bd57fbe');
const initialPosition = (node, index) => ({
  x: node.positionX ?? 36 + (index % 3) * 278,
  y: node.positionY ?? 34 + Math.floor(index / 3) * 366 + (index % 3 === 1 ? 36 : 0)
});

export default function GalleryPage({ nodes, boards, title = 'Все материалы', onCardClick, onAddIdea, onMove, searchQuery, onClearSearch }) {
  const [drag, setDrag] = useState(null);
  const [pending, setPending] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const positions = new Map(nodes.map((node, index) => [node.id,
    drag?.id === node.id ? { x: drag.x, y: drag.y } : initialPosition(node, index)]));
  const width = Math.max(880, ...Array.from(positions.values(), position => position.x + CARD_WIDTH + 70));
  const height = Math.max(660, ...Array.from(positions.values(), position => position.y + 380));

  const persist = async (id, position) => {
    setPending(ids => [...ids, id]);
    setStatus('Сохранение расположения...');
    setError('');
    try { await onMove(id, position); setStatus('Расположение сохранено'); }
    catch (err) { setError(`Не удалось сохранить расположение: ${err.message}`); setStatus(''); }
    finally { setPending(ids => ids.filter(value => value !== id)); }
  };
  const startDrag = (event, node) => {
    if (event.button !== 0 || pending.includes(node.id)) return;
    event.preventDefault();
    const position = positions.get(node.id);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ id: node.id, x: position.x, y: position.y, initialX: position.x, initialY: position.y, clientX: event.clientX, clientY: event.clientY });
  };
  const moveDrag = event => {
    if (!drag) return;
    setDrag(current => current && ({ ...current,
      x: clamp(current.initialX + event.clientX - current.clientX),
      y: clamp(current.initialY + event.clientY - current.clientY)
    }));
  };
  const finishDrag = () => {
    if (!drag) return;
    const { id, x, y, initialX, initialY } = drag;
    setDrag(null);
    if (x !== initialX || y !== initialY) persist(id, { x, y });
  };
  const moveWithKeys = (event, node) => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!directions[event.key] || pending.includes(node.id)) return;
    event.preventDefault();
    const position = positions.get(node.id);
    const [dx, dy] = directions[event.key];
    const step = event.shiftKey ? 50 : 10;
    persist(node.id, { x: clamp(position.x + dx * step), y: clamp(position.y + dy * step) });
  };

  return <section className="board-page">
    <header className="board-heading">
      <div><p className="board-breadcrumb">Мои темы<ChevronRight size={12} />{title}</p><h1>{title}</h1></div>
      <div className="board-summary"><span>{searchQuery.trim() ? 'Найдено' : 'Материалов'}: {nodes.length}</span><p role="status">{status || 'Перетаскивайте карточки за верхний край'}</p></div>
    </header>
    {error && <p className="layout-error" role="alert">{error}</p>}
    <div className="canvas-layout">
      <aside className="canvas-toolbar" aria-label="Инструменты доски">
        <button onClick={() => onAddIdea('note')}><FileText size={23} /><span>Заметка</span></button>
        <button onClick={() => onAddIdea('image')}><ImagePlus size={23} /><span>Картинка</span></button>
        <hr />
        <NavLink to="/graph"><Network size={23} /><span>Граф</span></NavLink>
      </aside>
      <div className="canvas-viewport" aria-label={`Рабочее поле: ${title}`}>
        {!nodes.length && searchQuery.trim() ? <div className="empty-board"><h2>Ничего не найдено</h2><p>Попробуйте другое слово или выберите другую тему.</p><button onClick={onClearSearch}>Очистить поиск</button></div> : !nodes.length ? <div className="empty-board"><PanelTop size={32} /><h2>Здесь начнётся новая доска</h2><p>Добавьте картинку или запишите первую мысль.</p><button onClick={() => onAddIdea('note')}>Добавить заметку</button></div> :
          <div className="board-surface" style={{ width, height }}>
            {nodes.map(node => {
              const position = positions.get(node.id);
              const note = isNote(node);
              return <article key={node.id} className={`board-card ${note ? 'note-card' : ''} ${drag?.id === node.id ? 'is-dragging' : ''}`}
                style={{ left: position.x, top: position.y }}>
                <button className="card-drag-handle" aria-label={`Переместить: ${node.name}`} title="Перетащите мышью или используйте стрелки клавиатуры"
                  disabled={pending.includes(node.id)} onPointerDown={event => startDrag(event, node)} onPointerMove={moveDrag}
                  onPointerUp={finishDrag} onPointerCancel={() => setDrag(null)} onKeyDown={event => moveWithKeys(event, node)}>
                  <span>{note ? 'Заметка' : 'Изображение'}</span><GripHorizontal size={16} />
                </button>
                <button className="board-card-content" onClick={() => onCardClick(node)}>
                  {!note && <CardImage src={node.image} alt="" className="card-image" />}
                  <div className="card-body"><h2>{node.name}</h2><p className="card-topic-names">{boards.filter(board => node.boardIds.includes(board.id)).map(board => board.name).join(' · ')}</p><p className="card-description">{node.desc || 'Добавьте описание...'}</p>
                    <div className="card-footer"><div className="card-tags">{node.tags.slice(0, 3).map(tag => <span key={tag}>#{tag}</span>)}</div></div>
                  </div>
                </button>
              </article>;
            })}
          </div>}
      </div>
    </div>
  </section>;
}
