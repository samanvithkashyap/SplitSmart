import './TopBar.css';

export default function TopBar() {
  return (
    <header className="topbar">
      <div>
        <h1>Welcome to Split Smart 👋</h1>
        <p>Track your expenses, split bills, and manage your finances.</p>
      </div>
      <div className="topbar__profile">
        <div
          className="avatar"
          style={{ background: '#f97316' }}
        >
        </div>
        <div>
          <p className="topbar__email">Finance Tracker</p>
        </div>
      </div>
    </header>
  );
}
