import { useState } from 'react';
import Modal from './Modal';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export default function CreateIdeaModal({ card, nodes, links, boards, defaultBoardId, startWithImage, onClose, onSave, onCreateTopic }) {
  const [name, setName] = useState(card?.name || '');
  const [desc, setDesc] = useState(card?.desc || '');
  const [image, setImage] = useState(card?.image || '');
  const [fileName, setFileName] = useState(card?.image?.startsWith('data:') ? 'Сохранённое изображение' : '');
  const [tags, setTags] = useState(card?.tags.join(', ') || '');
  const [boardIds, setBoardIds] = useState(card ? card.boardIds : defaultBoardId ? [defaultBoardId] : []);
  const [linkedNodeIds, setLinkedNodeIds] = useState(() => card ? links
    .filter(link => link.source === card.id || link.target === card.id)
    .map(link => link.source === card.id ? link.target : link.source) : []);
  const [saving, setSaving] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [error, setError] = useState('');
  const [topicName, setTopicName] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [topicError, setTopicError] = useState('');
  const addTopic = async () => {
    if (!topicName.trim() || creatingTopic) return;
    setCreatingTopic(true);
    setTopicError('');
    try {
      const id = await onCreateTopic(topicName);
      setBoardIds(ids => ids.includes(id) ? ids : [...ids, id]);
      setTopicName('');
    } catch (err) { setTopicError(err.message); }
    finally { setCreatingTopic(false); }
  };
  const busy = saving || readingImage || creatingTopic;
  const close = () => { if (!busy) onClose(); };
  const chooseFile = event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) { setError('Выберите JPG, PNG, WebP, GIF или AVIF.'); return; }
    if (file.size > MAX_IMAGE_SIZE) { setError('Изображение должно быть не больше 4 МБ.'); return; }
    setError('');
    setReadingImage(true);
    const reader = new FileReader();
    reader.onload = () => { setImage(String(reader.result)); setFileName(file.name); setReadingImage(false); };
    reader.onerror = () => { setError('Не удалось прочитать файл. Выберите его ещё раз.'); setReadingImage(false); };
    reader.readAsDataURL(file);
  };
  const submit = async event => {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), desc, image, tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        boardIds, linkedNodeIds });
    } catch (err) { setError(err.message); setSaving(false); }
  };
  const candidates = nodes.filter(node => node.id !== card?.id);
  return <Modal title={card ? 'Редактирование карточки' : startWithImage ? 'Добавить изображение' : 'Новая заметка'} onClose={close}>
    <form onSubmit={submit} className="card-form">
      <fieldset disabled={busy} className="form-fields">
        <label>Название<input value={name} onChange={event => setName(event.target.value)} required maxLength={200} autoFocus /></label>
        <label>Заметка<textarea value={desc} onChange={event => setDesc(event.target.value)} rows={4} /></label>
        <div className="image-fields">
          <label>Картинка с компьютера<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={chooseFile} /></label>
          <p className="muted">JPG, PNG, WebP, GIF или AVIF, до 4 МБ. Картинка сохранится вместе с карточкой.</p>
          {fileName && <p className="chosen-file">{fileName}</p>}
          <label>Или прямая ссылка на картинку<input type="url" value={image.startsWith('data:') ? '' : image}
            onChange={event => { setImage(event.target.value); setFileName(''); }} placeholder="https://..." /></label>
          {image && <button className="text-button" type="button" onClick={() => { setImage(''); setFileName(''); }}>Убрать изображение</button>}
        </div>
        <label>Теги через запятую<input value={tags} onChange={event => setTags(event.target.value)} placeholder="Дизайн, Референс" /></label>
        <fieldset className="connections topic-options"><legend>Темы</legend>
          <p className="muted">Можно выбрать несколько. Без выбора карточка останется во «Всех материалах».</p>
          <div className="topic-list">{boards.map(board => <label key={board.id} className="checkbox-label">
            <input type="checkbox" checked={boardIds.includes(board.id)} onChange={event => setBoardIds(ids => event.target.checked ? [...ids, board.id] : ids.filter(id => id !== board.id))} />
            {board.name}
          </label>)}
          </div>
          <div className="new-topic-row">
            <label>Название новой темы<input value={topicName} onChange={event => setTopicName(event.target.value)} maxLength={200}
              placeholder="Например, Фотография" onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTopic(); } }} /></label>
            <button type="button" onClick={addTopic} disabled={creatingTopic || !topicName.trim()}>{creatingTopic ? 'Добавление...' : 'Добавить тему'}</button>
          </div>
          {topicError && <p role="alert" className="error-message">{topicError}</p>}
        </fieldset>
        <fieldset className="connections"><legend>Связанные карточки</legend>
          <p className="muted">Отметьте нужные карточки. Снимите отметку, чтобы удалить связь.</p>
          <div className="connection-options">{candidates.length ? candidates.map(node => <label key={node.id} className="checkbox-label">
            <input type="checkbox" checked={linkedNodeIds.includes(node.id)} onChange={event => setLinkedNodeIds(ids => event.target.checked ? [...ids, node.id] : ids.filter(id => id !== node.id))} />
            {node.name}
          </label>) : <p className="muted">Пока нет других карточек.</p>}</div>
        </fieldset>
      </fieldset>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="actions"><button type="button" onClick={close} disabled={busy}>Отмена</button><button className="primary" disabled={busy || !name.trim()}>{readingImage ? 'Чтение файла...' : saving ? 'Сохранение...' : 'Сохранить'}</button></div>
    </form>
  </Modal>;
}
