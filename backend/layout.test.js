const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { createApp } = require('./server');

test('положение карточки сохраняется, переживает редактирование и повторное открытие базы', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'media-layout-'));
  const filename = path.join(directory, 'board.db');
  const { app, db } = createApp(filename, { seedExamples: false });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const request = async (route, method = 'GET', body, status = 200) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api${route}`, {
      method, headers: { 'Content-Type': 'application/json' }, ...(body && { body: JSON.stringify(body) })
    });
    const data = await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    return data;
  };
  try {
    const data = await request('/data');
    const id = data.nodes[0].id;
    await request(`/nodes/${id}/position`, 'PATCH', { x: 260, y: 175 });
    await request(`/nodes/${id}`, 'PUT', { name: 'Исправленная карточка', linkedNodeIds: [] });
    const updated = (await request('/data')).nodes.find(node => node.id === id);
    assert.equal(updated.positionX, 260);
    assert.equal(updated.positionY, 175);
    await request(`/nodes/${id}/position`, 'PATCH', { x: -1, y: 2 }, 400);
    await request(`/nodes/${id}/position`, 'PATCH', { x: '200', y: 2 }, 400);
    await request(`/nodes/${id}/position`, 'PATCH', { x: 10001, y: 2 }, 400);
    await request('/nodes/99999/position', 'PATCH', { x: 20, y: 20 }, 404);
    const reopened = createApp(filename, { seedExamples: false });
    assert.deepEqual(reopened.db.prepare('SELECT x,y FROM node_positions WHERE node_id=?').get(id), { x: 260, y: 175 });
    reopened.db.close();
    await request(`/nodes/${id}`, 'DELETE');
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM node_positions').get().count, 0);
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
