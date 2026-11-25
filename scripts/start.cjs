const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const backend = path.join(root, 'backend');
const apiPort = 5000;
const sitePort = 5173;
const siteUrl = `http://127.0.0.1:${sitePort}`;
const apiUrl = `http://127.0.0.1:${apiPort}/api`;
const children = new Set();
let stopping = false;

function stop(message, code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  if (message) console.log(`\n${message}`);
  process.exit(code);
}

function launch(args, cwd, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd, env: { ...process.env, ...env }, stdio: 'inherit', windowsHide: true
  });
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

async function install(cwd, label) {
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (!existsSync(npmCli)) throw new Error('Не найден npm. Установите Node.js 24 вместе с npm.');
  console.log(`\nУстановка зависимостей: ${label}. При первом запуске нужен интернет.\n`);
  await new Promise((resolve, reject) => {
    const child = launch([npmCli, 'ci'], cwd);
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`Не удалось установить зависимости (${label}). Проверьте интернет и сообщения npm выше.`)));
  });
}

async function checkPort(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => reject(new Error(error.code === 'EADDRINUSE'
      ? `Порт ${port} уже занят. Возможно, проект уже запущен. Остановите прежний запуск и попробуйте ещё раз.`
      : `Не удалось использовать порт ${port}: ${error.message}`)));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

function service(args, cwd, label, env) {
  const child = launch(args, cwd, env);
  child.once('error', error => stop(`${label}: ${error.message}`, 1));
  child.once('exit', code => {
    if (!stopping) stop(`${label} завершил работу. Оба сервиса остановлены.`, code === 0 ? 0 : 1);
  });
}

async function waitFor(url) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
      await response.body?.cancel();
      if (response.ok) return;
    } catch { /* Сервер ещё загружается. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Не удалось дождаться запуска ${url}. Смотрите сообщения выше.`);
}

async function main() {
  console.log('MediaNexus — запуск проекта\n');
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 24) throw new Error('Для этого запуска установите Node.js 24 LTS или новее. Проект проверен на Node.js 24.');
  await Promise.all([checkPort(apiPort), checkPort(sitePort)]);

  if (!existsSync(path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'))) await install(root, 'сайт');
  if (!existsSync(path.join(backend, 'node_modules', 'better-sqlite3', 'package.json')) ||
      !existsSync(path.join(backend, 'node_modules', 'express', 'package.json'))) await install(backend, 'сервер');

  console.log('\nЗапускаю сервер и сайт...');
  service([path.join(backend, 'server.js')], backend, 'Сервер', { PORT: String(apiPort) });
  service([path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', String(sitePort), '--strictPort'], root, 'Сайт', { VITE_API_URL: apiUrl });
  await Promise.all([waitFor(`${apiUrl}/data`), waitFor(siteUrl)]);
  console.log(`\nГотово: ${siteUrl}\nОставьте это окно открытым. Для остановки нажмите Ctrl+C.\n`);

  if (!process.argv.includes('--no-open') && process.platform === 'win32') {
    const browser = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `start "" "${siteUrl}"`], {
      stdio: 'ignore', windowsHide: true
    });
    browser.on('error', () => console.log(`Откройте браузер вручную: ${siteUrl}`));
    browser.unref();
  }
}

process.on('SIGINT', () => stop('Сайт и сервер остановлены.'));
process.on('SIGTERM', () => stop('Сайт и сервер остановлены.'));
main().catch(error => stop(`Ошибка запуска: ${error.message}`, 1));
