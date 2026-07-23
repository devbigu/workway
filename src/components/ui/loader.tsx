import styles from "./loader.module.css";

const letters = ["W", "O", "R", "K", "W", "A", "Y"];

export function Loader() {
  return (
    <div className={styles.loader} role="status" aria-label="Loading Workway">
      {letters.map((letter, index) => (
        <span
          className={styles[`square${index + 1}`]}
          aria-hidden="true"
          key={`${letter}-${index}`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
