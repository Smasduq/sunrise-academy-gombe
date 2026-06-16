import Image from 'next/image';
import Link from 'next/link';
import styles from './NewsSection.module.css';
import { NEWS_ITEMS } from '@/lib/data';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function NewsSection() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="news-heading">
      <div className="container">
        <div className={styles.top}>
          <div>
            <span className="section-badge">Latest News</span>
            <h2 id="news-heading" className="section-title">News &amp; Announcements</h2>
          </div>
          <Link href="/news" className={`btn btn-outline ${styles.viewAll}`}>
            View All News →
          </Link>
        </div>
        <div className={styles.grid}>
          {NEWS_ITEMS.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className={styles.body}>
                <div className={styles.meta}>
                  <span className={styles.category}>{item.category}</span>
                  <time className={styles.date} dateTime={item.date}>{formatDate(item.date)}</time>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.excerpt}>{item.excerpt}</p>
                <Link
                  href={`/news/${item.slug}`}
                  className={styles.readMore}
                  aria-label={`Read more about ${item.title}`}
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
