'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function WorkspaceLottie() {
  const [animationData, setAnimationData] = useState<object>();

  useEffect(() => {
    // Fetching a free Lottie animation of a person working on a laptop
    fetch('https://assets3.lottiefiles.com/packages/lf20_w51pcehl.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading Lottie animation:", err));
  }, []);

  if (!animationData) {
    return (
      <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        Loading Animation...
      </div>
    );
  }

  return (
    <Lottie 
      animationData={animationData} 
      loop={true} 
      style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }} 
    />
  );
}
