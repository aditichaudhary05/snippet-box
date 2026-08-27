import { useNavigate } from 'react-router-dom';
import { Code2, Search, FolderOpen, Heart, Zap, Shield, ArrowRight } from 'lucide-react';
import useStore from '../store';
import DotGrid from '../components/DotGrid';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useStore();

  const features = [
    {
      icon: <Code2 size={22} />,
      title: 'Rich Code Editor',
      desc: 'Syntax-highlighted editor with support for 50+ languages. Write, format, and organize your snippets effortlessly.'
    },
    {
      icon: <Search size={22} />,
      title: 'Instant Search',
      desc: 'Find any snippet in milliseconds with fuzzy search, filters by language, tags, and collections.'
    },
    {
      icon: <FolderOpen size={22} />,
      title: 'Collections',
      desc: 'Group related snippets into collections. Organize by project, topic, or workflow.'
    },
    {
      icon: <Heart size={22} />,
      title: 'Favorites',
      desc: 'Star your most-used snippets for quick access. Your personal go-to library.'
    },
    {
      icon: <Zap size={22} />,
      title: 'Lightning Fast',
      desc: 'Built for speed. Keyboard shortcuts, command palette, and instant clipboard copy.'
    },
    {
      icon: <Shield size={22} />,
      title: 'Private & Secure',
      desc: 'Your snippets stay yours. End-to-end privacy with secure authentication.'
    }
  ];

  return (
    <div className="landing">
      <div className="landing-dotgrid-bg">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#2a3035"
          activeColor="#9DFF3F"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <img src="/logo.png" alt="SnippetBox" style={{ height: 42 }} />
            <span>SnippetBox</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {isAuthenticated ? (
              <button className="btn btn-primary" onClick={() => navigate('/app')}>Dashboard</button>
            ) : (
              <>
                <button className="landing-pill-btn" onClick={() => openAuthModal('login')}>Login</button>
                <button className="landing-pill-btn landing-pill-btn-primary" onClick={() => openAuthModal('signup')}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-badge">Your Code, Organized</div>
        <h1>
          Save, search & reuse<br />
          <span style={{ color: 'var(--accent)' }}>code snippets</span> instantly
        </h1>
        <p>
          A minimal, blazing-fast snippet manager for developers. Stop wasting time
          re-writing the same code. Store everything in one place and find it when you need it.
        </p>
        <div className="landing-hero-actions">
          <button className="btn btn-primary" onClick={() => isAuthenticated ? navigate('/app') : openAuthModal('signup')}>
            Start Saving Snippets <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-section-header">
          <h2>Everything you need</h2>
          <p>All the tools to keep your code snippets organized and accessible.</p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card">
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Ready to organize your code?</h2>
        <p>Join developers who save hours every week with SnippetBox.</p>
        <button className="btn btn-primary" onClick={() => isAuthenticated ? navigate('/app') : openAuthModal('signup')}>
          Get Started Free <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
