import React from 'react';

/**
 * Catches render-time errors in a route subtree.
 *
 * Without this, an exception anywhere in a lazy-loaded page unmounts the entire
 * React tree and the user sees a blank white page with no explanation — the exact
 * symptom this guards against. The boundary is re-keyed on navigation (see App.jsx)
 * so moving to another page clears the error instead of stranding the user.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[FarmDirect] Module crashed:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="card card-body" style={{ maxWidth: '620px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
          <h2>{this.props.label || 'This page'} failed to load</h2>
          <p className="text-secondary" style={{ marginTop: '8px' }}>
            Something went wrong while rendering this module. The rest of the app is unaffected —
            use the navigation above to continue, or reload to try again.
          </p>

          <pre
            style={{
              marginTop: '16px',
              padding: '12px',
              textAlign: 'left',
              background: 'var(--bg-input, #f1f5f9)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {error.message || String(error)}
          </pre>

          <button
            className="btn btn-primary btn-sm"
            style={{ marginTop: '16px' }}
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}