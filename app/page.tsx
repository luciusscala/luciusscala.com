"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Home() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    { src: "/flowers.jpg", alt: "flowers" },
    { src: "/ambassadors.jpg", alt: "ambassadors" },
    { src: "/murakami.jpg", alt: "murakami" }
  ];

  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  useEffect(() => {
    if (imageRef.current) {
      // Kill any existing animations
      gsap.killTweensOf(imageRef.current);
      
      // Reset position and rotation
      gsap.set(imageRef.current, { y: 0, rotation: 0, opacity: 0, scale: 0.95 });
      
      // Fade in the new image
      gsap.to(imageRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          // Start floating animation after fade-in
          const tl = gsap.timeline({ repeat: -1, yoyo: true });
          
          tl.to(imageRef.current, {
            y: -25,
            rotation: 2,
            duration: 2,
            ease: "power2.inOut"
          })
          .to(imageRef.current, {
            y: 0,
            rotation: 0,
            duration: 2,
            ease: "power2.inOut"
          });
        }
      });
    }
  }, [currentImageIndex]);

  return (
    <div className="flex flex-col min-h-screen gideon-roman-regular">
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative flex items-center justify-center w-full">
          <figure className="w-full max-w-[400px] flex flex-col items-center cursor-pointer" onClick={nextImage}>
            <Image
              ref={imageRef}
              src={currentImage.src}
              alt={currentImage.alt}
              width={400}
              height={274}
              className="object-contain rounded-xl ring-2 ring-white/60 dark:ring-[#2c2c25] shadow-2xl hover:scale-105 transition-all duration-500 w-full h-auto bg-white/60 dark:bg-[#26231d]/80"
              priority
            />
          </figure>
        </div>
      </main>
    </div>
  );
}
