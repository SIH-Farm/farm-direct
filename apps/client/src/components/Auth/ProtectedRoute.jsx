import React from 'react';
import { useApp } from '../../context/AppContext';

// Role permissions mapping
const ROLE_PERMISSIONS = {
  consumer: ['/', '/marketplace'],
  farmer: ['/', '/farmer'],
  bulk_buyer: ['/', '/marketplace', '/bulk-buyer'],
  admin: ['/', '/farmer', '/marketplace', '/bulk-buyer', '/analytics', '/logistics'],
};

export default function ProtectedRoute({ children, allowedRoles, pathName }) {
  const { currentRole, setCurrentRole } = useApp();

  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="card card-body" style={{ maxWidth: '550px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
          <h2>Access Restricted ({pathName})</h2>
          <p className="text-secondary" style={{ marginTop: '8px', marginBottom: '20px' }}>
            Your current active role is <strong className="badge badge-amber">{currentRole.toUpperCase()}</strong>.
            This module requires <strong className="badge badge-green">{allowedRoles.join(' or ').toUpperCase()}</strong> access.
          </p>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <p className="text-sm font-medium" style={{ marginBottom: '12px' }}>💡 Switch role for hackathon evaluation:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {allowedRoles.map(role => (
                <button
                  key={role}
                  className="btn btn-primary btn-sm"
                  onClick={() => setCurrentRole(role)}
                >
                  Switch to {role.toUpperCase()} Role
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
