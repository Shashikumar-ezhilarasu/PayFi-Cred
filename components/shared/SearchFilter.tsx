import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: Array<{ value: string; label: string }>;
  searchPlaceholder?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  searchPlaceholder = 'Search...',
}: SearchFilterProps) {
  return (
    <div className="card p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--elev)] border border-[var(--color-divider)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {filterOptions && onFilterChange && (
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[var(--color-muted)]" />
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-4 py-2 bg-[var(--elev)] border border-[var(--color-divider)] rounded-lg text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
