import Link from 'next/link';
import styles from '@/components/crud.module.css';

type Props = {
  title: string;
  description: string;
  features: string[];
  actionHref?: string;
  actionLabel?: string;
};

export function ModulePlaceholder({ title, description, features, actionHref, actionLabel }: Props) {
  return (
    <div className={styles.panel}>
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon} aria-hidden />
        <h2 className={styles.placeholderTitle}>{title}</h2>
        <p className={styles.placeholderBody}>{description}</p>
        <ul className={styles.placeholderList}>
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {actionHref && actionLabel && (
          <Link href={actionHref} className={styles.primaryBtn}>
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
