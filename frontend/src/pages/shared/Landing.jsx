import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Zap, TrendingUp, Users, Award } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "300+ Exclusive Brands",
    description: "Access premium vouchers from top merchants across food, tech, travel, fashion, and more.",
  },
  {
    icon: TrendingUp,
    title: "Earn Points on Every Redemption",
    description: "Collect points with each purchase and unlock even better deals over time.",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Receive your voucher codes immediately via email after redemption.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & Secure",
    description: "All vouchers are verified and guaranteed. Shop with confidence.",
  },
  {
    icon: Users,
    title: "Join 50,000+ Smart Shoppers",
    description: "Be part of a growing community that saves money every day.",
  },
  {
    icon: Award,
    title: "Early Access to Limited Deals",
    description: "Get first access to flash sales and exclusive member-only promotions.",
  },
];

const STATS = [
  { value: "300+", label: "Brand Partners" },
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Vouchers Redeemed" },
  { value: "RM 2.5M+", label: "Total Savings" },
];

const TESTIMONIALS = [
  {
    quote: "I saved over RM500 in a single month using VoucherHub. It's the best deal platform I've ever used.",
    author: "Sarah Lim",
    location: "Kuala Lumpur",
  },
  {
    quote: "Best voucher platform I've ever used. Signing up took under a minute and I instantly found deals I didn't know existed.",
    author: "Daniel Lim",
    location: "Penang",
  },
  {
    quote: "The instant delivery is amazing. I used my voucher code right away at checkout. Highly recommended!",
    author: "Amir Hassan",
    location: "Johor Bahru",
  },
];

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            VoucherHub
          </Link>
          <nav className="landing-nav-links">
            {/* <Link to="/categories" className="landing-nav-link">
              Browse
            </Link> */}
            <Link to="/login" className="landing-nav-link">
              Login
            </Link>
            <Link to="/register" className="landing-nav-button">
              Sign Up Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Unlock Premium Savings <span className="landing-hero-highlight">Everywhere</span>.
            </h1>
            <p className="landing-hero-subtitle">
              Redeem your reward points for exclusive vouchers from hundreds of top brands.
              Join 50,000+ smart shoppers who save money every day.
            </p>
            <div className="landing-hero-actions">
              <Link to="/register" className="landing-hero-primary-button">
                Get Started Free
              </Link>
              <Link to="/categories" className="landing-hero-secondary-button">
                Browse Vouchers
              </Link>
            </div>
            <div className="landing-hero-stats">
              {STATS.map((stat) => (
                <div key={stat.label} className="landing-hero-stat">
                  <p className="landing-hero-stat-value">{stat.value}</p>
                  <p className="landing-hero-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-hero-card">
              <div className="landing-hero-card-header">
                <span className="landing-hero-card-badge">Limited Time</span>
                <span className="landing-hero-card-brand">Starbucks</span>
              </div>
              <div className="landing-hero-card-body">
                <p className="landing-hero-card-title">Free Grande Drink</p>
                <p className="landing-hero-card-desc">Get any Grande drink absolutely free</p>
              </div>
              <div className="landing-hero-card-footer">
                <span className="landing-hero-card-points">500 pts</span>
                <span className="landing-hero-card-cta">Redeem Now</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-features-inner">
          <div className="landing-section-header">
            <h2 className="landing-section-title">Why Choose VoucherHub?</h2>
            <p className="landing-section-subtitle">
              We make saving money simple, instant, and rewarding.
            </p>
          </div>
          <div className="landing-features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="landing-feature-card">
                <div className="landing-feature-icon">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how">
        <div className="landing-how-inner">
          <div className="landing-section-header">
            <h2 className="landing-section-title">How It Works</h2>
            <p className="landing-section-subtitle">Start saving in 3 simple steps</p>
          </div>
          <div className="landing-how-steps">
            <div className="landing-step">
              <div className="landing-step-number">1</div>
              <h3 className="landing-step-title">Create Free Account</h3>
              <p className="landing-step-desc">Sign up in seconds with just your email address.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">2</div>
              <h3 className="landing-step-title">Browse & Redeem</h3>
              <p className="landing-step-desc">Explore vouchers and redeem with your points.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">3</div>
              <h3 className="landing-step-title">Enjoy Savings</h3>
              <p className="landing-step-desc">Get your code instantly and use it at checkout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials">
        <div className="landing-testimonials-inner">
          <div className="landing-section-header">
            <h2 className="landing-section-title">Loved by Thousands</h2>
            <p className="landing-section-subtitle">See what our community has to say</p>
          </div>
          <div className="landing-testimonials-grid">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.author} className="landing-testimonial-card">
                <p className="landing-testimonial-quote">"{testimonial.quote}"</p>
                <div className="landing-testimonial-author">
                  <p className="landing-testimonial-name">{testimonial.author}</p>
                  <p className="landing-testimonial-location">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <h2 className="landing-cta-title">Ready to Start Saving?</h2>
          <p className="landing-cta-subtitle">
            Join thousands of smart shoppers. It's free to sign up.
          </p>
          <Link to="/register" className="landing-cta-button">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <p className="landing-footer-logo">VoucherHub</p>
            <p className="landing-footer-tagline">Unlock Premium Savings Everywhere</p>
          </div>
          <div className="landing-footer-links">
            <div className="landing-footer-col">
              <h4 className="landing-footer-heading">Company</h4>
              <Link to="/" className="landing-footer-link">About</Link>
              <Link to="/" className="landing-footer-link">Careers</Link>
              <Link to="/" className="landing-footer-link">Press</Link>
            </div>
            <div className="landing-footer-col">
              <h4 className="landing-footer-heading">Support</h4>
              <Link to="/" className="landing-footer-link">Help Center</Link>
              <Link to="/" className="landing-footer-link">Contact</Link>
              <Link to="/" className="landing-footer-link">FAQ</Link>
            </div>
            <div className="landing-footer-col">
              <h4 className="landing-footer-heading">Legal</h4>
              <Link to="/" className="landing-footer-link">Privacy</Link>
              <Link to="/" className="landing-footer-link">Terms</Link>
              <Link to="/" className="landing-footer-link">Cookies</Link>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p className="landing-footer-copyright">© {new Date().getFullYear()} VoucherHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}