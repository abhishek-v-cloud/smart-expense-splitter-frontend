import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GroupCard.css';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/group/${group._id}`);
  };

  const memberCount = group.members?.length || 0;

  return (
    <div className="group-card" onClick={handleClick}>
      <div className="group-card-header">
        <h3>{group.name}</h3>
        <span className={`group-category ${group.category}`}>{group.category}</span>
      </div>
      <p className="group-description">{group.description || 'No description'}</p>
      <div className="group-footer">
        <span className="member-count">👥 {memberCount} members</span>
        <span className="created-date">
          Created {new Date(group.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default GroupCard;
