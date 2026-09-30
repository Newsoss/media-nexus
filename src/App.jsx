import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import GraphPage from './pages/GraphPage';
import CreateIdeaModal from './components/CreateIdeaModal';
import CardDetailModal from './components/CardDetailModal';
import { INITIAL_NODES, INITIAL_LINKS } from './data/mockData';

export default function App() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleAddIdea = (newNode, targetNodeId) => {
    setNodes((prev) => [...prev, newNode]);
    if (targetNodeId) {
      setLinks((prev) => [...prev, { source: newNode.id, target: targetNodeId }]);
    }
  };

  // удаление узла и связанных с ним линий
  const handleDeleteCard = (cardId) => {
    setNodes((prev) => prev.filter((n) => n.id !== cardId));
    setLinks((prev) => prev.filter((l) => {
      const src = l.source?.id ?? l.source;
      const tgt = l.target?.id ?? l.target;
      return src !== cardId && tgt !== cardId;
    }));
    setSelectedCard(null);
  };

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