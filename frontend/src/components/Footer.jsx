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
        </div>

        <div className="footer-copyright">
          © {new Date().getFullYear()} Carter Bank Berhad. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
