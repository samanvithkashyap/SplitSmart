import { useCallback, useEffect, useState } from 'react';
import { Wallet, Trash, Plus } from '@phosphor-icons/react';
import Button from '../../ui/button/Button.jsx';
import { useApi } from '../../../hooks/useApi.js';
import './Expenses.css';

const defaultForm = {
	title: '',
	amount: '',
	category: 'food',
	date: new Date().toISOString().slice(0, 10),
	notes: '',
};

export default function Expenses() {
	const { request } = useApi();
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [form, setForm] = useState(defaultForm);
	const [showForm, setShowForm] = useState(false);
	const [filter, setFilter] = useState('all');

	const fetchExpenses = useCallback(() => {
		setLoading(true);
		request('/expenses')
			.then((data) => setExpenses(data.expenses || []))
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, [request]);

	useEffect(() => {
		fetchExpenses();
	}, [fetchExpenses]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const payload = {
				...form,
				amount: Number(form.amount),
			};
			await request('/expenses', { method: 'POST', body: payload });
			setForm(defaultForm);
			setShowForm(false);
			fetchExpenses();
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this expense?')) return;
		try {
			await request(`/expenses/${id}`, { method: 'DELETE' });
			fetchExpenses();
		} catch (err) {
			setError(err.message);
		}
	};

	const filteredExpenses = expenses.filter(exp => {
		if (filter === 'all') return true;
		return exp.category === filter;
	});

	const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

	return (
		<div className="expenses">
			<div className="expenses__header">
				<div>
					<h2 className="expenses__title">Expenses</h2>
					<p className="expenses__subtitle">Track and manage your spending</p>
				</div>
				<Button onClick={() => setShowForm(!showForm)}>
					<Plus size={20} weight="bold" />
					Add Expense
				</Button>
			</div>

			{showForm && (
				<div className="expenses__form-card">
					<h3>New Expense</h3>
					{error && <p className="error-message">{error}</p>}
					<form onSubmit={handleSubmit} className="expense-form">
						<div className="form-row">
							<label className="form-field">
								<span>Title</span>
								<input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Lunch at cafe" required />
							</label>
							<label className="form-field">
								<span>Amount</span>
								<input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00" required />
							</label>
						</div>
						<div className="form-row">
							<label className="form-field">
								<span>Category</span>
								<select name="category" value={form.category} onChange={handleChange}>
									<option value="food">Food</option>
									<option value="transport">Transport</option>
									<option value="shopping">Shopping</option>
									<option value="entertainment">Entertainment</option>
									<option value="utilities">Utilities</option>
									<option value="health">Health</option>
									<option value="other">Other</option>
								</select>
							</label>
							<label className="form-field">
								<span>Date</span>
								<input name="date" type="date" value={form.date} onChange={handleChange} />
							</label>
						</div>
						<label className="form-field">
							<span>Notes (optional)</span>
							<textarea name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Add any additional details..." />
						</label>
						<div className="form-actions">
							<Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
							<Button type="submit">Save Expense</Button>
						</div>
					</form>
				</div>
			)}

			<div className="expenses__filters">
				<button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
				<button className={`filter-btn ${filter === 'food' ? 'active' : ''}`} onClick={() => setFilter('food')}>Food</button>
				<button className={`filter-btn ${filter === 'transport' ? 'active' : ''}`} onClick={() => setFilter('transport')}>Transport</button>
				<button className={`filter-btn ${filter === 'shopping' ? 'active' : ''}`} onClick={() => setFilter('shopping')}>Shopping</button>
				<button className={`filter-btn ${filter === 'entertainment' ? 'active' : ''}`} onClick={() => setFilter('entertainment')}>Entertainment</button>
				<button className={`filter-btn ${filter === 'utilities' ? 'active' : ''}`} onClick={() => setFilter('utilities')}>Utilities</button>
			</div>

			<div className="expenses__summary">
				<div className="summary-card">
					<Wallet size={24} weight="duotone" />
					<div>
						<p className="summary-label">Total Expenses</p>
						<p className="summary-value">₹{totalExpenses.toFixed(2)}</p>
					</div>
				</div>
				<div className="summary-card">
					<p className="summary-label">Count</p>
					<p className="summary-value">{filteredExpenses.length}</p>
				</div>
			</div>

			{loading ? (
				<div className="expenses-loading">Loading expenses...</div>
			) : (
				<div className="expenses__list">
					{filteredExpenses.length === 0 ? (
						<div className="empty-state">
							<Wallet size={48} weight="duotone" />
							<p>No expenses found</p>
							<Button onClick={() => setShowForm(true)}>Add your first expense</Button>
						</div>
					) : (
						filteredExpenses.map((expense) => (
							<div key={expense._id} className="expense-card">
								<div className="expense-card__icon">
									<Wallet size={20} weight="duotone" />
								</div>
								<div className="expense-card__content">
									<h4 className="expense-card__description">{expense.title}</h4>
									<div className="expense-card__meta">
										<span className="expense-category">{expense.category}</span>
										<span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
									</div>
									{expense.notes && <p className="expense-notes">{expense.notes}</p>}
								</div>
								<div className="expense-card__actions">
									<p className="expense-amount">₹{expense.amount?.toFixed(2)}</p>
									<button className="delete-btn" onClick={() => handleDelete(expense._id)}>
										<Trash size={18} weight="bold" />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
