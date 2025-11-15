import { NavLink } from 'react-router-dom';
import { House, Wallet, Users, PiggyBank, ChartBar } from '@phosphor-icons/react';
import './Sidebar.css';

const links = [
  { to: '/dashboard', label: 'Home', icon: House },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/bills', label: 'Bill Splitting', icon: Users },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">Split Smart</span>
        <p className="sidebar__tagline">Stay on top of every rupee.</p>
      </div>
      <nav className="sidebar__nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon size={20} weight="duotone" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
