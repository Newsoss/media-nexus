import { useState } from 'react';
import { X, Link2 } from 'lucide-react';

export default function CreateIdeaModal({ isOpen, onClose, nodes, onAddIdea }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [linkedNodeId, setLinkedNodeId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newNode = {
      id: Date.now(),
      name: title,
      desc,
      image: image.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : ['Идея'],
      val: 12,
      color: '#818cf8'
    };

    onAddIdea(newNode, linkedNodeId ? Number(linkedNodeId) : null);
    
    setTitle('');
    setDesc('');
    setImage('');
    setTags('');
    setLinkedNodeId('');
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Новая карточка</h2>
          <button style={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Название идеи:
            <input 
              style={styles.input}
              placeholder="Напр. Палитра сайта" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </label>

          <label style={styles.label}>
            Описание / Заметка:
            <textarea 
              style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
              placeholder="Коротко о сути..." 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
            />
          </label>

          <label style={styles.label}>
            Ссылка на изображение (URL):
            <input 
              style={styles.input}
              placeholder="https://..." 
              value={image} 
              onChange={(e) => setImage(e.target.value)} 
            />
          </label>

          <label style={styles.label}>
            Теги (через запятую):
            <input 
              style={styles.input}
              placeholder="UI/UX, Дизайн, Референс" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
            />
          </label>

          <label style={styles.label}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Link2 size={14} color="#818cf8" /> Связать с существующей идеей:
            </span>
            <select 
              style={styles.input}
              value={linkedNodeId} 
              onChange={(e) => setLinkedNodeId(e.target.value)}
            >
              <option value="">Без связи</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </label>

          <button type="submit" style={styles.submitBtn}>Добавить в базу</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#161922',
    border: '1px solid #232733',
    borderRadius: '12px',
    width: '440px',
    padding: '24px',
    color: '#fff'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px',
    color: '#94a3b8'
  },
  input: {
    backgroundColor: '#0f1117',
    border: '1px solid #282d3d',
    borderRadius: '8px',
    padding: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '6px'
  }
};