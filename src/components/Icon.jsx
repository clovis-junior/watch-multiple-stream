import styles from '../assets/scss/icons.module.scss'

export default function Icon({ name }) {
    if (!name)
        return null

    const classNames = [
        styles?.icon,
        styles?.[name]
    ].filter(Boolean).join(' ')

    return (
        <span className={classNames}></span>
    )
}