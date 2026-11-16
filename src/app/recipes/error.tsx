
"use client";

export default function RecipesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-container">
      <div className="state-card">
        <h1>Something went wrong</h1>
        <p>We couldn't load your recipes. Please try again.</p>
        <button className="primary-button" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}
