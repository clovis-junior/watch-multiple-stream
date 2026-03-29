import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Ripple from '../components/Ripple'
import styles from '../assets/scss/home.module.scss'

export default function Home() {
  const [error, setError] = useState('')
  const [streams, setStreams] = useState([{ username: '', platform: 'twitch' }])
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
      setStreams([...newStreams, { username: '', platform: 'twitch' }])
  }

  function handleViewStreams() {
    const validStreams = streams.filter((s) => s.username.trim() !== '')

    if (validStreams.length === 0) {
      setError('Enter at least one username/channel')
      return
    }

    const urlPath = validStreams.map((s) => `${s.platform.toLowerCase()}:${s.username.trim()}`).join('/')

    navigate(`/${urlPath}`)
  }

  function handleClear(event) {
    event.preventDefault()

    setStreams([{ username: '', platform: 'twitch' }])
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
              <option value="twitch">Twitch</option>
              <option value="youtube">YouTube</option>
              <option value="kick">Kick</option>
            </select>
            <input type="text" placeholder="Username..." value={stream.username} onChange={(e) => updateStream(index, 'username', e.target.value)} />
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