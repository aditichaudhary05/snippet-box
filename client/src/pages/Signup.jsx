import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, Eye, EyeOff, X } from 'lucide-react';
import useStore from '../store';
import toast from 'react-hot-toast';

export default function Signup({ onClose, onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created!');
      if (onClose) onClose();
      else navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      <div className="auth-logo">
        <div className="logo-icon"><Code size={27} /></div>
        <span className="logo-name">SnippetBox</span>
      </div>
      <h2>Create account</h2>
      <p className="auth-subtitle">Start organizing your code snippets</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-wrapper">
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <div className="auth-footer">
        {onSwitch ? (
          <>Already have an account? <button className="auth-link-btn" onClick={onSwitch}>Login</button></>
        ) : (
          <>Already have an account? <Link to="/login">Login</Link></>
        )}
      </div>
    </>
  );

  if (onClose) {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal" onClick={e => e.stopPropagation()}>
          <button className="auth-modal-close" onClick={onClose}><X size={18} /></button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">{content}</div>
    </div>
  );
}
