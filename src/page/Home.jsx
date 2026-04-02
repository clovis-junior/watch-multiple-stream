import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from '../assets/scss/home.module.scss'
import Ripple from '../components/Ripple'
import Icon from '../components/Icon'
import Alert from '../components/Alert'

export default function Home() {
  const [error, setError] = useState('')
  const [streams, setStreams] = useState([{ platform: 'Twitch', username: '', hidden: false }])
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
      setStreams([...newStreams, { platform: 'Twitch', username: '', hidden: false }])
  }

  async function handleViewStreams() {
    const validStreams = streams.filter((s) => s.username.trim() !== '')

    if (validStreams.length === 0) {
      setError('Enter at least one username/channel')
      return
    }

    try {
      const response = await fetch('/api/view', {
        method: 'POST',
        body: JSON.stringify({ data: validStreams })
      })

      const { id } = await response.json()

      navigate(`/v/${id}`)
    } catch (err) {
      console.error(err)
      setError(`Error: ${err}`)
      return
    }
  }

  function handleClear(event) {
    event.preventDefault()

    setStreams([{ platform: 'Twitch', username: '', hidden: false }])
    setError('')

    return false
  }

  return (
    <div className={styles?.body}>
      <main className={styles?.panel}>
        <header className={styles?.header}>
          <h2 className={styles?.title}>Watch Multiple Stream</h2>
          <h3>Thats the way to watch multiple streams at one time.</h3>
        </header>
        {error ? (
          <Alert type="error">{error}</Alert>
        ) : (
          <Alert type="info" transparent>All generated URLs are valid for only 24 hours.</Alert>
        )}
        {streams.map((stream, index) => (
          <div key={index} className={styles?.label}>
            <select value={stream.platform} onChange={(e) => updateStream(index, 'platform', e.target.value)}>
              <option value="Twitch">Twitch TV</option>
              <option value="YouTube">YouTube</option>
              <option value="Kick">Kick</option>
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