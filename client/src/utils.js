export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'React', 'Python', 'Java', 'C', 'C++', 'C#',
  'Go', 'Rust', 'PHP', 'HTML', 'CSS', 'SQL', 'Bash', 'JSON', 'Markdown',
  'YAML', 'XML', 'MongoDB'
];

export const LANGUAGE_EXTENSIONS = {
  'JavaScript': '.js', 'TypeScript': '.ts', 'React': '.jsx', 'Python': '.py',
  'Java': '.java', 'C': '.c', 'C++': '.cpp', 'C#': '.cs', 'Go': '.go',
  'Rust': '.rs', 'PHP': '.php', 'HTML': '.html', 'CSS': '.css', 'SQL': '.sql',
  'Bash': '.sh', 'JSON': '.json', 'Markdown': '.md', 'YAML': '.yml', 'XML': '.xml',
  'MongoDB': '.js'
};

export const ACCENT_COLORS = ['#9DFF3F', '#22C55E', '#15803D', '#86EFAC', '#166534', '#BBF7D0'];

export const LANGUAGE_COLORS = {
  'JavaScript': '#F7DF1E', 'TypeScript': '#3178C6', 'React': '#61DAFB',
  'Python': '#3776AB', 'Java': '#ED8B00', 'C': '#A8B9CC', 'C++': '#00599C',
  'C#': '#239120', 'Go': '#00ADD8', 'Rust': '#DEA584', 'PHP': '#777BB4',
  'HTML': '#E34F26', 'CSS': '#1572B6', 'SQL': '#CC2927', 'Bash': '#4EAA25',
  'JSON': '#CCCCCC', 'Markdown': '#083FA1', 'YAML': '#CB171E', 'XML': '#0060AC',
  'MongoDB': '#47A248'
};

export function timeAgo(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(snippet) {
  return `# ${snippet.title}\n\nLanguage: ${snippet.language}\n\nTags: ${snippet.tags?.map(t => t.name || t).join(', ') || 'none'}\n\n## Description\n\n${snippet.description || 'No description'}\n\n## Code\n\n\`\`\`${(snippet.language || '').toLowerCase()}\n${snippet.code}\n\`\`\`\n`;
}

export function exportAsJSON(snippets) {
  return JSON.stringify(snippets.map(s => ({
    title: s.title, language: s.language, tags: s.tags?.map(t => t.name || t) || [],
    description: s.description, code: s.code, source: s.source
  })), null, 2);
}
