'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';
import { HERO_SLIDES, STATS } from '@/lib/data';

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setAnimKey((k) => k + 1);
  }, []);

  const prev = () => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = useCallback(() => goTo((current + 1) % HERO_SLIDES.length), [current, goTo]);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  const slide = HERO_SLIDES[current];

  return (
    <section className={styles.hero} aria-label="Hero banner">
      {/* Slides */}
      {HERO_SLIDES.map((s, i) => (
        <div key={s.id} className={`${styles.slide} ${i === current ? styles.active : ''}`}>
          <Image
            src={s.image}
            alt={s.alt}
            fill
            priority={i === 0}
            className={styles.slideImage}
            sizes="100vw"
          />
          <div className={styles.slideOverlay} />
        </div>
      ))}

      {/* Content */}
      <div className={`container ${styles.content}`} key={animKey}>
        <span className={styles.badge}>
          <span className={styles.dot} />
          Premier School in Gombe State
        </span>
        <h1 className={styles.title}>
          {slide.title.split('\n').map((line, i) =>
            i === 0 ? (
              <span key={i}>{line}<br /></span>
            ) : (
              <span key={i} className={styles.titleAccent}>{line}</span>
            )
          )}
        </h1>
        <p className={styles.subtitle}>{slide.subtitle}</p>
        <div className={styles.cta}>
          <Link href="/admissions" className="btn btn-secondary btn-lg">
            Apply Now →
          </Link>
          <Link href="/contact" className="btn btn-white btn-lg">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span>Scroll</span>
      </div>

      {/* Controls */}
      <div className={styles.controls} aria-label="Slider controls">
        <button
          className={styles.controlBtn}
          onClick={prev}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <div className={styles.dots} role="tablist" aria-label="Slides">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dotBtn} ${i === current ? styles.activeDot : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          className={styles.controlBtn}
          onClick={next}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      {/* Stats bar (desktop) */}
      <div className={styles.statsBar} aria-label="School statistics">
        <div className={`container ${styles.statsInner}`}>
          {STATS.map((stat) => (
            <div key={stat.id} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
