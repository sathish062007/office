import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Send, LogOut } from 'lucide-react';

const RequirementForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    companyName: '',
    requirementType: 'New Website',
    projectTitle: '',
    details: '',
    referenceUrl: '',
    budget: '',
    deadline: '',
    preferredContact: 'Email'
  });

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem('codenexa_token');
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('codenexa_token');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

      // Use localStorage as a mock DB for testing
      const existingReqs = JSON.parse(localStorage.getItem('codenexa_requirements') || '[]');
      existingReqs.push({ ...formData, id: Date.now(), status: 'Pending', date: new Date().toISOString() });
      localStorage.setItem('codenexa_requirements', JSON.stringify(existingReqs));

      try {
        const token = localStorage.getItem('codenexa_token');
        const response = await fetch('http://localhost:5000/api/submit-requirement', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (response.ok || data.success) {
          navigate('/success');
        } else {
          toast.warn('Backend failed, but saved to Local Storage DB!');
          navigate('/success');
        }
      } catch (error) {
        toast.warn('Network error, but saved to Local Storage DB!');
        navigate('/success');
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Codenexa <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>/ Tell Us What You Need</span></h2>
        <button className="btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            
            <div className="input-group">
              <label className="input-label">Full Name *</label>
              <input type="text" name="fullName" className="input-field" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address *</label>
              <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label className="input-label">Contact Number *</label>
              <input type="text" name="contactNumber" className="input-field" value={formData.contactNumber} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label className="input-label">Company Name</label>
              <input type="text" name="companyName" className="input-field" value={formData.companyName} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label className="input-label">Requirement Type *</label>
              <select name="requirementType" className="input-field" value={formData.requirementType} onChange={handleChange} required style={{ appearance: 'none', backgroundColor: 'var(--bg-secondary)' }}>
                <option value="New Website">New Website</option>
                <option value="Existing Website Upgrade">Existing Website Upgrade</option>
                <option value="Mobile App">Mobile App</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Canva Design">Canva Design</option>
                <option value="AI Generated Video">AI Generated Video</option>
                <option value="AI Application">AI Application</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Project Title</label>
              <input type="text" name="projectTitle" className="input-field" value={formData.projectTitle} onChange={handleChange} />
            </div>
            
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Detailed Requirements *</label>
              <textarea name="details" className="input-field" value={formData.details} onChange={handleChange} required rows={5} placeholder="Describe your vision..."></textarea>
            </div>

            <div className="input-group">
              <label className="input-label">Reference URL</label>
              <input type="url" name="referenceUrl" className="input-field" value={formData.referenceUrl} onChange={handleChange} placeholder="https://" />
            </div>

            <div className="input-group">
              <label className="input-label">Estimated Budget</label>
              <input type="text" name="budget" className="input-field" value={formData.budget} onChange={handleChange} placeholder="e.g. $5k - $10k" />
            </div>

            <div className="input-group">
              <label className="input-label">Expected Deadline</label>
              <input type="text" name="deadline" className="input-field" value={formData.deadline} onChange={handleChange} placeholder="e.g. 1 Month" />
            </div>

            <div className="input-group">
              <label className="input-label">Preferred Contact Method *</label>
              <select name="preferredContact" className="input-field" value={formData.preferredContact} onChange={handleChange} required style={{ appearance: 'none', backgroundColor: 'var(--bg-secondary)' }}>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone Call">Phone Call</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '1rem 3rem' }}>
              {loading ? 'Submitting...' : 'Submit Requirement'}
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequirementForm;
