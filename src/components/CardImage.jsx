import { useState } from 'react';

// Эти фотографии уже использовались в стартовых карточках. Теперь они лежат в проекте.
const examples = {
  '/photo-1507238691740-187a5b1d37b8': 'web-design.jpg',
  '/photo-1558494949-ef010cbdcc31': 'servers.jpg',
  '/photo-1518770660439-4636190af475': 'electronics.jpg',
  '/photo-1581291518857-4e27b48ff24e': 'design-notes.jpg'
};

function localImage(src) {
  if (!src) return '';
  try {
    const url = new URL(src);
    if (url.hostname === 'images.unsplash.com') {
      if (examples[url.pathname]) return `${import.meta.env.BASE_URL}images/${examples[url.pathname]}`;
      if (url.pathname === '/photo-1618005182384-a83a8bd57fbe') return '';
    }
  } catch { /* Неработающую ссылку обработает onError. */ }
  return src;
}

function ImageContent({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  const resolved = localImage(src);
  if (!resolved) return null;
  if (failed) return <div className={`${className} image-placeholder`} role="img" aria-label="Изображение недоступно">
    <span>Изображение недоступно</span>
    <small>Откройте редактирование и выберите другой файл или ссылку.</small>
  </div>;
  return <img src={resolved} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}

export default function CardImage(props) {
  return <ImageContent key={props.src || 'empty'} {...props} />;
}
