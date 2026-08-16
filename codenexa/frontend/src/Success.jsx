import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
        <CheckCircle size={64} style={{ color: 'var(--success-color)', margin: '0 auto 1.5rem auto' }} />
        
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
          Requirement Received!
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          Thank you for choosing Codenexa. Our team has received your project details and will get back to you shortly via your preferred contact method.
        </p>

        <button 
          className="btn-primary" 
          onClick={() => {
            localStorage.removeItem('codenexa_token');
            navigate('/login');
          }}
          style={{ width: 'auto', margin: '0 auto', padding: '0.875rem 2rem' }}
        >
          <Home size={18} /> Return to Home
        </button>
      </div>
    </div>
  );
};

export default Success;
