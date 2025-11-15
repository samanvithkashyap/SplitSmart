import { useCallback, useEffect, useState } from 'react';
import { Plus, Users, Trash, Calendar, Check } from '@phosphor-icons/react';
import Button from '../../ui/button/Button.jsx';
import { useApi } from '../../../hooks/useApi.js';
import './Bills.css';

const defaultBill = {
  description: '',
  total: '',
  dueDate: '',
};

const defaultParticipant = {
  name: '',
  share: '',
};

export default function Bills() {
  const { request } = useApi();
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState(defaultBill);
  const [participants, setParticipants] = useState([{ name: '', share: '' }, { name: '', share: '' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBills = useCallback(() => {
    setLoading(true);
    request('/bills')
      .then((data) => setBills(data.bills || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [request]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', share: '' }]);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validParticipants = participants
        .filter((p) => p.name && p.share)
        .map((p) => ({ name: p.name, share: Number(p.share) }));

      if (validParticipants.length === 0) {
        setError('Add at least one participant');
        return;
      }

      await request('/bills', {
        method: 'POST',
        body: {
          description: form.description,
          total: Number(form.total),
          participants: validParticipants,
          dueDate: form.dueDate || undefined,
        },
      });
      
      setForm(defaultBill);
      setParticipants([{ name: '', share: '' }, { name: '', share: '' }]);
      setShowForm(false);
      setError(null);
      fetchBills();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return;
    try {
      await request(`/bills/${id}`, { method: 'DELETE' });
      fetchBills();
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = {
    total: bills.length,
    open: bills.filter((b) => b.status === 'open').length,
    settled: bills.filter((b) => b.status === 'settled').length,
    totalAmount: bills.reduce((sum, b) => sum + b.total, 0),
  };

  return (
    <div className="bills">
      <div className="bills__header">
        <div>
          <h2 className="bills__title">Bill Splitting</h2>
          <p className="bills__subtitle">Split expenses with friends and track payments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} weight="bold" />
          Create Bill
        </Button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showForm && (
        <div className="bills__form-card">
          <h3>New Bill</h3>
          <form onSubmit={handleSubmit} className="bill-form">
            <div className="form-row">
              <label className="form-field">
                <span>Description</span>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g., Dinner at restaurant"
                  required
                />
              </label>
              <label className="form-field">
                <span>Total Amount</span>
                <input
                  name="total"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </label>
              <label className="form-field">
                <span>Due Date (optional)</span>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="participants-section">
              <div className="participants-header">
                <h4>Participants</h4>
                <button type="button" className="add-btn" onClick={addParticipant}>
                  <Plus size={16} weight="bold" />
                  Add Person
                </button>
              </div>
              
              {participants.map((participant, index) => (
                <div key={index} className="participant-row">
                  <input
                    type="text"
                    placeholder="Person name"
                    value={participant.name}
                    onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Share amount"
                    min="0"
                    step="0.01"
                    value={participant.share}
                    onChange={(e) => handleParticipantChange(index, 'share', e.target.value)}
                    required
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeParticipant(index)}
                    >
                      <Trash size={18} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Bill</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bills__stats">
        <div className="stat-card">
          <Users size={24} weight="duotone" />
          <div>
            <p className="stat-label">Total Bills</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <Calendar size={24} weight="duotone" />
          <div>
            <p className="stat-label">Open</p>
            <p className="stat-value">{stats.open}</p>
          </div>
        </div>
        <div className="stat-card">
          <Check size={24} weight="duotone" />
          <div>
            <p className="stat-label">Settled</p>
            <p className="stat-value">{stats.settled}</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="rupee-icon">₹</span>
          <div>
            <p className="stat-label">Total Amount</p>
            <p className="stat-value">₹{stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bills-loading">Loading bills...</div>
      ) : (
        <div className="bills__list">
          {bills.length === 0 ? (
            <div className="empty-state">
              <Users size={48} weight="duotone" />
              <p>No bills yet</p>
              <Button onClick={() => setShowForm(true)}>Create your first bill</Button>
            </div>
          ) : (
            bills.map((bill) => (
              <div key={bill._id} className="bill-card">
                <div className="bill-card__header">
                  <div>
                    <h3>{bill.description}</h3>
                    <span className={`badge badge--${bill.status}`}>
                      {bill.status}
                    </span>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(bill._id)}>
                    <Trash size={18} weight="bold" />
                  </button>
                </div>
                <div className="bill-card__details">
                  <p className="bill-total">Total: ₹{bill.total.toFixed(2)}</p>
                  {bill.dueDate && (
                    <p className="bill-due">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="bill-card__participants">
                  <h4>Participants</h4>
                  {bill.participants?.map((p, idx) => (
                    <div key={idx} className="participant">
                      <span className="participant-name">{p.name}</span>
                      <span className="participant-share">₹{p.share.toFixed(2)}</span>
                      <span className={`participant-status ${p.settled ? 'settled' : 'pending'}`}>
                        {p.settled ? '✓ Settled' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
