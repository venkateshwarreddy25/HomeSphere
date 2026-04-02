import React, { useState } from 'react';
import { Calculator, X, TrendingDown } from 'lucide-react';

const EMICalculator = ({ propertyPrice, type }) => {
  const [open, setOpen] = useState(false);
  const [principal, setPrincipal] = useState(propertyPrice || 5000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  if (type === 'rental') return null;

  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  const emi = months > 0 && rate > 0
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;

  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;

  const fmt = (n) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
  };

  const principalPct = Math.round((principal / totalAmount) * 100);
  const interestPct = 100 - principalPct;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff', border: 'none', borderRadius: '12px',
          padding: '0.85rem 1.5rem', fontWeight: 700, cursor: 'pointer',
          fontSize: '0.9rem', boxShadow: '0 6px 16px rgba(16,185,129,0.3)',
          transition: 'transform 0.2s', width: '100%', justifyContent: 'center'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Calculator size={18} /> Calculate EMI
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '560px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ color: '#fff', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>EMI Calculator</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Estimate your monthly home loan payment</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '2rem' }}>
              {/* Sliders */}
              {[
                { label: 'Loan Amount', value: principal, min: 500000, max: 100000000, step: 100000, display: fmt(principal), onChange: setPrincipal },
                { label: 'Interest Rate (%)', value: rate, min: 5, max: 20, step: 0.1, display: `${rate}%`, onChange: setRate },
                { label: 'Tenure (Years)', value: tenure, min: 1, max: 30, step: 1, display: `${tenure} Yrs`, onChange: setTenure }
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{s.label}</label>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{s.display}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                    onChange={e => s.onChange(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    <span>{i === 0 ? fmt(s.min) : i === 2 ? `${s.min} Yr` : `${s.min}%`}</span>
                    <span>{i === 0 ? fmt(s.max) : i === 2 ? `${s.max} Yrs` : `${s.max}%`}</span>
                  </div>
                </div>
              ))}

              {/* Results */}
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '16px', padding: '1.5rem', marginTop: '0.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Monthly EMI</p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#15803d', fontFamily: 'Outfit' }}>{fmt(emi)}</div>
                </div>

                {/* Pie-like bar */}
                <div style={{ height: 12, borderRadius: '99px', background: '#bbf7d0', overflow: 'hidden', marginBottom: '0.75rem', display: 'flex' }}>
                  <div style={{ width: `${principalPct}%`, background: '#10b981', transition: 'width 0.4s' }} />
                  <div style={{ width: `${interestPct}%`, background: '#f59e0b', transition: 'width 0.4s' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                  {[
                    { label: 'Principal', value: fmt(principal), color: '#10b981' },
                    { label: 'Total Interest', value: fmt(totalInterest), color: '#f59e0b' },
                    { label: 'Total Amount', value: fmt(totalAmount), color: '#674df0' }
                  ].map((item, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: '10px', padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: item.color, marginBottom: '0.2rem' }}>{item.value}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EMICalculator;
