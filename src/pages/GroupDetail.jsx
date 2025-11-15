
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import ExpenseItem from '../components/ExpenseItem';
import SettlementCard from '../components/SettlementCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './GroupDetail.css';

const getAuthHeaders = () => {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};


// Fetch helpers
const fetchAPI = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw error;
  }
  return response.json();
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    paidBy: '',
  });

  const fetchGroupData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupRes, expensesRes, settlementsRes, summaryRes] = await Promise.all([
        fetch(`https://smart-expense-splitter-backend.vercel.app/api/groups/${groupId}`, { headers: getAuthHeaders() }),
        fetchAPI(`https://smart-expense-splitter-backend.vercel.app/api/expenses/group/${groupId}`),
        fetchAPI(`https://smart-expense-splitter-backend.vercel.app/api/settlements/${groupId}`),
        fetchAPI(`https://smart-expense-splitter-backend.vercel.app/api/settlements/${groupId}/summary`),
      ]);

      if (!groupRes.ok) {
        const gerr = await groupRes.json().catch(() => ({}));
        throw gerr;
      }

      const groupData = await groupRes.json();
      setGroup(groupData.group);

      // Fetch helpers already return parsed objects
      setExpenses(expensesRes.expenses || []);
      setSettlements(settlementsRes.settlements || []);
      setSummary(summaryRes.summary || null);
    } catch (error) {
      toast.error(error.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://smart-expense-splitter-backend.vercel.app/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: newMemberEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw data;
      toast.success('Member added successfully!');
      setNewMemberEmail('');
      setShowMemberModal(false);
      fetchGroupData();
    } catch (error) {
      toast.error(error.message || 'Failed to add member');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        groupId,
        ...formData,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        participants: group.members.map((m) => m.userId._id),
      };

      if (editMode && editingExpenseId) {
        await fetchAPI(`https://smart-expense-splitter-backend.vercel.app/api/expenses/${editingExpenseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Expense updated successfully!');
      } else {
        await fetchAPI('https://smart-expense-splitter-backend.vercel.app/api/expenses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Expense added successfully!');
      }

      setFormData({ description: '', amount: '', category: 'other', paidBy: '' });
      setShowExpenseModal(false);
      setEditMode(false);
      setEditingExpenseId(null);
      fetchGroupData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save expense');
    }
  };

  const handleEditExpense = (expense) => {
    setFormData({
      description: expense.description || '',
      amount: expense.amount || '',
      category: expense.category || 'other',
      paidBy: expense.paidBy?._id || expense.paidBy || '',
    });
    setEditingExpenseId(expense._id);
    setEditMode(true);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await fetchAPI(`https://smart-expense-splitter-backend.vercel.app/api/expenses/${expenseId}`, {
          method: 'DELETE',
        });
        toast.success('Expense deleted successfully!');
        fetchGroupData();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleSettlePayment = async (settlementId) => {
    try {
      await fetchAPI(`https://smart-expense-splitter-backend.vercel.app/api/settlements/${settlementId}/settle`, {
        method: 'PUT',
      });
      toast.success('Payment marked as settled!');
      fetchGroupData();
    } catch (error) {
      toast.error('Failed to settle payment');
    }
  };

  const handleExportReport = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`https://smart-expense-splitter-backend.vercel.app/api/settlements/${groupId}/report`, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw err;
      }
      const csvText = await res.text();
      
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense-report-${groupId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to export report');
    }
  };

  if (loading) return <LoadingSpinner message="Loading group details..." />;
  if (!group) return <div className="error-message">Group not found</div>;

  return (
    <div className="group-detail-container">
      <div className="group-header">
        <div>
          <h1>{group.name}</h1>
          <p>{group.description}</p>
        </div>
        <div className="group-actions">
          <button onClick={() => setShowMemberModal(true)} className="action-btn">
            + Add Member
          </button>
          <button onClick={handleExportReport} className="action-btn export-btn">
            📊 Export Report
          </button>
        </div>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p className="amount">{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className="summary-card">
            <h3>Unsettled Amount</h3>
            <p className="amount">{formatCurrency(summary.totalUnsettled)}</p>
          </div>
          <div className="summary-card">
            <h3>Pending Settlements</h3>
            <p className="amount">{summary.pendingSettlements}</p>
          </div>
        </div>
      )}

      <div className="group-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses ({expenses.length})
          </button>
          <button
            className={`tab ${activeTab === 'settlements' ? 'active' : ''}`}
            onClick={() => setActiveTab('settlements')}
          >
            Settlements ({settlements.length})
          </button>
          <button
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members ({group.members.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'expenses' && (
            <div className="expenses-section">
              <button onClick={() => setShowExpenseModal(true)} className="add-btn">
                + Add Expense
              </button>
              {expenses.length === 0 ? (
                <p className="empty-message">No expenses yet. Add one to get started!</p>
              ) : (
                <div className="expenses-list">
                  {expenses.map((expense) => (
                    <ExpenseItem
                      key={expense._id}
                      expense={expense}
                      onDelete={handleDeleteExpense}
                      onEdit={handleEditExpense}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settlements' && (
            <div className="settlements-section">
              {settlements.length === 0 ? (
                <p className="empty-message">No pending settlements!</p>
              ) : (
                <div className="settlements-list">
                  {settlements.map((settlement) => (
                    <SettlementCard
                      key={settlement._id}
                      settlement={settlement}
                      onSettle={handleSettlePayment}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="members-section">
              <div className="members-list">
                {group.members.map((member) => (
                  <div key={member.userId._id} className="member-item">
                    <span className="member-name">{member.userId.name}</span>
                    <span className="member-email">{member.userId.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Expense</h2>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="food">Food</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Paid By *</label>
                <select
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                  required
                >
                  <option value="">Select a member</option>
                  {group.members.map((member) => (
                    <option key={member.userId._id} value={member.userId._id}>
                      {member.userId.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
