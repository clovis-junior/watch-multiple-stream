import styles from '../assets/scss/alert.module.scss'

export default function Alert({ type = 'info', transparent = false, children }) {
  let styleClass = styles.info

  switch (type) {
    case 'success':
      styleClass = styles.success
      break
    case 'error':
    case 'danger':
      styleClass = styles.error
      break
    case 'info':
    default:
      styleClass = styles.info
  }

  const classNames = [
    styles?.alert, styleClass,
    transparent ? styles?.transparent : ''
  ].filter(Boolean).join(' ')

  return <div className={classNames}>{children}</div>
}