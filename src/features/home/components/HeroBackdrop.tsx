import HomeOcean from "./HomeOcean";

export default function HeroBackdrop({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className="home-hero" aria-hidden="true">
      <div className="home-hero-wash" />
      <div className="home-hero-bokeh" />
      <HomeOcean theme={theme} />
      <div className="home-hero-grain" />
      <div className="home-hero-vignette" />
    </div>
  );
}
