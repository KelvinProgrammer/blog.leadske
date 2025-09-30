import Header from "../components/Header"
import HeroSection from "../components/HeroSection"
import FeaturedStories from "../components/FeaturedStories"
import Newsletter from "../components/Newsletter"
import Footer from "../components/Footer"

export default function NewsLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedStories />
      <Newsletter />
      <Footer />
    </div>
  )
}
