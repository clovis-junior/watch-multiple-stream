import { getStore } from '@netlify/blobs';

function generateID(length = 11) {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    chars += '0123456789';

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    return Array.from(array, n => chars[n % chars.length]).join('')
}

async function generateUniqueID(store) {
  let id;

  do {
    id = generateID()
  } while (await store.getMetadata(id));

  return id
}

export default async (request) => {
  const siteId = request.headers.get('x-nf-site-id');
    
  if (!siteId)
    return new Response('Forbidden', { status: 403 });
        
  const { data } = await request.json();

  if (!data)
    return new Response('Missing data', { status: 400 });

  const store = getStore('views');
  const id = await generateUniqueID(store);

  await store.setJSON(id, data, {
    expirationTtl: 60 * 60 * 24
  });

  return Response.json({ id })
}
