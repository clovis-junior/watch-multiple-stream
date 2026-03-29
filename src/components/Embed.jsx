import { useEffect, useState, useMemo } from 'react'
import { getChannelId, getChannelLive } from '../hooks/useYoutube'

const currentURL = typeof window !== 'undefined' ? window.location.hostname : ''

export function ChatEmbed({ platform, username, refreshKey = 0 }) {
  const [live, setLive] = useState(null)
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = e => setIsDark(e.matches);
    matcher.addEventListener('change', listener);
    return () => matcher.removeEventListener('change', listener);
  }, [])

  useEffect(() => {
    if (platform !== 'youtube' || !username) return
    let isMounted = true

    async function checkLiveStream() {
      const liveId = await getChannelLive(username)
      if (isMounted && liveId) setLive(liveId)
    }

    checkLiveStream()
    return () => { isMounted = false }
  }, [platform, username])

  const url = useMemo(() => {
    if (!platform || !username) return null;

    const encodedDomain = encodeURIComponent(currentURL)

    switch (platform) {
      case 'kick':
        return `https://kick.com/popout/${username}/chat`;

      case 'twitch':
        return `https://www.twitch.tv/embed/${username}/chat?parent=${encodedDomain}${isDark ? '&darkpopout' : ''}`;

      case 'youtube':
        if (!live) return null;
        return `https://www.youtube.com/live_chat?v=${live}&embed_domain=${encodedDomain}${isDark ? '&darkMode=1' : ''}`;

      default:
        return null;
    }
  }, [platform, username, live, isDark]);

  if (!url) return null

  return (
    <iframe
      key={refreshKey}
      src={url}
      referrerPolicy="origin"
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  )
}

export function VideoEmbed({ platform, username, muted = true, ...inline }) {
  const isMuted = Boolean(muted)

  const [channel, setChannel] = useState(null)
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = e => setIsDark(e.matches);
    matcher.addEventListener('change', listener);
    return () => matcher.removeEventListener('change', listener);
  }, [])

  useEffect(() => {
    if (platform !== 'youtube' || !username) return
    let isMounted = true

    async function checkYouTubeChannel() {
      const channelId = await getChannelId(username)
      if (isMounted && channelId) setChannel(channelId)
    }

    checkYouTubeChannel()
    return () => { isMounted = false }
  }, [platform, username])

  const url = useMemo(() => {
    if (!platform || !username) return null

    const encodedDomain = encodeURIComponent(currentURL)

    switch (platform) {
      case 'kick':
        return `https://player.kick.com/${username}?allowfullscreen=true&muted=${isMuted}`
      case 'twitch':
        return `https://player.twitch.tv/?channel=${username}&autoplay=true&muted=${isMuted}&parent=${encodedDomain}`
      case 'youtube':
        if (!channel) return null
        return `https://www.youtube.com/embed/live_stream?channel=${channel}&rel=0&autoplay=1${isMuted ? '&mute=1' : ''}&theme=${isDark ? 'dark' : 'light'}`
      default:
        return null
    }
  }, [platform, username, channel, isMuted, isDark])

  if (!url) return null

  return (
    <iframe
      src={url}
      {...inline}
      title={`Livestream de ${username} via ${platform}`}
      allowFullScreen
    />
  )
}
