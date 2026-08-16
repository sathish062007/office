import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, ShieldCheck, Mail, Smartphone } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!contact) {
      toast.error("Please enter Email or Mobile Number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        if (data.mockOtp) {
          toast.info(`[Test Mode] Your OTP is: ${data.mockOtp}`, { autoClose: false });
        }
        setStep(2);
        setResendTimer(60); // 60 seconds wait for resend
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, otp })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        localStorage.setItem('codenexa_token', data.token);
        navigate('/requirement');
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Welcome to Codenexa
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in to submit your project requirements
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label className="input-label">Email or Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="name@company.com or +91..."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Sending OTP...' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="animate-fade-in">
            <div className="input-group">
              <label className="input-label">Enter 6-digit OTP</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.2em' }}
                />
                <ShieldCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Verifying...' : 'Login securely'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={() => handleSendOtp(null)} 
                disabled={resendTimer > 0 || loading}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: resendTimer > 0 ? 'var(--text-secondary)' : 'var(--accent-primary)',
                  cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
