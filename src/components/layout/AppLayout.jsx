import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <div className="app-layout__sidebar">
        <Sidebar />
      </div>
      <main className="app-layout__main">
        <TopBar />
        <div className="app-layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
