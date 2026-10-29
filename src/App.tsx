import styles from './App.module.css'

/** Temporary shell. Routing and the real layout arrive in the routing step. */
export default function App() {
  return (
    <main className={styles.shell}>
      <h1 className={styles.title}>Leegality Store</h1>
      <p className={styles.subtitle}>
        Project foundation is ready. Product features are added in the next steps.
      </p>
    </main>
  )
}
