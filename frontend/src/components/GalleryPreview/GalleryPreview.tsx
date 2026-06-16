import Image from 'next/image';
import Link from 'next/link';
import styles from './GalleryPreview.module.css';
import { GALLERY_IMAGES } from '@/lib/data';

export default function GalleryPreview() {
  const previewImages = GALLERY_IMAGES.slice(0, 4);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="gallery-preview-heading">
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.text}>
            <span className={styles.badge}>Our Gallery</span>
            <h2 id="gallery-preview-heading" className={styles.title}>
              Life at Sunrise Academy
            </h2>
            <p className={styles.desc}>
              Explore our vibrant campus life — from stimulating classrooms and state-of-the-art labs to exciting events and cultural celebrations.
            </p>
            <div className={styles.actions}>
              <Link href="/gallery" className="btn btn-white btn-lg">
                View Full Gallery →
              </Link>
              <Link href="/about" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                About Us
              </Link>
            </div>
          </div>

          <div className={styles.imageGrid} aria-label="Gallery preview images">
            {previewImages.map((img) => (
              <div key={img.id} className={styles.imageWrap}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className={styles.galleryImage}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
