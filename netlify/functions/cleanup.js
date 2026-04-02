import { getStore } from '@netlify/blobs';

const MAX_AGE = 24 * 60 * 60 * 1000;

export default async () => {
    const store = getStore('views');

    const { blobs } = await store.list();

    let deleted = 0;

    for (const blob of blobs) {
        const data = await store.getJSON(blob.key);

        if (!data?.createdAt) continue;

        const age = Date.now() - data.createdAt;

        if (age > MAX_AGE) {
            await store.delete(blob.key);
            deleted++
        }
    }

    console.log(`Cleanup finished. Deleted ${deleted} items.`);

    return new Response('OK')
};

export const config = {
  schedule: "0 3 * * *"
};