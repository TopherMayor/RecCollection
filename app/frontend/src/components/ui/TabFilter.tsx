import React from 'react';

export interface TabOption {
  id: string;
  label: React.ReactNode;
  count?: number;
}

interface TabFilterProps {
  options: TabOption[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const TabFilter: React.FC<TabFilterProps> = ({
  options,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm bg-gray-50 p-1 w-full overflow-x-auto ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`flex-1 py-2 px-4 text-sm font-medium min-w-[100px] transition-colors border-b-2 ${
            activeTab === option.id
              ? 'text-blue-600 border-blue-600 bg-white'
              : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-selected={activeTab === option.id}
          role="tab"
        >
          {option.label}
          {option.count !== undefined ? ` (${option.count})` : ''}
        </button>
      ))}
    </div>
  );
};

export default TabFilter;
