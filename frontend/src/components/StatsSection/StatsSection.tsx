import { memo } from 'react';
import styles from './StatsSection.module.css';
import { STATS } from '@/lib/data';
import { Icon } from '@/components/Icon/Icon';

function StatsSection() {
  return (
    <section className={`section ${styles.section}`} aria-label="School statistics">
      <div className="container">
        <div className={styles.grid}>
          {STATS.map((stat) => (
            <div key={stat.id} className={styles.card}>
              <span className={styles.iconWrap} aria-hidden="true">
                <Icon name={stat.icon} size={32} />
              </span>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(StatsSection);


