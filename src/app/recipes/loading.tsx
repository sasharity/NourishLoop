
export default function Loading() {
  return (
    <main className="page-container">
      <p className="eyebrow">YOUR RECIPE LIBRARY</p>
      <h1>Loading recipes...</h1>
      <div className="recipe-grid">
        {[1, 2, 3].map((item) => (
          <div className="recipe-card loading-card" key={item}>
            <div className="loading-image" />
            <div className="recipe-card-content">
              <div className="loading-line" />
              <div className="loading-line short" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
