import { Hono } from 'hono'
import { cors } from 'hono/cors'

import {suggests, search, getTopicInfo} from './parsers'


const app = new Hono()
app.use('/*', cors({
  origin: '*'
}))

app.get('/', (c) => c.text('Hello TEST!'))
app.get('/rec/:cat/:latest', async (c) => {
  const data = await suggests(c.req.param('cat'), c.req.param('latest'))
  return c.json(data)
})

app.get('/search', async (c) => {
  const data = await search(c.req.query('term'))
  return c.json(data)
})



app.get('/topic/:id', async (c) => {
  const data = await getTopicInfo(c.req.param('id'))
  return c.text(JSON.stringify(data))
})

app.get('/apk_icons/:id', async (c) => {
  const imageUrl = 'https://trashbox.ru/apk_icons/' + c.req.param('id');
  const response = await fetch(imageUrl);

  if (!response.ok) {
    return c.text('Failed to fetch image', 500);
  }

  const imageBuffer = await response.arrayBuffer();
  const headers = new Headers({
    'Content-Type': response.headers.get('Content-Type') || 'image/png',
    'Content-Length': response.headers.get('Content-Length') || String(imageBuffer.byteLength),
  });

  return new Response(imageBuffer, { headers });
});

export default app;