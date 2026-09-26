export const INITIAL_NODES = [
  { 
    id: 1, 
    name: 'Минимализм в веб-дизайне', 
    tags: ['UI/UX', 'Сетка'],
    desc: 'Референс компоновки карточек и цветовых акцентов.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
    val: 14,
    color: '#818cf8' 
  },
  { 
    id: 2, 
    name: 'Архитектура микросервисов', 
    tags: ['Backend', 'Postgres'],
    desc: 'Диаграмма взаимодействия Node.js и PostgreSQL.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
    val: 16,
    color: '#38bdf8' 
  },
  { 
    id: 3, 
    name: 'Киберпанк палитра', 
    tags: ['Inspiration', 'Цвет'],
    desc: 'Неоновые градиенты для будущей темы оформления.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60',
    val: 10,
    color: '#f43f5e' 
  },
  { 
    id: 4, 
    name: 'Дизайн-система компонентов', 
    tags: ['UI/UX', 'React'],
    desc: 'Набор кнопок, модалок и карточек для интерфейса.',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&auto=format&fit=crop&q=60',
    val: 12,
    color: '#a855f7' 
  }
];

export const INITIAL_LINKS = [
  { source: 1, target: 4 },
  { source: 1, target: 3 },
  { source: 2, target: 4 }
];