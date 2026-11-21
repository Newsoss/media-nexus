const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./server');
const { seedDemo } = require('./demo');

test('демонстрация добавляется один раз и сохраняет существующие материалы', () => {
  const { db } = createApp(':memory:', { seedExamples: false });
  try {
    const before = db.prepare('SELECT * FROM nodes ORDER BY id').all();
    const linksBefore = db.prepare('SELECT COUNT(*) AS n FROM links').get().n;
    assert.equal(seedDemo(db), true);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM nodes').get().n, before.length + 6);
    assert.deepEqual(db.prepare('SELECT * FROM nodes WHERE id <= ? ORDER BY id').all(before.at(-1).id), before);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM links').get().n, linksBefore + 6);
    const reference = db.prepare('SELECT id FROM nodes WHERE name=?').get('Референс главной страницы');
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM node_boards WHERE node_id=?').get(reference.id).n, 2);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM node_positions WHERE node_id>?').get(before.at(-1).id).n, 6);
    assert.equal(seedDemo(db), false);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM nodes').get().n, before.length + 6);
    db.prepare('DELETE FROM nodes WHERE id=?').run(reference.id);
    assert.equal(seedDemo(db), false);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM nodes').get().n, before.length + 5);
  } finally { db.close(); }
});
