import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import Dashboard from './components/sections/dashboard/Dashboard.jsx';
import Expenses from './components/sections/expenses/Expenses.jsx';
import Bills from './components/sections/bills/Bills.jsx';
import Savings from './components/sections/savings/Savings.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="bills" element={<Bills />} />
          <Route path="savings" element={<Savings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
