export default async function handler(req, res) {
  const { path } = req.query;
  const subPath = Array.isArray(path) ? path.join('/') : path;
  const searchIndex = req.url.indexOf('?');
  const search = searchIndex !== -1 ? req.url.substring(searchIndex) : '';
  
  const targetUrl = `https://api.telegram.org/${subPath}${search}`;
  
  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'User-Agent': 'Vercel-Telegram-Proxy',
      },
    };

    if (req.headers['content-type']) {
      fetchOptions.headers['content-type'] = req.headers['content-type'];
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      fetchOptions.body = Buffer.concat(chunks);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.arrayBuffer();
    
    res.status(response.status);
    for (const [key, value] of response.headers.entries()) {
      if (key !== 'content-encoding') {
        res.setHeader(key, value);
      }
    }
    return res.send(Buffer.from(data));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
