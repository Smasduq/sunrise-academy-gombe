'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './news.module.css';
import { NEWS_ITEMS, EVENTS } from '@/lib/data';
import { Icon } from '@/components/Icon/Icon';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function NewsClient() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');

  const filteredNews = useMemo(() =>
    NEWS_ITEMS.filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        n.category.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <div className={styles.page}>
      {/* Banner */}
      <section className={styles.pageBanner}>
        <div className={styles.bannerOverlay} />
        <div className={`container ${styles.bannerContent}`}>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            News &amp; Events
          </span>
          <h1 className={styles.bannerTitle}>School News &amp; Events</h1>
          <p className={styles.bannerSub}>Stay updated with the latest happenings at Sunrise Academy</p>
        </div>
      </section>

      <section className={`section ${styles.mainSection}`}>
        <div className="container">
          {/* Search + Tabs */}
          <div className={styles.controls}>
            <div className={styles.tabs} role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'news'}
                className={`${styles.tab} ${activeTab === 'news' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('news')}
              >
                <Icon name="book" size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> News
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'events'}
                className={`${styles.tab} ${activeTab === 'events' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('events')}
              >
                <Icon name="clock" size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Events
              </button>
            </div>
            {activeTab === 'news' && (
              <div className={styles.searchWrap}>
                <span className={styles.searchIcon}>
                  <Icon name="search" size={18} />
                </span>
                <input
                  type="search"
                  placeholder="Search news..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search news articles"
                />
              </div>
            )}
          </div>

          {/* NEWS TAB */}
          {activeTab === 'news' && (
            <>
              {/* Featured */}
              {filteredNews.length > 0 && (
                <div className={styles.featured}>
                  <div className={styles.featuredImage}>
                    <Image
                      src={filteredNews[0].image}
                      alt={filteredNews[0].title}
                      fill
                      className={styles.featImg}
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority
                    />
                    <span className={styles.featCategory}>{filteredNews[0].category}</span>
                  </div>
                  <div className={styles.featuredBody}>
                    <time className={styles.date} dateTime={filteredNews[0].date}>
                      {formatDate(filteredNews[0].date)}
                    </time>
                    <h2 className={styles.featTitle}>{filteredNews[0].title}</h2>
                    <p className={styles.featExcerpt}>{filteredNews[0].excerpt}</p>
                    <Link href={`/news/${filteredNews[0].slug}`} className="btn btn-primary">
                      Read Full Story →
                    </Link>
                  </div>
                </div>
              )}

              {/* News Grid */}
              {filteredNews.length > 1 && (
                <div className={styles.newsGrid}>
                  {filteredNews.slice(1).map((item) => (
                    <article key={item.id} className={styles.newsCard}>
                      <div className={styles.newsImageWrap}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className={styles.newsImg}
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                        <span className={styles.newsCategory}>{item.category}</span>
                      </div>
                      <div className={styles.newsBody}>
                        <time className={styles.date} dateTime={item.date}>{formatDate(item.date)}</time>
                        <h3 className={styles.newsTitle}>{item.title}</h3>
                        <p className={styles.newsExcerpt}>{item.excerpt}</p>
                        <Link href={`/news/${item.slug}`} className={styles.readMore}>Read more →</Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {filteredNews.length === 0 && (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    <Icon name="empty" size={48} style={{ color: 'var(--color-text-light)' }} />
                  </span>
                  <p>No news articles match your search.</p>
                  <button className="btn btn-outline" onClick={() => setSearch('')}>Clear search</button>
                </div>
              )}
            </>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className={styles.eventsList}>
              {EVENTS.map((ev) => (
                <div key={ev.id} className={styles.eventCard}>
                  <div className={styles.eventDate}>
                    <span className={styles.eventDay}>
                      {new Date(ev.date).getDate()}
                    </span>
                    <span className={styles.eventMonth}>
                      {new Date(ev.date).toLocaleDateString('en-NG', { month: 'short' })}
                    </span>
                    <span className={styles.eventYear}>
                      {new Date(ev.date).getFullYear()}
                    </span>
                  </div>
                  <div className={styles.eventBody}>
                    <div className={styles.eventMeta}>
                      <span className={styles.eventCat}>{ev.category}</span>
                      <span className={styles.eventTime}>
                        <Icon name="clock" size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {ev.time}
                      </span>
                    </div>
                    <h3 className={styles.eventTitle}>{ev.title}</h3>
                    <p className={styles.eventDesc}>{ev.description}</p>
                    <div className={styles.eventLocation}>
                      <Icon name="location" size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} /> {ev.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
