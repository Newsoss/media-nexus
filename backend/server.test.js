const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const Database = require('better-sqlite3');
const { createApp } = require('./server');

test('старая база, доски, редактирование связей и сохранение после перезапуска', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'media-nexus-'));
  const filename = path.join(directory, 'test.db');
  // Схема базы из предыдущего коммита.
  const legacy = new Database(filename);
  legacy.exec(`CREATE TABLE nodes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, image TEXT, tags TEXT, val INTEGER DEFAULT 12, color TEXT DEFAULT '#818cf8');
    CREATE TABLE links (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER NOT NULL, target_id INTEGER NOT NULL,
      FOREIGN KEY(source_id) REFERENCES nodes(id) ON DELETE CASCADE, FOREIGN KEY(target_id) REFERENCES nodes(id) ON DELETE CASCADE);
    INSERT INTO nodes (name, tags) VALUES ('Старая карточка', '["Тег"]');`);
  legacy.close();
  const { app, db } = createApp(filename, { seedExamples: false });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const call = async (route, method = 'GET', body, status = 200) => {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api${route}`, {
      method, headers: { 'Content-Type': 'application/json' }, ...(body && { body: JSON.stringify(body) })
    });
    const data = await res.json();
    assert.equal(res.status, status, JSON.stringify(data));
    return data;
  };
  try {
    let data = await call('/data');
    assert.equal(data.nodes[0].name, 'Старая карточка');
    assert.equal(data.nodes[0].boardId, null);
    data = await call('/boards', 'POST', { name: 'Дизайн' }, 201);
    const boardId = data.boards[0].id;
    data = await call('/nodes', 'POST', { name: 'Вторая', tags: ['UI'], boardId, linkedNodeIds: [1, 1] }, 201);
    const secondId = data.nodes.at(-1).id;
    assert.equal(data.links.length, 1);
    data = await call('/nodes', 'POST', { name: 'Третья' }, 201);
    const thirdId = data.nodes.at(-1).id;
    data = await call('/nodes/1', 'PUT', { name: 'Исправленная', desc: 'Новый текст', tags: ['A', 'A'], boardId, linkedNodeIds: [secondId, thirdId] });
    assert.equal(data.nodes[0].desc, 'Новый текст');
    assert.deepEqual(data.nodes[0].tags, ['A']);
    assert.equal(data.links.length, 2);
    data = await call(`/nodes/${secondId}`, 'PUT', { name: 'Вторая', linkedNodeIds: [] });
    assert.equal(data.links.length, 1);
    assert.equal(data.links[0].target, thirdId);
    const beforeInvalid = data;
    await call('/nodes/1', 'PUT', { name: 'Не сохранять', linkedNodeIds: [99999] }, 404);
    await call('/nodes/1', 'PUT', { name: 'Не сохранять', linkedNodeIds: [1] }, 400);
    await call('/nodes', 'POST', { name: ' ', tags: [] }, 400);
    await call('/nodes', 'POST', { name: 'Ошибка', boardId: 99999 }, 404);
    assert.deepEqual(await call('/data'), beforeInvalid);
    data = await call(`/boards/${boardId}`, 'PUT', { name: 'Референсы' });
    assert.equal(data.boards[0].name, 'Референсы');
    // Повторное подключение к файлу подтверждает сохранение изменений.
    const reopened = createApp(filename, { seedExamples: false });
    assert.equal(reopened.db.prepare('SELECT name FROM nodes WHERE id=1').get().name, 'Исправленная');
    assert.equal(reopened.db.prepare('SELECT COUNT(*) AS n FROM links').get().n, 1);
    reopened.db.close();
    data = await call(`/boards/${boardId}`, 'DELETE');
    assert.equal(data.boards.length, 0);
    assert.equal(data.nodes.length, 3);
    assert.ok(data.nodes.every(node => node.boardId === null));
    data = await call(`/nodes/${thirdId}`, 'DELETE');
    assert.equal(data.links.length, 0);
    assert.equal(data.nodes.length, 2);
    await call('/nodes/99999', 'DELETE', undefined, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
