'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './gallery.module.css';
import { GALLERY_IMAGES } from '@/lib/data';
import type { GalleryCategory, GalleryImage } from '@/types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CATEGORIES: { label: string; value: GalleryCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Classrooms', value: 'classrooms' },
  { label: 'Events', value: 'events' },
  { label: 'Activities', value: 'activities' },
];

export default function GalleryClient() {
  const [active, setActive] = useState<GalleryCategory>('all');
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const filtered = active === 'all'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter((img) => img.category === active);

  const currentIndex = lightbox ? filtered.findIndex((i) => i.id === lightbox.id) : -1;

  const goNext = () => {
    if (currentIndex < filtered.length - 1) setLightbox(filtered[currentIndex + 1]);
  };
  const goPrev = () => {
    if (currentIndex > 0) setLightbox(filtered[currentIndex - 1]);
  };

  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Gallery
          </span>
          <h1 className={styles.bannerTitle}>Life at Sunrise Academy</h1>
          <p className={styles.bannerSub}>Explore our vibrant school community through the lens</p>
        </div>
      </section>

      {/* Gallery */}
      <section className={`section ${styles.gallerySection}`} aria-labelledby="gallery-heading">
        <div className="container">
          <h2 id="gallery-heading" className="sr-only">Photo Gallery</h2>

          {/* Filter tabs */}
          <div className={styles.filters} role="tablist" aria-label="Gallery categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                role="tab"
                aria-selected={active === cat.value}
                className={`${styles.filterBtn} ${active === cat.value ? styles.filterActive : ''}`}
                onClick={() => setActive(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className={styles.masonryGrid} role="list">
            {filtered.map((img) => (
              <button
                key={img.id}
                role="listitem"
                className={styles.masonryItem}
                onClick={() => setLightbox(img)}
                aria-label={`View image: ${img.alt}`}
              >
                <div className={styles.imgWrap}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className={styles.galleryImg}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className={styles.imgOverlay}>
                    <span className={styles.zoomIcon}>
                      <MagnifyingGlassIcon className={styles.zoomIcon} />
                    </span>
                    <span className={styles.imgAlt}>{img.alt}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer: ${lightbox.alt}`}
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }}
        >
          <button className={styles.lbClose} onClick={() => setLightbox(null)} aria-label="Close lightbox">✕</button>

          <button
            className={`${styles.lbNav} ${styles.lbPrev}`}
            onClick={goPrev}
            disabled={currentIndex === 0}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className={styles.lbContent}>
            <div className={styles.lbImgWrap}>
              <Image
                src={lightbox.src}
                alt={lightbox.alt}
                fill
                className={styles.lbImg}
                sizes="90vw"
                priority
              />
            </div>
            <p className={styles.lbCaption}>{lightbox.alt}</p>
            <span className={styles.lbCounter}>{currentIndex + 1} / {filtered.length}</span>
          </div>

          <button
            className={`${styles.lbNav} ${styles.lbNext}`}
            onClick={goNext}
            disabled={currentIndex === filtered.length - 1}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
