'use client';

import { useEffect } from 'react';

// Blocks the right-click menu and dragging on images, to discourage casual saving.
// Note: this cannot fully stop someone from getting an image (screenshots and browser tools still work).
export default function ProtectImages() {
  useEffect(() => {
    const isImg = (e) => e.target && e.target.tagName === 'IMG';
    const onContext = (e) => { if (isImg(e)) e.preventDefault(); };
    const onDrag = (e) => { if (isImg(e)) e.preventDefault(); };
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('dragstart', onDrag);
    return () => {
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('dragstart', onDrag);
    };
  }, []);
  return null;
}
