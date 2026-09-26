import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GalleryPage from './pages/GalleryPage';
import GraphPage from './pages/GraphPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/graph" element={<GraphPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}