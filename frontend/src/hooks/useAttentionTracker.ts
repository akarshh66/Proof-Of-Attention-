import { useEffect, useState } from "react";

const REQUIRED_TIME = 60; // seconds

export default function useAttentionTracker() {
    const [timeSpent, setTimeSpent] = useState(0);
    const [isFocused, setIsFocused] = useState(true);
    const [isIdle, setIsIdle] = useState(false);
    const [idleTime, setIdleTime] = useState(0);
    const [focusEvents, setFocusEvents] = useState<Array<{ timestamp: number; focused: boolean }>>([]);
    const [idleEvents, setIdleEvents] = useState<Array<{ timestamp: number; idle: boolean }>>([]);
    const [activityCount, setActivityCount] = useState(0);

    useEffect(() => {
        const activityEvents = ["mousemove", "keydown", "scroll", "click"];

        const onActivity = () => {
            setIdleTime(0);
            setIsIdle(false);
            setActivityCount(c => c + 1);
        };

        activityEvents.forEach(event =>
            window.addEventListener(event, onActivity)
        );

        const timer = setInterval(() => {
            if (document.hasFocus() && !isIdle) {
                setTimeSpent(t => t + 1);
            } else {
                setIdleTime(t => t + 1);
            }

            if (idleTime >= 5) {
                setIsIdle(true);
                // Record idle event
                setIdleEvents(prev => [...prev, { timestamp: Date.now(), idle: true }]);
            }
        }, 1000);

        const onBlur = () => {
            setIsFocused(false);
            // Record focus event
            setFocusEvents(prev => [...prev, { timestamp: Date.now(), focused: false }]);
        };

        const onFocus = () => {
            setIsFocused(true);
            // Record focus event
            setFocusEvents(prev => [...prev, { timestamp: Date.now(), focused: true }]);
        };

        window.addEventListener("blur", onBlur);
        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(timer);
            activityEvents.forEach(event =>
                window.removeEventListener(event, onActivity)
            );
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("focus", onFocus);
        };
    }, [idleTime, isIdle]);

    const progressPercent = Math.min(
        Math.floor((timeSpent / REQUIRED_TIME) * 100),
        100
    );

    return {
        timeSpent,
        isFocused,
        isIdle,
        progressPercent,
        focusEvents,
        idleEvents,
        activityCount,
    };
}
