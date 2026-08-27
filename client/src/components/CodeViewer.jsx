import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { LANGUAGE_COLORS } from '../utils';
import toast from 'react-hot-toast';
import useStore from '../store';

const customTheme = {
  ...atomOneDark,
  'hljs': {
    ...atomOneDark['hljs'],
    background: '#101315',
    color: '#E9ECEB',
  },
};

export default function CodeViewer({ code, language, snippetId }) {
  const [copied, setCopied] = useState(false);
  const { incrementCopyCount } = useStore();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    if (snippetId) incrementCopyCount(snippetId);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-lang">
          <span className="lang-dot" style={{ background: LANGUAGE_COLORS[language] || '#888', width: 8, height: 8, borderRadius: '50%' }} />
          <span>{language || 'Plain Text'}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        language={language?.toLowerCase() || 'text'}
        style={customTheme}
        showLineNumbers
        lineNumberStyle={{ color: '#626A6D', fontSize: 12, minWidth: '3em', paddingRight: 16 }}
        wrapLongLines
        customStyle={{ margin: 0, padding: 16, background: '#101315', fontSize: 13, lineHeight: 1.7 }}
      >
        {code || '// No code'}
      </SyntaxHighlighter>
    </div>
  );
}
