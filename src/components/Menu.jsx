import { useNavigate } from 'react-router-dom'

import Ripple from '../components/Ripple'
import Icon from '../components/Icon'

import useActivityDetector from '../hooks/useActivityDetector'
import styles from '../assets/scss/view.module.scss'

export default function Menu({ sidebarActive, viewMode, changeViewMode, toggleChat }) {
  const navigate = useNavigate()
  const isIdle = useActivityDetector()

  const classNames = [styles?.menu, isIdle ? styles?.hide : ''].filter(Boolean).join(' ')

  return (
    <footer className={classNames}>
      <nav className={styles?.buttons}>
        <Ripple tag="button" type="button" title={sidebarActive ? 'Hide Sidebar' : 'Show Sidebar'} className={styles?.button} onClick={toggleChat}>
          <Icon name={sidebarActive ? 'right_panel_close' : 'right_panel_open'} />
        </Ripple>
        <Ripple tag="button" type="button" title={viewMode ? 'Grid View' : 'Splitscreen'} className={styles?.button} onClick={changeViewMode}>
          <Icon name={viewMode ? 'grid_view' : 'splitscreen'} />
        </Ripple>
        <Ripple tag="button" type="button" title="Exit" className={styles?.button} onClick={() => navigate('/')}>
          <Icon name="exit" />
        </Ripple>
      </nav>
    </footer>
  )
}