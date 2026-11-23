const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const files = {
  '/': 'index.html',
  '/map': 'map.html',
  '/map/': 'map.html',
};
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const port = Number(process.env.PORT || 4175);

http.createServer((request, response) => {
  const pathname = decodeURIComponent(request.url.split('?')[0]);
  const relativePath = files[pathname] || pathname.replace(/^\//, '');
  const file = path.resolve(root, relativePath);
  if (!file.startsWith(root)) { response.writeHead(403); response.end('Forbidden'); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain', 'Cache-Control': 'no-store' });
    response.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log(`Prototype: http://127.0.0.1:${port}`));
