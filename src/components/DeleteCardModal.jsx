import { useState } from 'react';
import Modal from './Modal';

export default function DeleteCardModal({ card, onClose, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const close = () => { if (!busy) onClose(); };
  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try { await onDelete(card.id); }
    catch (err) { setError(err.message); setBusy(false); }
  };
  return <Modal title="Удалить карточку?" onClose={close}>
    <div className="detail-body">
      <p className="delete-description">Карточка «{card.name}» будет удалена из всех тем вместе с её связями. Отменить удаление нельзя.</p>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="actions"><button onClick={close} disabled={busy}>Отмена</button><button className="danger" onClick={remove} disabled={busy}>{busy ? 'Удаление...' : 'Удалить карточку'}</button></div>
    </div>
  </Modal>;
}
