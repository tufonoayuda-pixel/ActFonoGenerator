import { useEffect, useRef } from 'react';

export default function FallingIcons() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const icons = [
      'fas fa-microphone',
      'fas fa-volume-up',
      'fas fa-comment',
      'fas fa-brain',
      'fas fa-user-md',
      'fas fa-child',
      'fas fa-heart',
      'fas fa-stethoscope',
      'fas fa-graduation-cap',
      'fas fa-puzzle-piece'
    ];

    const createFallingIcon = () => {
      if (!containerRef.current) return;

      const icon = document.createElement('i');
      icon.className = `${icons[Math.floor(Math.random() * icons.length)]} speech-icon`;
      icon.style.left = Math.random() * 100 + '%';
      icon.style.animationDuration = (Math.random() * 3 + 8) + 's';
      icon.style.animationDelay = Math.random() * 2 + 's';
      
      containerRef.current.appendChild(icon);
      
      setTimeout(() => {
        if (icon.parentNode) {
          icon.parentNode.removeChild(icon);
        }
      }, 15000);
    };

    const interval = setInterval(createFallingIcon, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div ref={containerRef} className="falling-icons" />;
}
