import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({ onLongPress, onClick, delay = 500 }: LongPressOptions) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    setIsPressed(true);

    // Store start position for touch events
    if (e && 'touches' in e) {
      startPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }

    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
      setIsPressed(false);
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    setIsPressed(false);
    startPos.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleMove = useCallback((e: React.TouchEvent) => {
    if (startPos.current) {
      const moveX = Math.abs(e.touches[0].clientX - startPos.current.x);
      const moveY = Math.abs(e.touches[0].clientY - startPos.current.y);

      // If moved more than 10px, it's a scroll or drag, not a long press
      if (moveX > 10 || moveY > 10) {
        cancel();
      }
    }
  }, [cancel]);

  const handleClick = useCallback(() => {
    if (!isLongPress.current && onClick) {
      onClick();
    }
  }, [onClick]);

  return {
    isPressed,
    handlers: {
      onMouseDown: (e: React.MouseEvent) => start(e),
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: (e: React.TouchEvent) => start(e),
      onTouchEnd: cancel,
      onTouchMove: handleMove,
      onClick: handleClick,
    },
  };
}
