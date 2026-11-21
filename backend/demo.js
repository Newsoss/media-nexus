// Готовые материалы для показа приложения на защите.
function seedDemo(db) {
  return db.transaction(() => {
    if (db.prepare('SELECT name FROM app_migrations WHERE name=?').get('festival-demo-v1')) return false;
    const topic = name => db.prepare('SELECT id FROM boards WHERE name=? ORDER BY id LIMIT 1').get(name)?.id ??
      Number(db.prepare('INSERT INTO boards (name) VALUES (?)').run(name).lastInsertRowid);
    const festival = topic('Студенческий фестиваль');
    const visual = topic('Визуальный стиль');
    const cards = [
      { name: 'Референс главной страницы', desc: 'Взять расположение заголовка и основной кнопки. На сайте фестиваля кнопка должна вести к регистрации.', image: 'photo-1507238691740-187a5b1d37b8', tags: ['Фестиваль', 'Референс'], topics: [festival, visual] },
      { name: 'План сайта фестиваля', desc: 'На главной странице нужны программа выступлений, карточки участников и форма регистрации. Сохранённые референсы помогут выбрать расположение блоков.', tags: ['Фестиваль', 'План'], topics: [festival] },
      { name: 'Правила оформления', desc: 'Светлый фон, читаемый текст и один основной цвет для кнопок. Одинаковые отступы помогут объединить страницы сайта.', tags: ['Стиль', 'Типографика'], topics: [visual] },
      { name: 'Эскизы страницы регистрации', desc: 'Пример формы: имя, электронная почта и выбор мероприятия. Кнопка отправки должна быть заметной.', image: 'photo-1581291518857-4e27b48ff24e', tags: ['Фестиваль', 'Форма'], topics: [festival, visual] },
      { name: 'Решение по карточкам участников', desc: 'Использовать изображение, имя участника и короткое описание. Оформление взять из референса, реализацию сделать отдельным компонентом React.', tags: ['Фестиваль', 'React'], topics: [festival, visual] },
      { name: 'Что проверить перед показом', desc: 'Проверить понятность кнопки регистрации, порядок блоков на главной странице и читаемость описаний участников.', tags: ['Фестиваль', 'Проверка'], topics: [festival] }
    ];
    const insertCard = db.prepare('INSERT INTO nodes (name,description,image,tags) VALUES (?,?,?,?)');
    const assign = db.prepare('INSERT INTO node_boards (node_id,board_id) VALUES (?,?)');
    const place = db.prepare('INSERT INTO node_positions (node_id,x,y) VALUES (?,?,?)');
    const ids = cards.map((card, index) => {
      const image = card.image ? `https://images.unsplash.com/${card.image}?w=500&auto=format&fit=crop&q=60` : '';
      const id = Number(insertCard.run(card.name, card.desc, image, JSON.stringify(card.tags)).lastInsertRowid);
      card.topics.forEach(boardId => assign.run(id, boardId));
      place.run(id, 36 + index % 3 * 278, 34 + Math.floor(index / 3) * 390);
      return id;
    });
    const insertLink = db.prepare('INSERT INTO links (source_id,target_id) VALUES (?,?)');
    [[1, 0], [1, 3], [4, 0], [4, 3], [2, 0], [5, 1]].forEach(([a, b]) => insertLink.run(Math.min(ids[a], ids[b]), Math.max(ids[a], ids[b])));
    db.prepare('INSERT INTO app_migrations (name) VALUES (?)').run('festival-demo-v1');
    return true;
  })();
}

if (require.main === module) {
  const { createApp } = require('./server');
  const { db } = createApp(process.env.DATABASE_PATH);
  try {
    console.log(seedDemo(db) ? 'Добавлены 2 темы и 6 карточек. Сценарий показа: docs/DEMO.md.' : 'Демонстрационные материалы уже добавлены. Повторные копии не создаются.');
  } finally { db.close(); }
}
module.exports = { seedDemo };
