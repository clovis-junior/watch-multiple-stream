import { useState, useEffect, useRef } from 'react';

export default function useActivityDetector(timeout = 3000) {
    const [isIdle, setIsIdle] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const events = ['mousemove', 'touchstart', 'scroll'];

        function handleActivity() {
            setIsIdle(false);

            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => setIsIdle(true), timeout);
        }

        events.forEach(event => window.addEventListener(event, handleActivity));

        handleActivity();

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timeout]);

    return isIdle
}