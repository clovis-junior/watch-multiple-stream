import { useEffect, useState, useMemo } from 'react'
import { getChannelId, getChannelLive } from '../hooks/useYoutube'

import styles from '../assets/scss/view.module.scss'
import Alert from './Alert'

const currentURL = typeof window !== 'undefined' ? window.location.hostname : ''

function Loader() {
  return (
    <div className={styles?.loader}></div>
  )
}

export function ChatEmbed({ platform, username, refreshKey = 0 }) {
  const [isLoaded, setIsLoaded] = useState(false)
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
    const timer = setTimeout(() => setIsLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (platform !== 'YouTube' || !username) return
    let isMounted = true

    async function checkLiveStream() {
      const liveId = await getChannelLive(username)
      if (isMounted && liveId) setLive(liveId)
    }

    checkLiveStream()
    return () => { isMounted = false }
  }, [platform, username])

  const url = useMemo(() => {
    if (!platform || !username) return null

    const encodedDomain = encodeURIComponent(currentURL)

    switch (platform) {
      case 'Kick':
        return `https://kick.com/popout/${username}/chat`
      case 'Twitch':
        return `https://www.twitch.tv/embed/${username}/chat?parent=${encodedDomain}${isDark ? '&darkpopout' : ''}`
      case 'YouTube':
        if (!live) return null;
        return `https://www.youtube.com/live_chat?v=${live}&embed_domain=${encodedDomain}${isDark ? '&darkMode=1' : ''}`
      default:
        return null;
    }
  }, [platform, username, live, isDark]);

  if (!isLoaded)
    return (<Loader />)

  if (!url)
     return (<Alert type="error" transparent><strong>Error on load Chat:</strong>Check out the console for more information.</Alert>)

  return (
    <iframe
      key={refreshKey}
      src={url}
      title={`Chat de ${username} via ${platform}`}
      frameborder={0} scrolling="no"
    />
  )
}

export function VideoEmbed({ platform, username, muted = true, ...inline }) {
  const isMuted = Boolean(muted)

  const [isLoaded, setIsLoaded] = useState(false)
  const [channel, setChannel] = useState(null)
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = e => setIsDark(e.matches)
    matcher.addEventListener('change', listener)
    return () => matcher.removeEventListener('change', listener)
  }, [])
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (platform !== 'YouTube' || !username) return
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
      case 'Kick':
        return `https://player.kick.com/${username}?allowfullscreen=true&muted=${isMuted}`
      case 'Twitch':
        return `https://player.twitch.tv/?channel=${username}&autoplay=true&muted=${isMuted}&parent=${encodedDomain}`
      case 'YouTube':
        if (!channel) return null
        return `https://www.youtube.com/embed/live_stream?channel=${channel}&rel=0&autoplay=1${isMuted ? '&mute=1' : ''}&theme=${isDark ? 'dark' : 'light'}`
      default:
        return null
    }
  }, [platform, username, channel, isMuted, isDark])

  if (!isLoaded)
    return (<Loader />)

  if (!url)
     return (<Alert type="error" transparent><strong>Error on load Stream:</strong>Check out the console for more information.</Alert>)

  return ( 
    <iframe
      src={url}
      {...inline}
      title={`Livestream de ${username} via ${platform}`}
      frameborder={0} scrolling="no"
    />
  )
}
