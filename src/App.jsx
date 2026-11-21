import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import GraphPage from './pages/GraphPage';
import CreateIdeaModal from './components/CreateIdeaModal';
import CardDetailModal from './components/CardDetailModal';
import BoardPanel from './components/BoardPanel';
import { request } from './api';

export default function App() {
  const [data, setData] = useState({ nodes: [], links: [], boards: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [activeBoard, setActiveBoard] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editor, setEditor] = useState(null);
  const { nodes, links, boards } = data;

  useEffect(() => {
    const controller = new AbortController();
    request('/data', { signal: controller.signal }).then(result => {
      setData(result);
      setError('');
      setLoading(false);
    }).catch(err => {
      if (err.name !== 'AbortError') {
        setError('Не удалось загрузить материалы. Проверьте, запущен ли сервер.');
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [reload]);

  const mutate = async (path, options) => {
    const result = await request(path, options);
    setData(result);
    return result;
  };
  const createTopic = async name => {
    const existing = boards.find(board => board.name.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase());
    if (existing) return existing.id;
    const result = await mutate('/boards', { method: 'POST', body: { name: name.trim() } });
    return result.boards.at(-1).id;
  };
  const saveCard = async card => {
    await mutate(editor.card ? `/nodes/${editor.card.id}` : '/nodes', {
      method: editor.card ? 'PUT' : 'POST', body: card
    });
    setEditor(null);
  };
  const moveCard = async (id, position) => {
    const original = nodes.find(node => node.id === id);
    setData(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? {
      ...node, positionX: position.x, positionY: position.y
    } : node) }));
    try {
      await request(`/nodes/${id}/position`, { method: 'PATCH', body: position });
    } catch (err) {
      setData(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? {
        ...node, positionX: original.positionX, positionY: original.positionY
      } : node) }));
      throw err;
    }
  };
  const deleteCard = async id => {
    await mutate(`/nodes/${id}`, { method: 'DELETE' });
    setSelectedId(null);
  };
  const visibleNodes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return nodes.filter(node => (activeBoard === 'all' || node.boardIds.includes(activeBoard)) &&
      (!query || [node.name, node.desc, ...node.tags].join(' ').toLowerCase().includes(query)));
  }, [nodes, activeBoard, searchQuery]);
  const visibleLinks = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map(node => node.id));
    return links.filter(link => visibleIds.has(link.source) && visibleIds.has(link.target));
  }, [links, visibleNodes]);
  const selectedCard = nodes.find(node => node.id === selectedId);
  const boardName = activeBoard === 'all' ? 'Все материалы' : boards.find(board => board.id === activeBoard)?.name;

  if (loading) return <p className="status-message">Загрузка материалов...</p>;
  if (error) return <div className="status-message"><p role="alert">{error}</p><button onClick={() => setReload(value => value + 1)}>Повторить</button></div>;

  return (
    <BrowserRouter>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddClick={() => setEditor({ card: null })} />
      <div className="workspace">
      <BoardPanel boards={boards} nodes={nodes} activeBoard={activeBoard} onSelect={setActiveBoard} onMutate={mutate} />
      <main className="workspace-main">
        <Routes>
          <Route path="/" element={<GalleryPage searchQuery={searchQuery} onClearSearch={() => setSearchQuery('')} key={activeBoard} onAddIdea={kind => setEditor({ card: null, kind })} onMove={moveCard} nodes={visibleNodes} boards={boards} title={boardName} onCardClick={card => setSelectedId(card.id)} />} />
          <Route path="/graph" element={<GraphPage searchQuery={searchQuery} nodes={visibleNodes} links={visibleLinks} onCardClick={card => setSelectedId(card.id)} />} />
        </Routes>
      </main>
      </div>
      {editor && <CreateIdeaModal key={editor.card?.id || 'new'} card={editor.card} nodes={nodes} links={links} boards={boards}
        startWithImage={editor.kind === 'image'} defaultBoardId={typeof activeBoard === 'number' ? activeBoard : null} onClose={() => setEditor(null)} onSave={saveCard} onCreateTopic={createTopic} />}
      {!editor && selectedCard && <CardDetailModal key={selectedCard.id} card={selectedCard} nodes={nodes} links={links} boards={boards}
        onClose={() => setSelectedId(null)} onDelete={deleteCard} onEdit={() => setEditor({ card: selectedCard })} onNavigate={setSelectedId} />}
    </BrowserRouter>
  );
}
