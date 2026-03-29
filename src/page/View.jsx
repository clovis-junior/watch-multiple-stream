import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ChatEmbed, VideoEmbed } from '../components/Embed'

import useKeyUp from '../hooks/useKeyUp'

import styles from '../assets/scss/view.module.scss'
import Menu from '../components/Menu'
import Ripple from '../components/Ripple'
import Icon from '../components/Icon'

function Chat({ platform, username, active = false, refreshKey = 0 }) {
  const isActive = active || false

  const classNames = [styles?.chat, isActive ? styles?.active : ''].filter(Boolean).join(' ')

  return <div className={classNames}>{isActive && <ChatEmbed platform={platform} username={username} refreshKey={refreshKey} />}</div>
}

function Screen({ platform, username, muted = false }) {
  muted = Boolean(muted)

  const Embed = useMemo(() => {
    switch (platform) {
      case 'kick':
        return <VideoEmbed platform={platform} username={username} muted={muted} allow="autoplay" />
      case 'twitch':
        return <VideoEmbed platform={platform} username={username} muted={muted} allow="autoplay" />
      case 'youtube':
        return <VideoEmbed platform={platform} username={username} muted={muted} 
        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; web-share"
        referrerPolicy="strict-origin-when-cross-origin" />
      default:
        return null
    }
  }, [platform, username, muted])

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

  const params = useParams()

  const [refreshKey, setRefreshKey] = useState(0)
  const [sidebarIsActive, setSidebarIsActive] = useState(true)
  const [viewMode, setViewMode] = useState(false)

  const lives = useMemo(() => {
    const urlString = params['*'];

    if (!urlString) return {}

    const parts = urlString.split('/').filter(Boolean)

    const entries = parts.map(part => {
      const [platform, username] = part.split(':')

      if (platform && username)
        return [part, { platform, username }]

      return null
    }).filter(Boolean)

    console.log(Object.fromEntries(entries))

    return Object.fromEntries(entries)
  }, [params])

  const entries = Object.entries(lives || {})

  const [chat, setChat] = useState(() => {
    if (entries.length > 0) {
      const [_, firstItem] = entries[0]
      return `${firstItem?.platform}-${firstItem?.username}`
    }

    return null
  })

  if (!entries.length) return null

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
    if (!chat)
      return false

    setRefreshKey(prev => prev + 1)
  }

  function handleViewMode() {
    setViewMode(!viewMode)
  }

  const gridClassNames = [styles?.grid, viewMode ? styles?.column : ''].filter(Boolean).join(' ')

  return (
    <div className={styles?.watch}>
      <Menu 
        sidebarActive={sidebarIsActive}
        viewMode={viewMode}
        changeViewMode={handleViewMode}
        toggleChat={handleToggleSidebar}
      />
      <div className={gridClassNames}>
        {entries.map(([key, item], index) => {
          const muted = index > 0

          return (
          <Screen key={key}
            platform={item?.platform} username={item?.username}
            muted={muted}
          />
        )
      })}
      </div>
      <Sidebar active={sidebarIsActive}>
        <div className={styles?.chats}>
          {entries.map(([key, item]) => {
            const value = `${item?.platform}-${item?.username}`
            return <Chat key={key} active={chat === value} platform={item?.platform} username={item?.username} refreshKey={refreshKey} />
          })}
        </div>
        <footer className={styles?.footer}>
          <nav>
            <select name="chats" onChange={handleChatActive} value={chat || ''} disabled={entries.length <= 1 ? true : false}>
              {entries.map(([key, item]) => {
                const value = `${item?.platform}-${item?.username}`
                return (
                  <option key={key} value={value}>
                    {item?.username} ({item?.platform})
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
