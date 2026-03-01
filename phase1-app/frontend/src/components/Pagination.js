import React from 'react';

export default function Pagination({ pagination, onPageChange }) {
  console.log('Pagination component received:', pagination);
  if (!pagination || pagination.totalPages <= 1) {
    console.log('Pagination not shown: totalPages =', pagination?.totalPages);
    return null;
  }

  const { page, totalPages, total, limit, hasNext, hasPrev } = pagination;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 0',
      borderTop: '1px solid #e2e8f0',
      marginTop: '1rem'
    }}>
      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
        Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} items
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {/* First */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            background: page === 1 ? '#f1f5f9' : 'white',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
            color: page === 1 ? '#94a3b8' : '#334155',
            fontSize: '0.875rem'
          }}
        >
          ««
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            background: !hasPrev ? '#f1f5f9' : 'white',
            cursor: !hasPrev ? 'not-allowed' : 'pointer',
            color: !hasPrev ? '#94a3b8' : '#334155',
            fontSize: '0.875rem'
          }}
        >
          «
        </button>

        {/* Page Numbers */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                background: 'white',
                cursor: 'pointer',
                color: '#334155',
                fontSize: '0.875rem'
              }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ padding: '0 0.5rem', color: '#94a3b8' }}>...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid ' + (p === page ? '#3b82f6' : '#e2e8f0'),
              borderRadius: '0.375rem',
              background: p === page ? '#3b82f6' : 'white',
              cursor: p === page ? 'default' : 'pointer',
              color: p === page ? 'white' : '#334155',
              fontSize: '0.875rem',
              fontWeight: p === page ? '600' : '400'
            }}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0 0.5rem', color: '#94a3b8' }}>...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                background: 'white',
                cursor: 'pointer',
                color: '#334155',
                fontSize: '0.875rem'
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            background: !hasNext ? '#f1f5f9' : 'white',
            cursor: !hasNext ? 'not-allowed' : 'pointer',
            color: !hasNext ? '#94a3b8' : '#334155',
            fontSize: '0.875rem'
          }}
        >
          »
        </button>

        {/* Last */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            background: page === totalPages ? '#f1f5f9' : 'white',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
            color: page === totalPages ? '#94a3b8' : '#334155',
            fontSize: '0.875rem'
          }}
        >
          »»
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Go to:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          defaultValue={page}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = parseInt(e.target.value, 10);
              if (val >= 1 && val <= totalPages) {
                onPageChange(val);
              }
            }
          }}
          style={{
            width: '4rem',
            padding: '0.5rem',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}
        />
      </div>
    </div>
  );
}
