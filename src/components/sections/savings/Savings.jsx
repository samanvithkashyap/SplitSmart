import { useCallback, useEffect, useState } from 'react';
import { PiggyBank, Plus, TrendUp, Calendar, Trash } from '@phosphor-icons/react';
import Button from '../../ui/button/Button.jsx';
import { useApi } from '../../../hooks/useApi.js';
import './Savings.css';

const initialGoal = {
	label: '',
	targetAmount: '',
	currentAmount: '0',
	deadline: '',
};

export default function Savings() {
	const { request } = useApi();
	const [goals, setGoals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [form, setForm] = useState(initialGoal);
	const [showForm, setShowForm] = useState(false);

	const fetchGoals = useCallback(() => {
		setLoading(true);
		request('/savings')
			.then((data) => setGoals(data.goals || []))
			.catch((e) => setError(e.message))
			.finally(() => setLoading(false));
	}, [request]);

	useEffect(() => {
		fetchGoals();
	}, [fetchGoals]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await request('/savings', {
method: 'POST',
body: {
...form,
targetAmount: Number(form.targetAmount),
currentAmount: Number(form.currentAmount || 0),
},
});
			setForm(initialGoal);
			setShowForm(false);
			fetchGoals();
		} catch (err) {
			setError(err.message);
		}
	};

	const handleAddProgress = async (goalId) => {
		const amount = prompt('Enter amount to add:');
		if (!amount || isNaN(amount)) return;
		try {
			await request(`/savings/${goalId}/progress`, {
method: 'POST',
body: { amount: Number(amount) },
});
			fetchGoals();
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm('Delete this savings goal?')) return;
		try {
			await request(`/savings/${id}`, { method: 'DELETE' });
			fetchGoals();
		} catch (err) {
			setError(err.message);
		}
	};

	return (
<div className="savings">
			<div className="savings__header">
				<div>
					<h2 className="savings__title">Savings Goals</h2>
					<p className="savings__subtitle">Set targets and track your progress</p>
				</div>
				<Button onClick={() => setShowForm(!showForm)}>
					<Plus size={20} weight="bold" />
					New Goal
				</Button>
			</div>

			{showForm && (
				<div className="savings__form-card">
					<h3>Create Savings Goal</h3>
					{error && <p className="error-message">{error}</p>}
					<form onSubmit={handleSubmit} className="savings-form">
						<div className="form-row">
							<label className="form-field">
								<span>Goal Name</span>
								<input name="label" value={form.label} onChange={handleChange} placeholder="e.g., New Laptop" required />
							</label>
							<label className="form-field">
								<span>Target Amount</span>
								<input name="targetAmount" type="number" min="0" step="0.01" value={form.targetAmount} onChange={handleChange} placeholder="0.00" required />
							</label>
						</div>
						<div className="form-row">
							<label className="form-field">
								<span>Current Amount</span>
								<input name="currentAmount" type="number" min="0" step="0.01" value={form.currentAmount} onChange={handleChange} placeholder="0.00" />
							</label>
							<label className="form-field">
								<span>Target Date</span>
								<input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
							</label>
						</div>
						<div className="form-actions">
							<Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
							<Button type="submit">Create Goal</Button>
						</div>
					</form>
				</div>
			)}

			{loading ? (
<div className="savings-loading">Loading savings goals...</div>
			) : (
<div className="savings__grid">
					{goals.length === 0 ? (
<div className="empty-state">
							<PiggyBank size={48} weight="duotone" />
							<p>No savings goals yet</p>
							<Button onClick={() => setShowForm(true)}>Create your first goal</Button>
						</div>
					) : (
goals.map((goal) => {
							const percent = goal.targetAmount ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
							const remaining = goal.targetAmount - goal.currentAmount;
							const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

							return (
<div key={goal._id} className="goal-card">
									<div className="goal-card__header">
										<div className="goal-card__icon">
											<PiggyBank size={24} weight="duotone" />
										</div>
										<button className="goal-delete-btn" onClick={() => handleDelete(goal._id)}>
											<Trash size={18} weight="bold" />
										</button>
									</div>

									<h3 className="goal-card__name">{goal.label}</h3>

									<div className="goal-card__progress">
										<div className="progress-header">
											<span className="progress-label">Progress</span>
											<span className="progress-percent">{percent}%</span>
										</div>
										<div className="progress-bar">
											<div className="progress-bar__fill" style={{ width: `${percent}%` }}></div>
										</div>
										<div className="progress-amounts">
											<span>₹{goal.currentAmount.toFixed(2)}</span>
											<span>₹{goal.targetAmount.toFixed(2)}</span>
										</div>
									</div>

									<div className="goal-card__stats">
										<div className="goal-stat">
											<TrendUp size={16} weight="duotone" />
											<div>
												<p className="goal-stat__label">Remaining</p>
												<p className="goal-stat__value">₹{remaining.toFixed(2)}</p>
											</div>
										</div>
										{daysLeft !== null && (
											<div className="goal-stat">
												<Calendar size={16} weight="duotone" />
												<div>
													<p className="goal-stat__label">Days Left</p>
													<p className="goal-stat__value">{daysLeft > 0 ? daysLeft : 'Overdue'}</p>
												</div>
											</div>
										)}
									</div>

									<Button variant="secondary" onClick={() => handleAddProgress(goal._id)} fullWidth>
										Add Progress
									</Button>
								</div>
							);
						})
					)}
				</div>
			)}
		</div>
	);
}
