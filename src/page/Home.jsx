import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Ripple from '../components/Ripple'
import styles from '../assets/scss/home.module.scss'
import Icon from '../components/Icon'

export default function Home() {
  const [error, setError] = useState('')
  const [streams, setStreams] = useState([{ platform: 'ttv', username: '', hidden: false }])
  const navigate = useNavigate()

  function openNewTab(url) {
    window.open(url, '_blank').focus();
  }

  function updateStream(index, field, value) {
    const newStreams = [...streams]

    newStreams[index][field] = value

    setStreams(newStreams)

    const isLast = index === streams.length - 1

    if (isLast && value.trim() !== '')
      setStreams([...newStreams, { platform: 'ttv', username: '', hidden: false }])
  }

  function handleViewStreams() {
    const validStreams = streams.filter((s) => s.username.trim() !== '')

    if (validStreams.length === 0) {
      setError('Enter at least one username/channel')
      return
    }

    const urlPath = validStreams.map((s) => `${s.platform.toLowerCase()}:${s.username.trim()}${s.hidden ? ':hide' : ''}`).join('/')

    navigate(`/${urlPath}`)
  }

  function handleClear(event) {
    event.preventDefault()

    setStreams([{ platform: 'ttv', username: '', hidden: false }])
    setError('')

    return false
  }

  return (
    <div className={styles?.body}>
      <main className={styles?.panel}>
        <header className={styles?.header}>
          <h2 className={styles?.title}>Watch Multiple Stream</h2>
          <h3>Thats the way to watch multiple streams at one time.</h3>
          <small className={styles?.info}>Currently, we only supports Twitch, YouTube, and Kick streams.</small>
        </header>
        {error ? <div className={`${styles?.alert} ${styles?.error}`}>{error}</div> : null}
        {streams.map((stream, index) => (
          <div key={index} className={styles?.label}>
            <select value={stream.platform} onChange={(e) => updateStream(index, 'platform', e.target.value)}>
              <option value="ttv">Twitch TV</option>
              <option value="yt">YouTube</option>
              <option value="k">Kick</option>
            </select>
            <input type="text" placeholder="Username..." value={stream.username} onChange={(e) => updateStream(index, 'username', e.target.value)} />
            <Ripple tag="button" type="button"
              onClick={() => updateStream(index, 'hidden', !stream.hidden)}
              className={`${styles?.button} ${stream.hidden ? styles?.danger : styles?.success}`}
            >
              <Icon name={stream.hidden ? 'visibility_off' : 'visibility'} />
            </Ripple>
          </div>
        ))}
        <nav className={styles?.buttons}>
          <Ripple tag="button" type="button" className={styles?.button} onClick={handleViewStreams}>
            {`Watch ${streams?.length > 1 ? 'Streams' : 'Stream'}`}
          </Ripple>
          <Ripple tag="button" type="reset"
            className={`${styles?.button} ${styles?.danger}`}
            onClick={handleClear}>
            Clear
          </Ripple>
        </nav>
        <footer className={styles?.buttons}>
          <Ripple tag="button" type="button"
            className={`${styles?.button} ${styles?.success}`}
            onClick={() => openNewTab('https://ko-fi.com/clovao')}>Support Me</Ripple>
        </footer>
      </main>
    </div>
  )
}