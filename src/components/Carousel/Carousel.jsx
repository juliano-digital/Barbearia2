import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_CAROUSEL_IMAGES } from '../../lib/carouselImages';
import './Carousel.css';

export const Carousel = ({ images: configuredImages }) => {
  const images = Array.isArray(configuredImages) ? configuredImages : DEFAULT_CAROUSEL_IMAGES;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-frame">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
            style={{ '--slide-bg': `url(${img})` }}
          >
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handlePrev}
        className="carousel-nav-btn prev"
        aria-label="Slide anterior"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={handleNext}
        className="carousel-nav-btn next"
        aria-label="Próximo slide"
      >
        <ChevronRight />
      </button>

      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};