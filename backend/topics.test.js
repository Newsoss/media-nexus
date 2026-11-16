const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const Database = require('better-sqlite3');
const { createApp } = require('./server');

test('несколько тем, перенос старых назначений, примеры один раз и сохранение карточек при удалении темы', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'media-topics-'));
  const filename = path.join(directory, 'topics.db');
  const legacy = new Database(filename);
  legacy.exec(`CREATE TABLE boards (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);
    CREATE TABLE nodes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, image TEXT, tags TEXT, val INTEGER DEFAULT 12, color TEXT DEFAULT '#818cf8', board_id INTEGER REFERENCES boards(id));
    CREATE TABLE links (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE, target_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE);
    INSERT INTO boards (name) VALUES ('Старая тема');
    INSERT INTO nodes (name, tags, board_id) VALUES ('Моя карточка', '[]', 1), ('Другая карточка', '[]', NULL);
    INSERT INTO links (source_id, target_id) VALUES (1,2);`);
  legacy.close();
  const { app, db } = createApp(filename);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const call = async (route, method = 'GET', body, status = 200) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api${route}`, {
      method, headers: { 'Content-Type': 'application/json' }, ...(body && { body: JSON.stringify(body) })
    });
    const data = await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    return data;
  };
  try {
    let data = await call('/data');
    assert.deepEqual(data.nodes.find(node => node.id === 1).boardIds, [1]);
    assert.deepEqual(data.nodes.find(node => node.id === 2).boardIds, []);
    assert.equal(data.nodes.length, 4);
    const design = data.boards.find(board => board.name === 'Веб-дизайн').id;
    const development = data.boards.find(board => board.name === 'Разработка').id;
    assert.equal(data.nodes.filter(node => node.tags.includes('Пример')).length, 2);
    assert.ok(data.nodes.some(node => node.boardIds.includes(design) && node.boardIds.includes(development)));
    assert.ok(data.links.some(link => link.source === 1 && link.target === 2));
    data = await call('/nodes', 'POST', { name: 'В двух темах', boardIds: [design, development, design], linkedNodeIds: [1] }, 201);
    const id = data.nodes.at(-1).id;
    assert.deepEqual(data.nodes.at(-1).boardIds, [design, development]);
    data = await call(`/nodes/${id}`, 'PUT', { name: 'В одной теме', boardIds: [development], linkedNodeIds: [1] });
    assert.deepEqual(data.nodes.at(-1).boardIds, [development]);
    const beforeInvalid = data;
    await call(`/nodes/${id}`, 'PUT', { name: 'Ошибка', boardIds: [99999] }, 404);
    await call(`/nodes/${id}`, 'PUT', { name: 'Ошибка', boardIds: 'bad' }, 400);
    assert.deepEqual(await call('/data'), beforeInvalid);
    data = await call(`/boards/${development}`, 'DELETE');
    assert.deepEqual(data.nodes.find(node => node.id === id).boardIds, []);
    assert.ok(data.nodes.some(node => node.boardIds.includes(design)));
    assert.ok(data.links.some(link => link.source === 1 && link.target === id));
    const count = data.nodes.length;
    const reopened = createApp(filename);
    assert.equal(reopened.db.prepare('SELECT COUNT(*) AS count FROM nodes').get().count, count);
    assert.equal(reopened.db.prepare('SELECT COUNT(*) AS count FROM node_boards WHERE node_id=?').get(id).count, 0);
    assert.equal(reopened.db.prepare('SELECT COUNT(*) AS count FROM boards WHERE id=?').get(development).count, 0);
    reopened.db.close();
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
