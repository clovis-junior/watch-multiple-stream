import { getStore } from '@netlify/blobs';

export default async (request) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (!id)
    return new Response('Missing id', { status: 400 });

  const store = getStore('views');

  const raw = await store.get(id);

  if (!raw)
    return new Response('Not found', { status: 404 });

  const data = JSON.parse(raw);

  return new Response(
    JSON.stringify({ data }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
};