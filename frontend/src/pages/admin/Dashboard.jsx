import Sidebar from "../../components/Sidebar";
import SystemOverview from "./SystemOverview";
import AnalyticsReports from "./AnalyticsReports";

export default function AdminDashboard() {
  return (
    <div className="admin-shell">
      <Sidebar sessionCount={3} />

      <div className="admin-content">
        <main className="admin-main">
          <SystemOverview />
          <AnalyticsReports />
        </main>

        <footer className="admin-footer">
          <div className="admin-footer-inner">
            <span>Carter Bank Voucher Capstone Project 2026</span>
            <nav aria-label="Admin footer links" className="admin-footer-nav">
              <a href="#" className="admin-footer-link">
                Documentation
              </a>
              <a href="#" className="admin-footer-link">
                Support Ticket
              </a>
              <button type="button" className="admin-footer-logout">
                Logout
              </button>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
