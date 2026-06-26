const COMPANY_LINKS = ["About Us", "Careers", "Press", "Blog"];
const SUPPORT_LINKS = ["Help Center", "Contact Us", "FAQs", "Terms of Service"];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <img src="/cbvlogotext.svg" alt="Carter Bank Voucher" className="footer-brand-logo" />
            <p className="footer-brand-tagline">
              Your one-stop marketplace for redeeming reward points on the best
              deals from top brands worldwide.
            </p>
          </div>

          <div>
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-link-list">
              {COMPANY_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className="footer-link">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-link-list">
              {SUPPORT_LINKS.map((label) => (
                <li key={label}>
                  <a href="#" className="footer-link">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Newsletter</h3>
            <p className="footer-newsletter-text">
              Get the latest deals straight to your inbox.
            </p>
            <form className="footer-newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                className="footer-newsletter-input"
              />
              <button type="submit" className="footer-newsletter-button">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="footer-copyright">
          © {new Date().getFullYear()} Carter Bank Berhad. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
