import { useEffect, useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { TrendUp, Wallet, PiggyBank, Users } from '@phosphor-icons/react';
import './Dashboard.css';

export default function Dashboard() {
  const { request } = useApi();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalBills: 0,
    totalSavings: 0,
    savingsProgress: 0,
    expenseCount: 0,
    billCount: 0,
    savingsCount: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch expenses
      const expensesData = await request('/expenses');
      const expenses = expensesData.expenses || [];
      
      // Fetch bills
      const billsData = await request('/bills');
      const bills = billsData.bills || [];
      
      // Fetch savings
      const savingsData = await request('/savings');
      const savings = savingsData.goals || [];
      
      // Calculate totals
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const totalBills = bills.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
      const totalSavings = savings.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
      const savingsTarget = savings.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
      const savingsProgress = savingsTarget > 0 ? (totalSavings / savingsTarget) * 100 : 0;
      
      setStats({
        totalExpenses,
        totalBills,
        totalSavings,
        savingsProgress,
        expenseCount: expenses.length,
        billCount: bills.length,
        savingsCount: savings.length
      });
      
      // Set recent items
      setRecentExpenses(expenses.slice(0, 5));
      setRecentBills(bills.filter(b => b.status === 'open').slice(0, 5));
      
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard__stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">
            <Wallet size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Total Expenses</p>
            <h2 className="stat-card__value">₹{stats.totalExpenses.toFixed(2)}</h2>
            <p className="stat-card__change stat-card__change--positive">
              {stats.expenseCount} expenses tracked
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--expense">
            <Users size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Total Bills</p>
            <h2 className="stat-card__value">₹{stats.totalBills.toFixed(2)}</h2>
            <p className="stat-card__change stat-card__change--positive">
              {stats.billCount} bills split
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--savings">
            <PiggyBank size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Total Savings</p>
            <h2 className="stat-card__value">₹{stats.totalSavings.toFixed(2)}</h2>
            <p className="stat-card__change stat-card__change--positive">
              {stats.savingsCount} goals active
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--income">
            <TrendUp size={32} weight="duotone" />
          </div>
          <div className="stat-card__content">
            <p className="stat-card__label">Savings Progress</p>
            <h2 className="stat-card__value">{stats.savingsProgress.toFixed(0)}%</h2>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${Math.min(stats.savingsProgress, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard__content">
        <div className="dashboard__section">
          <div className="section-header">
            <h3>Recent Expenses</h3>
            <a href="/expenses" className="section-header__link">View all</a>
          </div>
          <div className="expense-list">
            {recentExpenses.length === 0 ? (
              <p className="empty-state">No expenses yet</p>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-item__icon">
                    <Wallet size={20} weight="duotone" />
                  </div>
                  <div className="expense-item__details">
                    <p className="expense-item__description">{expense.title || 'No title'}</p>
                    <p className="expense-item__category">{expense.category || 'other'}</p>
                  </div>
                  <div className="expense-item__amount">
                    <p className="expense-item__value">₹{(expense.amount || 0).toFixed(2)}</p>
                    <p className="expense-item__date">
                      {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard__section">
          <div className="section-header">
            <h3>Open Bills</h3>
            <a href="/bills" className="section-header__link">View all</a>
          </div>
          <div className="bill-list">
            {recentBills.length === 0 ? (
              <p className="empty-state">No open bills</p>
            ) : (
              recentBills.map((bill) => (
                <div key={bill._id} className="bill-item">
                  <div className="bill-item__icon">
                    <Users size={20} weight="duotone" />
                  </div>
                  <div className="bill-item__details">
                    <p className="bill-item__description">{bill.description || 'No description'}</p>
                    <p className="bill-item__participants">
                      {bill.participants?.length || 0} participants
                    </p>
                  </div>
                  <div className="bill-item__amount">
                    <p className="bill-item__value">₹{(bill.totalAmount || 0).toFixed(2)}</p>
                    <span className={`bill-item__status bill-item__status--${bill.status}`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
