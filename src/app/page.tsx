
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";

const categories = [
  { name: "Breakfast", icon: "☀", count: "12 recipes" },
  { name: "Lunch", icon: "◉", count: "18 recipes" },
  { name: "Dinner", icon: "☾", count: "24 recipes" },
  { name: "Snacks", icon: "◇", count: "16 recipes" },
];

export default function Home() {
  const featured = recipes[0];

  return (
    <>
      <Navbar />

      <main className="page-container">
        <section className="welcome-section">
          <div>
            <span className="eyebrow">YOUR DAILY NOURISHMENT</span>
            <h1>Good morning, Camille</h1>
            <p>Your next delicious meal is just around the corner.</p>
          </div>
          <span className="streak-badge">5 Day Streak</span>
        </section>

        <section className="featured-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">TODAY'S HIGHLIGHT</span>
              <h2>Featured recipe</h2>
            </div>
            <Link href="/recipes" className="text-link">
              Explore all 
            </Link>
          </div>

          <Link
            href={`/recipes/${featured.id}`}
            className="featured-card"
          >
            <img src={featured.image} alt={featured.title} />
            <div className="featured-overlay">
              <span className="featured-tag">FEATURED RECIPE</span>
              <h2>{featured.title}</h2>
              <p>{featured.description}</p>
              <span className="featured-action">
                View recipe 
              </span>
            </div>
          </Link>
        </section>

        <section className="schedule-section" id="meal-planner">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR DAILY PLAN</span>
              <h2>Today's meal schedule</h2>
            </div>
            <span className="date-label">2 meals planned</span>
          </div>

          <div className="schedule-grid">
            <div className="schedule-item">
              <span className="schedule-time">BREAKFAST</span>
              <h3>Avocado Toast</h3>
              <p>8:00 AM · Planned</p>
            </div>
            <div className="schedule-item">
              <span className="schedule-time">LUNCH</span>
              <h3>Salmon Bowl</h3>
              <p>1:00 PM · Planned</p>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR NEXT MEAL</span>
              <h2>Explore by meal</h2>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                href={"/recipes"}
                key={category.name}
                className="category-card"
              >
                <span className="category-icon">{category.icon}</span>
                <strong>{category.name}</strong>
                <small>{category.count}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="trending-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COMMUNITY FAVOURITES</span>
              <h2>Trending this week</h2>
            </div>
            <Link href="/recipes" className="text-link">
              View all 
            </Link>
          </div>

          <div className="recipe-grid">
            {recipes.slice(0, 3).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
