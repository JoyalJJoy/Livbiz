'use client';

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function BookingLottie() {
  const [animationData, setAnimationData] = useState<object>();

  useEffect(() => {
    // Fetching a working Lottie animation
    // Fetching the local Lottie animation
    fetch('/images/calendar-lottie.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch Lottie JSON');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError('Expected JSON response');
        }
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading Lottie animation:", err));
  }, []);

  if (!animationData) {
    return <div style={{ height: '150px', width: '150px', margin: '0 auto' }}></div>;
  }

  return (
    <Lottie 
      animationData={animationData} 
      loop={true} 
      style={{ width: '150px', height: '150px', margin: '0 auto' }} 
    />
  );
}
