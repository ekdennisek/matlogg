import { H1, Body } from "@/components/Typography";
import styles from "./welcome.module.css";

export default function WelcomePage() {
  return (
    <main className={styles.welcome}>
      <div className={styles.card}>
        <H1>Matlogg</H1>
        <Body muted>
          This is a smartphone-only app for scanning food barcodes, building
          recipes and sharing them. Open it on your phone to get started.
        </Body>
      </div>
    </main>
  );
}
