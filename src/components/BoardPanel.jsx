import { useState } from 'react';
import Modal from './Modal';

export default function BoardPanel({ boards, nodes, activeBoard, onSelect, onMutate }) {
  const [form, setForm] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = boards.find(board => board.id === activeBoard);
  const open = mode => { setForm(mode); setName(mode === 'new' ? '' : active.name); setError(''); };
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await onMutate(form === 'new' ? '/boards' : `/boards/${active.id}`, {
        method: form === 'delete' ? 'DELETE' : form === 'new' ? 'POST' : 'PUT',
        ...(form !== 'delete' && { body: { name: name.trim() } })
      });
      if (form === 'new') onSelect(result.boards.at(-1).id);
      if (form === 'delete') onSelect('all');
      setForm(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const count = id => nodes.filter(node => node.boardIds.includes(id)).length;
  return <aside className="board-panel" aria-label="Темы материалов">
    <p className="sidebar-label">Мои темы</p>
    <div className="board-tabs">
      <button aria-pressed={activeBoard === 'all'} onClick={() => onSelect('all')}><span>Все материалы</span><span>{nodes.length}</span></button>
      <div className="board-divider" />
      {boards.map(board => <button key={board.id} aria-pressed={activeBoard === board.id} onClick={() => onSelect(board.id)}><span>{board.name}</span><span>{count(board.id)}</span></button>)}
      <button className="new-board" onClick={() => open('new')}>+ Добавить тему</button>
    </div>
    {active && <div className="board-tools"><button onClick={() => open('rename')}>Переименовать тему</button><button onClick={() => open('delete')}>Удалить тему</button></div>}
    {form && <Modal title={form === 'new' ? 'Новая тема' : form === 'delete' ? 'Удалить тему?' : 'Переименовать тему'} onClose={() => { if (!busy) setForm(null); }}>
      <form className="card-form" onSubmit={submit}>
        {form === 'delete' ? <p>Тема «{active.name}» будет удалена. Карточки останутся во «Всех материалах» и в других выбранных темах.</p>
          : <label>Название темы<input autoFocus required maxLength={200} value={name} onChange={event => setName(event.target.value)} disabled={busy} /></label>}
        {error && <p className="error-message" role="alert">{error}</p>}
        <div className="actions"><button type="button" disabled={busy} onClick={() => setForm(null)}>Отмена</button><button className={form === 'delete' ? 'danger' : 'primary'} disabled={busy || (form !== 'delete' && !name.trim())}>{busy ? 'Сохранение...' : form === 'delete' ? 'Удалить тему' : 'Сохранить'}</button></div>
      </form>
    </Modal>}
  </aside>;
}
