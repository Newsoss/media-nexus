import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import GraphPage from './pages/GraphPage';
import CreateIdeaModal from './components/CreateIdeaModal';
import CardDetailModal from './components/CardDetailModal';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);

  // забираем данные из sqlite при открытии сайта
  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/data`);
      const data = await res.json();
      setNodes(data.nodes || []);
      setLinks(data.links || []);
    } catch (err) {
      console.error('ошибка загрузки из бд:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // добавление карточки в sqlite
  const handleAddIdea = async (newNode, targetNodeId) => {
    try {
      const res = await fetch(`${API_URL}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newNode.name,
          desc: newNode.desc,
          image: newNode.image,
          tags: newNode.tags,
          targetNodeId: targetNodeId || null
        })
      });

      if (!res.ok) throw new Error('ошибка сервера');
      const data = await res.json();

      setNodes((prev) => [...prev, data.node]);
      if (data.link) {
        setLinks((prev) => [...prev, data.link]);
      }
    } catch (err) {
      console.error('не вышло добавить узел:', err);
    }
  };

  // удаление карточки из sqlite
  const handleDeleteCard = async (cardId) => {
    try {
      const res = await fetch(`${API_URL}/nodes/${cardId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('ошибка при удалении');

      setNodes((prev) => prev.filter((n) => n.id !== cardId));
      setLinks((prev) => prev.filter((l) => {
        const src = l.source?.id ?? l.source;
        const tgt = l.target?.id ?? l.target;
        return src !== cardId && tgt !== cardId;
      }));
      setSelectedCard(null);
    } catch (err) {
      console.error('не удалось удалить:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>
        загрузка данных из базы...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar onAddClick={() => setIsModalOpen(true)} />
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <GalleryPage 
                nodes={nodes} 
                links={links} 
                onCardClick={(card) => setSelectedCard(card)} 
              />
            } 
          />
          <Route path="/graph" element={<GraphPage nodes={nodes} links={links} />} />
        </Routes>
      </main>

      <CreateIdeaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        nodes={nodes}
        onAddIdea={handleAddIdea}
      />

      <CardDetailModal
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        nodes={nodes}
        links={links}
        onDelete={handleDeleteCard}
      />
    </BrowserRouter>
  );
}