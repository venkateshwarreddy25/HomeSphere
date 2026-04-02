import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const SearchFilter = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState({
    city: '', type: 'all', minPrice: '', maxPrice: ''
  });

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const reset = { city: '', type: 'all', minPrice: '', maxPrice: '' };
    setFilters(reset);
    onSearch(reset);
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <SlidersHorizontal size={18} color="#f5a623" />
        <h3 style={{ fontWeight: 700, color: '#1a2e4a', fontSize: '1rem' }}>Filter Properties</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* City */}
          <div>
            <label className="form-label">City</label>
            <input
              name="city"
              value={filters.city}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. Mumbai"
            />
          </div>

          {/* Type */}
          <div>
            <label className="form-label">Property Type</label>
            <select name="type" value={filters.type} onChange={handleChange} className="form-control">
              <option value="all">All Types</option>
              <option value="rental">For Rent</option>
              <option value="sell">For Sale</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="form-label">Min Price (₹)</label>
            <input
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. 5000"
              type="number"
              min="0"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="form-label">Max Price (₹)</label>
            <input
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. 50000"
              type="number"
              min="0"
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Search size={15} />
              {loading ? 'Searching…' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline btn-sm"
              title="Reset filters"
              style={{ padding: '0.6rem 0.8rem' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;
