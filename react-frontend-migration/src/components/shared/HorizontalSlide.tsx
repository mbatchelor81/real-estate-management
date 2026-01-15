import { useRef, useCallback, useState } from 'react';

interface HorizontalSlideProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalSlide({
  children,
  className = '',
}: HorizontalSlideProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({
    startX: 0,
    scrollLeft: 0,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      const container = containerRef.current;
      if (!container) return;

      setIsDragging(true);
      dragState.current.startX = e.pageX - container.offsetLeft;
      dragState.current.scrollLeft = container.scrollLeft;
    },
    []
  );

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!isDragging) return;

      const container = containerRef.current;
      if (!container) return;

      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const scroll = x - dragState.current.startX;
      container.scrollLeft = dragState.current.scrollLeft - scroll;
    },
    [isDragging]
  );

  return (
    <div
      ref={containerRef}
      className={`flex flex-nowrap overflow-x-auto scrollbar-hide ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}
