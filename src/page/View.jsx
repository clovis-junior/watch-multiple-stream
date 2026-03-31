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

function Screen({ platform, username, isVisible = true, muted = false }) {
  muted = Boolean(muted)

  const [visible, setVisible] = useState(isVisible)

  const Embed = useMemo(() => {
    if (!visible) return null;

    switch (platform) {
      case 'k':
      case 'kick':
        return <VideoEmbed platform={platform} username={username} muted={muted}
          allow="autoplay" referrerPolicy="strict-origin-when-cross-origin" />
      case 't':
      case 'ttv':
      case 'twitch':
        return <VideoEmbed platform={platform} username={username} muted={muted}
          allow="autoplay" referrerPolicy="strict-origin-when-cross-origin" />
      case 'y':
      case 'yt':
      case 'ytb':
      case 'youtube':
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

  const [refreshKey, setRefreshKey] = useState(0)
  const [lives, setLives] = useState({});
  const [sidebarIsActive, setSidebarIsActive] = useState(true)
  const [viewMode, setViewMode] = useState(false)

  const entries = Object.entries(lives || {})

  const [chat, setChat] = useState(() => {
    if (entries.length > 0) {
      const [_, firstItem] = entries[0]
      return `${firstItem?.platform}-${firstItem?.username}`
    }

    return null
  })

  useEffect(() => {
    if (!id) return

    async function load() {
      const response = await fetch(`/api/view/${id}`)
      const { data } = await response.json()

      const entries = data.map((value, index) => {
        const { platform, username, hidden } = value

        if (platform && username)
          return [index, {
            platform,
            username,
            hidden: !!hidden
          }]

        return null
      }).filter(Boolean);

      setLives(Object.fromEntries(entries))
    }

    load()
  }, [id])

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

  function getPlatformName(short) {
    switch (short) {
      case 'k':
        return 'Kick'
      case 't':
      case 'ttv':
        return 'Twitch TV'
      case 'y':
      case 'yt':
      case 'ytb':
        return 'YouTube'
      default:
        return short
    }
  }

  const gridClassNames = [styles?.grid, viewMode ? styles?.column : ''].filter(Boolean).join(' ')

  return (
    <div className={styles?.watch}>
      <Menu
        streams={entries}
        sidebarActive={sidebarIsActive}
        viewMode={viewMode}
        changeViewMode={handleViewMode}
        toggleChat={handleToggleSidebar}
      />
      <div className={gridClassNames}>
        {entries.map(([key, item], index) => {
          const muted = index > 0

          return (
            <Screen key={key} isVisible={!item?.hidden}
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
                    {item?.username} ({getPlatformName(item?.platform)})
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
