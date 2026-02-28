'use client';

import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function AnimatedNumber({
    value,
    duration = 1500,
    className = '',
    prefix = '',
    suffix = '',
}: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const targetValue = value;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function: easeOutQuart
            const easeOut = 1 - Math.pow(1 - percentage, 4);
            const current = Math.floor(easeOut * targetValue);

            setDisplayValue(current);

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(targetValue);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={className}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}
