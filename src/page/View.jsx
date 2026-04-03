import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { ChatEmbed, VideoEmbed } from '../components/Embed'

import useKeyUp from '../hooks/useKeyUp'

import styles from '../assets/scss/view.module.scss'
import Menu from '../components/Menu'
import Ripple from '../components/Ripple'
import Icon from '../components/Icon'

function Chat({ platform, username, active = false, refreshKey = 0 }) {
  const isActive = active || false

  if (!platform || !username)
    return null

  const classNames = [styles?.chat, isActive ? styles?.active : ''].filter(Boolean).join(' ')

  return <div className={classNames}>{isActive && <ChatEmbed platform={platform} username={username} refreshKey={refreshKey} />}</div>
}

function Screen({ platform, username, isVisible = true, muted = false }) {
  muted = Boolean(muted)

  const [visible, setVisible] = useState(isVisible)

  const Embed = useMemo(() => {
    if (!visible) return null;

    switch (platform) {
      case 'Kick':
        return <VideoEmbed platform={platform} username={username} muted={muted}
          allow="autoplay" referrerPolicy="strict-origin-when-cross-origin" />
      case 'Twitch':
        return <VideoEmbed platform={platform} username={username} muted={muted}
          allow="autoplay" referrerPolicy="strict-origin-when-cross-origin" />
      case 'YouTube':
        return <VideoEmbed platform={platform} username={username} muted={muted}
          allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; web-share"
          referrerPolicy="strict-origin-when-cross-origin" />
      default:
        return null
    }
  }, [visible, platform, username, muted])

  useEffect(() => {
    setVisible(isVisible)
  }, [isVisible])

  if (!visible)
    return null

  return <div className={styles?.live}>{Embed}</div>
}

function Sidebar({ active = true, children }) {
  active = Boolean(active)

  const [screenSize, setScreenSize] = useState({
    width: screen.width,
    height: screen.height,
  })

  useEffect(() => {
    function handleResize() {
      setScreenSize({ width: screen.width, height: screen.height });
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const classNames = [
    styles?.sidebar,
    !active ? styles?.hide : (screenSize.width <= 1280 ? styles?.show : '')
  ].filter(Boolean).join(' ')

  return (
    <aside className={classNames}>
      <div className={styles?.content}>{children}</div>
    </aside>
  )
}

export default function View() {
  useKeyUp('r', handleRefreshChat)
  useKeyUp('c', handleToggleSidebar)
  useKeyUp('v', handleViewMode)

  const { id } = useParams()
  const navigate = useNavigate()

  const [refreshKey, setRefreshKey] = useState(0)
  const [streams, setStreams] = useState([]);
  const [sidebarIsActive, setSidebarIsActive] = useState(true)
  const [viewMode, setViewMode] = useState(false)
  const [chat, setChat] = useState(null)

  const activeChat = chat ?? (streams[0]
    ? `${streams[0]?.platform}:${streams[0]?.username}`
    : null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      try {
        const response = await fetch(`/api/view/${id}`, {
          credentials: 'same-origin'
        })

        if (!response.ok)
          throw new Error('Invalid response')
        
        const { data } = await response.json()

        if (cancelled) return
        
        const entries = data.map(value => {
          const { platform, username, hidden } = value
  
          if (!platform || !username)
            return null
  
          return { platform, username, hidden: !!hidden }
        }).filter(Boolean)
  
        setStreams(entries)
      } catch {
        navigate('/')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  if (!streams.length) return null

  function handleToggleSidebar() {
    setSidebarIsActive(!sidebarIsActive)
  }

  function handleChatActive(event) {
    event.preventDefault()

    if (event.target.value)
      setChat(event.target.value)


    return false
  }

  function handleRefreshChat() {
    if (!activeChat)
      return false

    setRefreshKey(prev => prev + 1)
    return false
  }

  function handleViewMode() {
    setViewMode(!viewMode)
  }

  const gridClassNames = [styles?.grid, viewMode ? styles?.column : ''].filter(Boolean).join(' ')

  return (
    <div className={styles?.watch}>
      <Menu
        streams={streams}
        sidebarActive={sidebarIsActive}
        viewMode={viewMode}
        changeViewMode={handleViewMode}
        toggleChat={handleToggleSidebar}
      />
      <div className={gridClassNames}>
        {streams.map((data, index) => {
          const muted = index > 0

          return (
            <Screen key={index} isVisible={!data?.hidden}
              platform={data?.platform} username={data?.username}
              muted={muted}
            />
          )
        })}
      </div>
      <Sidebar active={sidebarIsActive}>
        <div className={styles?.chats}>
          {streams.map((data, index) => {
            const value = `${data?.platform}:${data?.username}`
            return <Chat key={index} active={activeChat === value} platform={data?.platform} username={data?.username} refreshKey={refreshKey} />
          })}
        </div>
        <footer className={styles?.footer}>
          <nav>
            <select name="chats" onChange={handleChatActive} value={activeChat} disabled={streams.length <= 1 ? true : false}>
              {streams.map((data, index) => {
                const value = `${data?.platform}:${data?.username}`
                return (
                  <option key={index} value={value}>
                    {data?.username} ({data?.platform})
                  </option>
                )
              })}
            </select>
          </nav>
          <Ripple title="Refresh Chat"
            tag="button" type="button"
            className={styles?.button}
            onClick={handleRefreshChat}>
            <Icon name="refresh_chat" />
          </Ripple>
        </footer>
      </Sidebar>
    </div>
  )
}
