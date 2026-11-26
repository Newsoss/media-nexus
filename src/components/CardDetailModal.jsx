import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import Modal from './Modal';
import CardImage from './CardImage';

export default function CardDetailModal({ card, nodes, links, boards, onClose, onDelete, onEdit, onNavigate }) {
  const connectedIds = new Set(links.filter(link => link.source === card.id || link.target === card.id)
    .map(link => link.source === card.id ? link.target : link.source));
  const connectedNodes = nodes.filter(node => connectedIds.has(node.id));
  return <Modal title={card.name} onClose={onClose}>
    <CardImage src={card.image} alt={card.name} className="detail-image" />
    <div className="detail-body">
      <p className="muted">Темы: {boards.filter(board => card.boardIds.includes(board.id)).map(board => board.name).join(', ') || 'Не выбраны'}</p>
      <p className="detail-description">{card.desc || 'Описание пока не добавлено.'}</p>
      <div className="detail-tags">{card.tags.map(tag => <span key={tag}>#{tag}</span>)}</div>
      <section className="relations"><h3>Связанные идеи · {connectedNodes.length}</h3>
        {connectedNodes.length ? connectedNodes.map(node => <button key={node.id} className="relation-button" onClick={() => onNavigate(node.id)}>
          <CardImage src={node.image} alt="" className="relation-thumb" /><span>{node.name}</span><ArrowRight size={16} />
        </button>) : <p className="muted">Нет связей. Добавьте их при редактировании.</p>}
      </section>
      <div className="actions"><button className="danger" onClick={() => onDelete(card.id)}><Trash2 size={16} />Удалить</button>
        <button className="primary" onClick={onEdit}><Pencil size={16} />Редактировать</button></div>
    </div>
  </Modal>;
}
