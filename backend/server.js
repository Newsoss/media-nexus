const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = 5000;

// создаем или открываем локальный файл базы
const db = new Database('media_nexus.db');

app.use(cors());
app.use(express.json());

// создаем таблицы если их еще нет
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    tags TEXT,
    val INTEGER DEFAULT 12,
    color TEXT DEFAULT '#818cf8'
  );

  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE
  );
`);

// стартовые данные при первом запуске
const check = db.prepare('SELECT COUNT(*) as count FROM nodes').get();
if (check.count === 0) {
  const insertNode = db.prepare('INSERT INTO nodes (name, description, image, tags, val, color) VALUES (?, ?, ?, ?, ?, ?)');
  const n1 = insertNode.run('Минимализм в веб-дизайне', 'Референс компоновки карточек и цветовых акцентов', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60', JSON.stringify(['UI/UX', 'Сетка']), 14, '#818cf8').lastInsertRowid;
  const n2 = insertNode.run('Архитектура микросервисов', 'Диаграмма взаимодействия Node.js и SQLite', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60', JSON.stringify(['Backend', 'SQLite']), 16, '#38bdf8').lastInsertRowid;
  const n3 = insertNode.run('Киберпанк палитра', 'Неоновые градиенты для будущей темы оформления', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60', JSON.stringify(['Inspiration', 'Цвет']), 10, '#f43f5e').lastInsertRowid;
  const n4 = insertNode.run('Дизайн-система компонентов', 'Набор кнопок, модалок и карточек для интерфейса', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&auto=format&fit=crop&q=60', JSON.stringify(['UI/UX', 'React']), 12, '#a855f7').lastInsertRowid;

  const insertLink = db.prepare('INSERT INTO links (source_id, target_id) VALUES (?, ?)');
  insertLink.run(n1, n4);
  insertLink.run(n1, n3);
  insertLink.run(n2, n4);
}

// отдать карточки и связи на фронтенд
app.get('/api/data', (req, res) => {
  try {
    const rawNodes = db.prepare('SELECT * FROM nodes ORDER BY id ASC').all();
    const links = db.prepare('SELECT id, source_id AS source, target_id AS target FROM links').all();

    const nodes = rawNodes.map(r => ({
      id: r.id,
      name: r.name,
      desc: r.description,
      image: r.image,
      tags: r.tags ? JSON.parse(r.tags) : [],
      val: r.val,
      color: r.color
    }));

    res.json({ nodes, links });
  } catch (err) {
    console.error('ошибка sqlite:', err);
    res.status(500).json({ error: 'ошибка бд' });
  }
});

// создать карточку
app.post('/api/nodes', (req, res) => {
  const { name, desc, image, tags, targetNodeId } = req.body;
  if (!name) return res.status(400).json({ error: 'нет названия' });

  try {
    const insertNode = db.prepare(`
      INSERT INTO nodes (name, description, image, tags, val, color)
      VALUES (?, ?, ?, ?, 12, '#818cf8')
    `);

    const result = insertNode.run(
      name,
      desc || '',
      image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
      JSON.stringify(tags || [])
    );

    const newId = Number(result.lastInsertRowid);
    let createdLink = null;

    if (targetNodeId) {
      const insertLink = db.prepare('INSERT INTO links (source_id, target_id) VALUES (?, ?)');
      const linkRes = insertLink.run(newId, Number(targetNodeId));
      createdLink = { id: Number(linkRes.lastInsertRowid), source: newId, target: Number(targetNodeId) };
    }

    res.status(201).json({
      node: {
        id: newId,
        name,
        desc: desc || '',
        image: image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
        tags: tags || [],
        val: 12,
        color: '#818cf8'
      },
      link: createdLink
    });
  } catch (err) {
    console.error('ошибка добавления:', err);
    res.status(500).json({ error: 'ошибка добавления' });
  }
});

// удалить карточку
app.delete('/api/nodes/:id', (req, res) => {
  const id = Number(req.params.id);
  try {
    db.prepare('DELETE FROM links WHERE source_id = ? OR target_id = ?').run(id, id);
    const result = db.prepare('DELETE FROM nodes WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'не найдено' });
    }

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('ошибка удаления:', err);
    res.status(500).json({ error: 'ошибка удаления' });
  }
});

app.listen(PORT, () => {
  console.log(`бэкенд на sqlite запущен на http://localhost:${PORT}`);
});