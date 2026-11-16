const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./server');

test('файл изображения сохраняется в базе, а заметка может быть без картинки', async () => {
  const { app, db } = createApp(':memory:', { seedExamples: false });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const send = async (body, status) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/nodes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const result = await response.json();
    assert.equal(response.status, status, JSON.stringify(result));
    return result;
  };
  try {
    const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aQ1cAAAAASUVORK5CYII=';
    let result = await send({ name: 'Фото с компьютера', image }, 201);
    assert.equal(result.nodes.at(-1).image, image);
    assert.equal(db.prepare('SELECT image FROM nodes ORDER BY id DESC LIMIT 1').get().image, image);
    result = await send({ name: 'Обычная заметка', image: '' }, 201);
    assert.equal(result.nodes.at(-1).image, '');
    const count = result.nodes.length;
    await send({ name: 'SVG', image: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }, 400);
    await send({ name: 'Ошибка', image: 'data:image/png;base64,!!!!' }, 400);
    await send({ name: 'Размер', image: `data:image/png;base64,${Buffer.alloc(4 * 1024 * 1024 + 1).toString('base64')}` }, 413);
    await send({ name: 'Протокол', image: 'javascript:alert(1)' }, 400);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM nodes').get().count, count);
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
  }
});
