const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
const apiUrlBase = 'https://www.googleapis.com/youtube/v3/';

const cache = new Map();

export async function getChannelId(username) {
    if (!username)
        return null;

    const handle = username.startsWith('@') ? username : `@${username}`;

    if (cache.has(handle)) return cache.get(handle);

    try {
        const url = `${apiUrlBase}channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        const id = data?.items?.[0]?.id;

        if (id) cache.set(handle, id);
        return id;
    } catch {
        return null;
    }
}

export async function getChannelLive(username) {
    if (!username)
        return null;

    try {
        const channelId = await getChannelId(username);
        if (!channelId) return null;

        const url = `${apiUrlBase}search?part=id&channelId=${channelId}&type=video&eventType=live&key=${apiKey}&fields=items(id/videoId)`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        return data?.items?.[0]?.id?.videoId || null;
    } catch {
        return null;
    }
}