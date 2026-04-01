import { getStore } from '@netlify/blobs';

function generateID() {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    chars += '0123456789';

    const array = new Uint32Array(11);
    crypto.getRandomValues(array);

    return Array.from(array, n => chars[n % chars.length]).join('')
}

export default async (request) => {
  const siteId = request.headers.get('x-nf-site-id');
    
  if (!siteId)
    return new Response('Forbidden', { status: 403 });
        
  const { data } = await request.json();

  if (!data)
    return new Response('Missing data', { status: 400 });

  const id = generateID();
  const store = getStore('views');
  const exists = await store.getMetadata(id);

  if (!exists)
    await store.setJSON(id, data, {
      expirationTtl: 60 * 60 * 24
    });

  return Response.json({ id })
};
