const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const server = http.createServer(async (req, res) => {
  try {
    // تسجيل الطلب للتصحيح
    console.log(`Request: ${req.url}`);

    // تحديد المسار
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // إذا كان المسار يشير إلى مجلد، جرب تقديم index.html
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // تحديد نوع المحتوى
    const extname = path.extname(filePath).toLowerCase();
    const contentTypeMap = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
      '.css': 'text/css'
    };
    const contentType = contentTypeMap[extname] || 'application/octet-stream';

    // قراءة الملف
    const content = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // ملف غير موجود، جرب تقديم index.html لدعم PWA
      try {
        const content = await fs.readFile(path.join(__dirname, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
        console.error(`404: ${req.url}`);
      }
    } else {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h1>500 Server Error</h1>', 'utf-8');
      console.error(`500: ${err.message}`);
    }
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});