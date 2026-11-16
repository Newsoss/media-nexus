const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('node:path');

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

function createApp(databasePath = path.join(__dirname, 'media_nexus.db'), { seedExamples = true } = {}) {
  const db = new Database(databasePath);
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      tags TEXT,
      val INTEGER DEFAULT 12,
      color TEXT DEFAULT '#818cf8',
      board_id INTEGER REFERENCES boards(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      target_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE
    );
  `);

  db.exec(`CREATE TABLE IF NOT EXISTS node_positions (
    node_id INTEGER PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
    x REAL NOT NULL,
    y REAL NOT NULL
  )`);

  // Добавляем доски в старую базу без удаления карточек и связей.
  if (!db.prepare('PRAGMA table_info(nodes)').all().some(column => column.name === 'board_id')) {
    db.exec('ALTER TABLE nodes ADD COLUMN board_id INTEGER REFERENCES boards(id) ON DELETE SET NULL');
  }

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


  db.exec(`
    CREATE TABLE IF NOT EXISTS node_boards (
      node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
      board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      PRIMARY KEY (node_id, board_id)
    );
    CREATE TABLE IF NOT EXISTS app_migrations (name TEXT PRIMARY KEY);
  `);
  // Старые назначения переносим один раз, иначе удалённая тема вернулась бы после перезапуска.
  db.transaction(() => {
    if (!db.prepare('SELECT name FROM app_migrations WHERE name=?').get('multiple-topics')) {
      db.exec('INSERT OR IGNORE INTO node_boards (node_id, board_id) SELECT nodes.id, nodes.board_id FROM nodes JOIN boards ON boards.id=nodes.board_id');
      db.prepare('INSERT INTO app_migrations (name) VALUES (?)').run('multiple-topics');
    }
    if (seedExamples && !db.prepare('SELECT name FROM app_migrations WHERE name=?').get('topic-examples')) {
      const topic = name => {
        const existing = db.prepare('SELECT id FROM boards WHERE name=? ORDER BY id LIMIT 1').get(name);
        return existing?.id ?? Number(db.prepare('INSERT INTO boards (name) VALUES (?)').run(name).lastInsertRowid);
      };
      const design = topic('Веб-дизайн');
      const development = topic('Разработка');
      const insert = db.prepare('INSERT INTO nodes (name, description, image, tags) VALUES (?, ?, ?, ?)');
      const reference = Number(insert.run('Главная страница — референсы', 'Пример: собрать варианты первого экрана, выбрать шрифт и расположение карточек.', '', JSON.stringify(['Пример', 'Референсы'])).lastInsertRowid);
      const component = Number(insert.run('Компоненты карточки', 'Пример на стыке двух тем: внешний вид карточки относится к веб-дизайну, а реализация компонента на React — к разработке.', '', JSON.stringify(['Пример', 'React'])).lastInsertRowid);
      const assign = db.prepare('INSERT OR IGNORE INTO node_boards (node_id, board_id) VALUES (?, ?)');
      assign.run(reference, design);
      assign.run(component, design);
      assign.run(component, development);
      db.prepare('INSERT INTO links (source_id, target_id) VALUES (?, ?)').run(reference, component);
      // Распределяем только исходные демонстрационные материалы, пользовательские не меняем.
      for (const name of ['Минимализм в веб-дизайне', 'Киберпанк палитра', 'Дизайн-система компонентов']) {
        const node = db.prepare('SELECT id FROM nodes WHERE name=? AND NOT EXISTS (SELECT 1 FROM node_boards WHERE node_id=nodes.id) ORDER BY id LIMIT 1').get(name);
        if (node) assign.run(node.id, design);
      }
      const backend = db.prepare('SELECT id FROM nodes WHERE name=? AND NOT EXISTS (SELECT 1 FROM node_boards WHERE node_id=nodes.id) ORDER BY id LIMIT 1').get('Архитектура микросервисов');
      if (backend) assign.run(backend.id, development);
      db.prepare('INSERT INTO app_migrations (name) VALUES (?)').run('topic-examples');
    }
  })();

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '6mb' }));

  const snapshot = () => {
    const memberships = new Map();
    db.prepare('SELECT node_id, board_id FROM node_boards ORDER BY board_id').all().forEach(row => {
      if (!memberships.has(row.node_id)) memberships.set(row.node_id, []);
      memberships.get(row.node_id).push(row.board_id);
    });
    return {
      nodes: db.prepare('SELECT nodes.*, node_positions.x AS position_x, node_positions.y AS position_y FROM nodes LEFT JOIN node_positions ON nodes.id=node_positions.node_id ORDER BY nodes.id').all().map(row => {
        const boardIds = memberships.get(row.id) || [];
        return { id: row.id, name: row.name, desc: row.description, image: row.image,
          tags: row.tags ? JSON.parse(row.tags) : [], val: row.val, color: row.color,
          boardIds, boardId: boardIds[0] ?? null, positionX: row.position_x, positionY: row.position_y };
      }),
      links: db.prepare('SELECT id, source_id AS source, target_id AS target FROM links ORDER BY id').all(),
      boards: db.prepare('SELECT * FROM boards ORDER BY id').all()
    };
  };
  const fail = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    throw error;
  };
  const idFrom = value => {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) fail('Некорректный идентификатор');
    return id;
  };
  const requireNode = id => {
    if (!db.prepare('SELECT id FROM nodes WHERE id = ?').get(id)) fail('Карточка не найдена', 404);
  };
  const requireBoard = id => {
    if (!db.prepare('SELECT id FROM boards WHERE id = ?').get(id)) fail('Доска не найдена', 404);
  };
  const titleFrom = value => {
    if (typeof value !== 'string' || !value.trim()) fail('Укажите название');
    if (value.trim().length > 200) fail('Название должно быть не длиннее 200 символов');
    return value.trim();
  };
  const cardFrom = (body, nodeId) => {
    const name = titleFrom(body.name);
    if (body.desc != null && typeof body.desc !== 'string') fail('Описание должно быть текстом');
    if (body.image != null && typeof body.image !== 'string') fail('Некорректная ссылка на изображение');
    const image = body.image?.trim() || '';
    if (image.startsWith('data:')) {
      const match = /^data:image\/(png|jpeg|webp|gif|avif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
      if (!match || match[2].length % 4 !== 0) fail('Некорректный файл изображения');
      if (Buffer.byteLength(match[2], 'base64') > MAX_IMAGE_SIZE) fail('Изображение должно быть не больше 4 МБ', 413);
    } else if (image) {
      try {
        if (!['http:', 'https:'].includes(new URL(image).protocol)) fail('Нужна ссылка http или https');
      } catch { fail('Укажите корректную ссылку на изображение'); }
    }
    const tags = body.tags ?? [];
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) fail('Некорректные теги');
    const requestedBoards = body.boardIds ?? (body.boardId == null || body.boardId === '' ? [] : [body.boardId]);
    if (!Array.isArray(requestedBoards)) fail('Некорректный список тем');
    const boardIds = [...new Set(requestedBoards.map(idFrom))];
    boardIds.forEach(requireBoard);
    const boardId = boardIds[0] ?? null;
    // Поддерживаем старый запрос создания с targetNodeId.
    const requestedIds = body.linkedNodeIds ?? (body.targetNodeId ? [body.targetNodeId] : []);
    if (!Array.isArray(requestedIds)) fail('Некорректный список связей');
    const linkedNodeIds = [...new Set(requestedIds.map(idFrom))];
    linkedNodeIds.forEach(id => {
      if (id === nodeId) fail('Нельзя связать карточку с самой собой');
      requireNode(id);
    });
    return { name, desc: body.desc || '', image, tags: [...new Set(tags.map(tag => tag.trim()).filter(Boolean))], boardId, boardIds, linkedNodeIds };
  };
  const replaceTopics = (id, boardIds) => {
    db.prepare('DELETE FROM node_boards WHERE node_id=?').run(id);
    const insert = db.prepare('INSERT INTO node_boards (node_id, board_id) VALUES (?, ?)');
    boardIds.forEach(boardId => insert.run(id, boardId));
  };
  const replaceLinks = (id, targets) => {
    db.prepare('DELETE FROM links WHERE source_id = ? OR target_id = ?').run(id, id);
    const insert = db.prepare('INSERT INTO links (source_id, target_id) VALUES (?, ?)');
    targets.forEach(target => insert.run(Math.min(id, target), Math.max(id, target)));
  };

  app.patch('/api/nodes/:id/position', (req, res) => {
    const id = idFrom(req.params.id);
    requireNode(id);
    const { x, y } = req.body;
    if (![x, y].every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10000)) {
      fail('Некорректное положение карточки');
    }
    db.prepare('INSERT INTO node_positions (node_id, x, y) VALUES (?, ?, ?) ON CONFLICT(node_id) DO UPDATE SET x=excluded.x, y=excluded.y').run(id, x, y);
    res.json({ id, x, y });
  });

  app.get('/api/data', (req, res) => res.json(snapshot()));
  app.post('/api/nodes', (req, res) => {
    const card = cardFrom(req.body);
    db.transaction(() => {
      const result = db.prepare(`INSERT INTO nodes (name, description, image, tags, board_id) VALUES (?, ?, ?, ?, ?)`)
        .run(card.name, card.desc, card.image, JSON.stringify(card.tags), card.boardId);
      replaceTopics(Number(result.lastInsertRowid), card.boardIds);
      replaceLinks(Number(result.lastInsertRowid), card.linkedNodeIds);
    })();
    res.status(201).json(snapshot());
  });
  app.put('/api/nodes/:id', (req, res) => {
    const id = idFrom(req.params.id);
    requireNode(id);
    const card = cardFrom(req.body, id);
    db.transaction(() => {
      db.prepare('UPDATE nodes SET name = ?, description = ?, image = ?, tags = ?, board_id = ? WHERE id = ?')
        .run(card.name, card.desc, card.image, JSON.stringify(card.tags), card.boardId, id);
      replaceTopics(id, card.boardIds);
      replaceLinks(id, card.linkedNodeIds);
    })();
    res.json(snapshot());
  });
  app.delete('/api/nodes/:id', (req, res) => {
    const id = idFrom(req.params.id);
    requireNode(id);
    db.transaction(() => {
      db.prepare('DELETE FROM links WHERE source_id = ? OR target_id = ?').run(id, id);
      db.prepare('DELETE FROM nodes WHERE id = ?').run(id);
    })();
    res.json(snapshot());
  });
  app.post('/api/boards', (req, res) => {
    const name = titleFrom(req.body.name);
    db.prepare('INSERT INTO boards (name) VALUES (?)').run(name);
    res.status(201).json(snapshot());
  });
  app.put('/api/boards/:id', (req, res) => {
    const id = idFrom(req.params.id);
    requireBoard(id);
    db.prepare('UPDATE boards SET name = ? WHERE id = ?').run(titleFrom(req.body.name), id);
    res.json(snapshot());
  });
  app.delete('/api/boards/:id', (req, res) => {
    const id = idFrom(req.params.id);
    requireBoard(id);
    db.transaction(() => {
      db.prepare('UPDATE nodes SET board_id = NULL WHERE board_id = ?').run(id);
      db.prepare('DELETE FROM boards WHERE id = ?').run(id);
    })();
    res.json(snapshot());
  });
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (!err.status) console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Не удалось выполнить операцию' });
  });
  return { app, db };
}

if (require.main === module) {
  const { app } = createApp(process.env.DATABASE_PATH);
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Сервер запущен на http://localhost:${port}`));
}
module.exports = { createApp };
