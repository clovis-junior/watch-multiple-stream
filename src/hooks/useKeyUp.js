import { useRef, useEffect } from 'react';

export default function useKeyUp(targetKey, handler) {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const upHandler = (event) => {
            const { key, target } = event;

            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
                return;

            const isTarget = Array.isArray(targetKey) 
                ? targetKey.includes(key) 
                : key === targetKey;

            if (isTarget && savedHandler.current) {
                savedHandler.current(event);
            }
        };

        window.addEventListener('keyup', upHandler);
        return () => window.removeEventListener('keyup', upHandler);
    }, [targetKey])
}