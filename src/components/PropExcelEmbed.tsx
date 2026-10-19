import Navbar from '@/components/Navbar';
import EmbedFooter from '@/components/EmbedFooter';
import styles from './PropExcelEmbed.module.css';

interface PropExcelEmbedProps {
  src: string;
  title: string;
}

/**
 * LivBiz chrome around the PropExcel catalog: header + compact footer.
 * Iframe fills the space between them so only the catalog scrolls.
 */
export default function PropExcelEmbed({ src, title }: PropExcelEmbedProps) {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <iframe src={src} title={title} className={styles.frame} />
      </main>
      <EmbedFooter />
    </div>
  );
}
