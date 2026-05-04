"use client";

import { useEffect, useState, useRef } from "react";

const videoFiles = [
  "/videos/young-life-1.mp4",
  "/videos/young-life-2.mp4",
  "/videos/young-life-3.mp4",
];

export default function VideoBackground() {
  const [videoSrc, setVideoSrc] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * videoFiles.length);
    setVideoSrc(videoFiles[randomIndex]);
  }, []);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  if (!videoSrc) return null;

  return (
    <video
      ref={videoRef}
      key={videoSrc}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
      style={{ opacity: 0, transition: 'opacity 1s ease-in' }}
      onLoadedData={(e) => { e.target.style.opacity = '0.4' }}
      onError={(e) => { e.target.style.display = 'none'; }}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  );
}
