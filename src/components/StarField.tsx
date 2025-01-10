'use client';
import { useEffect } from 'react';

export default function StarField() {
  useEffect(() => {
    const createStar = () => {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.width = Math.random() * 3 + 'px';
      star.style.height = star.style.width;
      star.style.left = Math.random() * window.innerWidth + 'px';
      star.style.top = Math.random() * window.innerHeight + 'px';
      document.body.appendChild(star);
    };

    for (let i = 0; i < 100; i++) {
      createStar();
    }

    return () => {
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => star.remove());
    };
  }, []);

  return null;
} 