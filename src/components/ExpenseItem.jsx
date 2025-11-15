import React from 'react';
import './ExpenseItem.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  return (
    <div className="expense-item">
      <div className="expense-main">
        <div className="expense-info">
          <h4>{expense.description}</h4>
          <div className="expense-meta">
            <span className="expense-date">{formatDate(expense.date)}</span>
            <span className={`expense-category ${expense.category}`}>
              {expense.category}
            </span>
          </div>
        </div>
        <div className="expense-amount">{formatCurrency(expense.amount)}</div>
      </div>
      <div className="expense-footer">
        <span className="paid-by">Paid by: {expense.paidBy?.name}</span>
        <div className="action-buttons">
          <button
            className="edit-btn"
            onClick={() => typeof onEdit === 'function' && onEdit(expense)}
            disabled={typeof onEdit !== 'function'}
            title={typeof onEdit === 'function' ? 'Edit expense' : 'Edit not available'}
          >
            Edit
          </button>
          <button className="delete-btn" onClick={() => onDelete(expense._id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
