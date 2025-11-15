import React from 'react';
import './SettlementCard.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const SettlementCard = ({ settlement, onSettle }) => {
  return (
    <div className="settlement-card">
      <div className="settlement-info">
        <div className="settlement-people">
          <span className="person from">{settlement.from?.name}</span>
          <span className="arrow">→ owes →</span>
          <span className="person to">{settlement.to?.name}</span>
        </div>
        <div className="settlement-amount">{formatCurrency(settlement.amount)}</div>
      </div>
      <button className="settle-btn" onClick={() => onSettle(settlement._id)}>
        Mark as Settled
      </button>
    </div>
  );
};

export default SettlementCard;
