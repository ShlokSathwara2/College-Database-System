import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ columns, data, pagination, onPageChange, onSearch, actions, searchPlaceholder = 'Search...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {onSearch && (
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                {actions && (
                  <th className="text-right px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/30">
              {data && data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-dark-700/20 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm text-dark-200">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-dark-500">
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700/50">
            <p className="text-sm text-dark-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed text-dark-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === page
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-400 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed text-dark-400 hover:text-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
