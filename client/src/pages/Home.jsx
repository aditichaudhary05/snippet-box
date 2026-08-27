import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Heart, Code, TrendingUp } from 'lucide-react';
import { ACCENT_COLORS } from '../utils';
import useStore from '../store';
import SnippetGrid from '../components/SnippetGrid';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const { user, snippets, fetchSnippets, setActiveLanguage, totalSnippets, tags, toggleCommandPalette, toggleCreateModal } = useStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      await fetchSnippets({ limit: 6 });
      try {
        const res = await useStore.getState().fetchStats();
        setStats(res);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const recentSnippets = snippets.slice(0, 6);
  const favSnippets = snippets.filter(s => s.is_favorite).slice(0, 3);

  return (
    <div>
      <div className="home-header">
        <div>
          <h1 className="page-title" style={{ fontSize: 28 }}>Your code. Organized.</h1>
          <p className="page-subtitle" style={{ fontSize: 14, marginTop: 6 }}>
            Welcome back, {user?.name || 'there'}. Manage and discover your code snippets.
          </p>
        </div>
        <button className="btn-add-snippet" onClick={toggleCreateModal}>
          <Plus size={16} />
          <span>New Snippet</span>
        </button>
      </div>

      {stats && (
        <div className="home-stats-grid">
          {[
            { label: 'Total Snippets', value: stats.snippetCount || 0, icon: Code },
            { label: 'Favorites', value: stats.favoritesCount || 0, icon: Heart },
            { label: 'Languages', value: stats.languages?.length || 0, icon: Code },
            { label: 'Tags', value: stats.tagCount || 0, icon: Code },
          ].map(s => (
            <div key={s.label} className="neumorphic-raised" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Quick Filters</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {['All', ...(stats?.languages?.map(l => l.name) || [])].map(lang => (
          <button
            key={lang}
            className="filter-pill"
            onClick={() => { setActiveLanguage(lang); navigate('/app/snippets'); }}
          >
            {lang}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recently Added</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/snippets')}>
          View All <ArrowRight size={14} />
        </button>
      </div>
      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : recentSnippets.length > 0 ? (
        <SnippetGrid snippets={recentSnippets} />
      ) : (
        <EmptyState
          title="No snippets yet"
          description="Create your first snippet to get started."
          actionLabel="Create Snippet"
          actionTo="/app/snippets/new"
        />
      )}

      {favSnippets.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>
              <Heart size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
              Favorites
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/favorites')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <SnippetGrid snippets={favSnippets} />
        </div>
      )}

      {stats && stats.languages?.length > 0 && (() => {
        const colors = ACCENT_COLORS;
        const favRate = stats.snippetCount > 0 ? Math.round((stats.favoritesCount / stats.snippetCount) * 100) : 0;
        const avgCopies = stats.snippetCount > 0 ? (stats.totalCopies / stats.snippetCount).toFixed(1) : 0;
        return (
        <div className="home-insights-grid">
          <div className="neumorphic-raised" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <TrendingUp size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
              Language Distribution
            </h2>
            {(() => {
              const total = stats.languages.reduce((sum, l) => sum + l.count, 0);
              let acc = 0;
              const segments = stats.languages.map((l, i) => {
                const start = acc;
                const pct = (l.count / total) * 100;
                acc += pct;
                return `${colors[i % colors.length]} ${start}% ${acc}%`;
              });
              const gradient = `conic-gradient(${segments.join(', ')})`;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: gradient,
                    position: 'relative', flexShrink: 0
                  }}>
                    <div style={{
                      position: 'absolute', inset: 10, borderRadius: '50%',
                      background: '#141819', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column'
                    }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{total}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>total</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    {stats.languages.slice(0, 6).map((l, i) => (
                      <div key={l.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 12 }}>{l.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{Math.round((l.count / total) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="neumorphic-raised" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <TrendingUp size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
              Top Languages
            </h2>
            {stats.languages.slice(0, 5).map((lang, i) => {
              const maxCount = stats.languages[0].count;
              const pct = maxCount > 0 ? (lang.count / maxCount) * 100 : 0;
              return (
                <div key={lang.name} style={{ marginBottom: i < Math.min(stats.languages.length, 5) - 1 ? 12 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{lang.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lang.count}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-deep)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: colors[i % colors.length], transition: 'width 300ms ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="neumorphic-raised" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <Heart size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
              Snippet Health
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Favorite Rate</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{favRate}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-deep)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${favRate}%`, borderRadius: 3, background: 'var(--accent)', transition: 'width 300ms ease' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{avgCopies}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Avg Copies</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{stats.languages?.length || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Languages</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{stats.collectionsCount || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Collections</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{stats.tagCount || 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Tags</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}
