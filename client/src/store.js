import { create } from 'zustand';
import api from './api';

const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  snippets: [],
  currentSnippet: null,
  totalSnippets: 0,
  currentPage: 1,

  tags: [],
  collections: [],
  languages: [],
  languageColorMap: {},

  searchQuery: '',
  activeLanguage: 'All',
  activeTag: null,
  sortBy: 'created_at_desc',
  selectedSnippets: new Set(),
  showCommandPalette: false,
  sidebarOpen: true,
  detailPanelOpen: false,
  createModalOpen: false,
  authModalOpen: false,
  authModalType: 'login',
  toggleCreateModal: () => set(s => ({ createModalOpen: !s.createModalOpen })),
  openAuthModal: (type) => set({ authModalOpen: true, authModalType: type }),
  closeAuthModal: () => set({ authModalOpen: false }),

  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    set({ token: res.data.token, isAuthenticated: true, user: res.data.user });
    return res.data;
  },

  signup: async (name, email, password) => {
    const res = await api.post('/api/auth/signup', { name, email, password });
    localStorage.setItem('token', res.data.token);
    set({ token: res.data.token, isAuthenticated: true, user: res.data.user });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false, user: null, snippets: [], tags: [], collections: [] });
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/api/auth/me');
      set({ user: res.data, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, isAuthenticated: false, user: null });
    }
  },

  fetchSnippets: async (params = {}) => {
    try {
      const state = get();
      const query = {
        search: state.searchQuery || undefined,
        language: state.activeLanguage !== 'All' ? state.activeLanguage : undefined,
        tag: state.activeTag || undefined,
        sort: state.sortBy,
        page: state.currentPage,
        limit: 12,
        ...params
      };
      Object.keys(query).forEach(k => query[k] === undefined && delete query[k]);
      const res = await api.get('/api/snippets', { params: query });
      set({ snippets: res.data.snippets, totalSnippets: res.data.pagination?.total || 0 });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch snippets:', err);
    }
  },

  fetchSnippet: async (id) => {
    const res = await api.get(`/api/snippets/${id}`);
    set({ currentSnippet: res.data, detailPanelOpen: true });
    return res.data;
  },

  fetchLanguages: async () => {
    try {
      const res = await api.get('/api/snippets/languages');
      set({ languages: res.data });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    }
  },

  createSnippet: async (data) => {
    const res = await api.post('/api/snippets', data);
    get().fetchLanguages();
    return res.data;
  },

  updateSnippet: async (id, data) => {
    const res = await api.put(`/api/snippets/${id}`, data);
    get().fetchLanguages();
    return res.data;
  },

  deleteSnippet: async (id) => {
    await api.delete(`/api/snippets/${id}`);
    set(s => ({ snippets: s.snippets.filter(sn => sn.id !== id), currentSnippet: s.currentSnippet?.id === id ? null : s.currentSnippet, detailPanelOpen: s.currentSnippet?.id === id ? false : s.detailPanelOpen }));
    get().fetchLanguages();
  },

  toggleFavorite: async (id) => {
    const res = await api.post(`/api/snippets/${id}/favorite`);
    set(s => ({
      snippets: s.snippets.map(sn => sn.id === id ? { ...sn, isFavorite: !sn.isFavorite } : sn),
      currentSnippet: s.currentSnippet?.id === id ? { ...s.currentSnippet, isFavorite: !s.currentSnippet.isFavorite } : s.currentSnippet
    }));
    return res.data;
  },

  duplicateSnippet: async (id) => {
    const res = await api.post(`/api/snippets/${id}/duplicate`);
    return res.data;
  },

  incrementCopyCount: async (id) => {
    await api.post(`/api/snippets/${id}/copy`);
  },

  fetchTags: async () => {
    const res = await api.get('/api/tags');
    set({ tags: res.data });
    return res.data;
  },

  createTag: async (name) => {
    const res = await api.post('/api/tags', { name });
    return res.data;
  },

  deleteTag: async (id) => {
    await api.delete(`/api/tags/${id}`);
    set(s => ({ tags: s.tags.filter(t => t.id !== id) }));
  },

  fetchCollections: async () => {
    const res = await api.get('/api/collections');
    set({ collections: res.data });
    return res.data;
  },

  fetchStats: async () => {
    const res = await api.get('/api/stats');
    const { ACCENT_COLORS } = await import('./utils');
    const map = {};
    (res.data.languages || []).forEach((l, i) => {
      map[l.name] = ACCENT_COLORS[i % ACCENT_COLORS.length];
    });
    set({ languageColorMap: map });
    return res.data;
  },

  globalSearch: async (q) => {
    if (!q) return { snippets: [] };
    const res = await api.get('/api/search', { params: { q } });
    return res.data;
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveLanguage: (l) => set({ activeLanguage: l, currentPage: 1 }),
  setActiveTag: (t) => set({ activeTag: t, currentPage: 1 }),
  setSortBy: (s) => set({ sortBy: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  toggleCommandPalette: () => set(s => ({ showCommandPalette: !s.showCommandPalette })),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setDetailPanelOpen: (open) => set({ detailPanelOpen: open, currentSnippet: open ? get().currentSnippet : null }),
  setSelectedSnippets: (sel) => set({ selectedSnippets: sel }),
}));

export default useStore;
