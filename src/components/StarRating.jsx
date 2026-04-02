import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate, readOnly = false, size = 20 }) => {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onRate && onRate(star)}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'transform 0.15s ease',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={e => { if (!readOnly) e.currentTarget.style.transform = 'scale(1.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <Star
            size={size}
            fill={star <= rating ? '#f5a623' : 'none'}
            color={star <= rating ? '#f5a623' : '#cbd5e1'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
