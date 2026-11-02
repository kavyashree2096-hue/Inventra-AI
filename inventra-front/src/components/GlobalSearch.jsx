import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Loader2, Package, Tag, ShoppingCart, Truck,
  DollarSign, ShieldAlert, FileSpreadsheet, ArrowRight, Filter
} from 'lucide-react';
import { searchService } from '../services/searchService';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchService.search(query.trim(), typeFilter);
        setResults(data.results || {});
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, typeFilter]);

  const handleSelectResult = (route) => {
    setIsOpen(false);
    setQuery('');
    navigate(route);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const totalResultsCount = results
    ? Object.values(results).reduce((acc, list) => acc + (list ? list.length : 0), 0)
    : 0;

  const typeConfig = {
    all: 'All Records',
    products: 'Products',
    categories: 'Categories',
    procurement: 'Procurement',
    sales: 'Revenue & Sales',
    audit: 'Audit Logs',
    reports: 'Reports'
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-lg mx-2 sm:mx-4">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search products, categories, inventory..."
          className="w-full pl-9 pr-16 sm:pr-24 py-1.5 sm:py-2 text-xs rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-800 placeholder-slate-400 transition-all outline-hidden shadow-2xs"
        />

        {/* Clear & Loading Indicator */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {loading && <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />}
          {query && !loading && (
            <button
              onClick={() => {
                setQuery('');
                setResults(null);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Quick Filter Capsule Button */}
          <button
            type="button"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-sky-700 bg-white border border-slate-200 shadow-2xs"
            title="Filter search scope"
          >
            <Filter className="w-2.5 h-2.5" />
            <span>{typeFilter === 'all' ? 'All' : typeConfig[typeFilter]}</span>
          </button>
        </div>
      </div>

      {/* Filter Menu Dropdown */}
      {filterMenuOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Scope Filter
          </div>
          {Object.entries(typeConfig).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTypeFilter(key);
                setFilterMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                typeFilter === key
                  ? 'bg-sky-50 text-sky-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{label}</span>
              {typeFilter === key && <span className="text-sky-600 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Results & Suggestions Dropdown Drawer */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200/80 max-h-[75vh] overflow-y-auto z-50 p-3 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">
              {loading ? 'Searching catalog...' : `${totalResultsCount} results for "${query}"`}
            </span>
            <span className="text-[10px] text-slate-400">Esc to close</span>
          </div>

          {/* Quick Suggestions Chips */}
          {suggestions.length > 0 && (
            <div className="px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Suggestions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(sug)}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 text-[11px] font-medium text-slate-700 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && totalResultsCount === 0 && (
            <div className="py-8 text-center text-slate-500">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-xs">No matching records found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try searching by SKU, category name, invoice number, or report topic.
              </p>
            </div>
          )}

          {/* Group 1: Products */}
          {results?.products && results.products.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">
                <Package className="w-3.5 h-3.5" />
                <span>Products ({results.products.length})</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectResult(p.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-sky-50/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      {p.image ? (
                        <img src={p.image} alt={p.title} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
                          P
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-sky-700 line-clamp-1">{p.title}</p>
                        <p className="text-[10px] text-slate-500">{p.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {p.badge}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 2: Categories */}
          {results?.categories && results.categories.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Product Departments</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.categories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectResult(c.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-teal-50/60 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-teal-700">{c.title}</p>
                      <p className="text-[10px] text-slate-500">{c.subtitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 3: Procurement & POs */}
          {results?.procurement && results.procurement.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Procurement Orders</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.procurement.map((po) => (
                  <div
                    key={po.id}
                    onClick={() => handleSelectResult(po.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-indigo-50/60 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-indigo-700">{po.title}</p>
                      <p className="text-[10px] text-slate-500">{po.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {po.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 4: Suppliers */}
          {results?.suppliers && results.suppliers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" />
                <span>Suppliers Matrix</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.suppliers.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectResult(s.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-amber-700">{s.title}</p>
                      <p className="text-[10px] text-slate-500">{s.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {s.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 5: Sales & Revenue Invoices */}
          {results?.sales && results.sales.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Sales Invoices</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.sales.map((sl) => (
                  <div
                    key={sl.id}
                    onClick={() => handleSelectResult(sl.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-emerald-700">{sl.title}</p>
                      <p className="text-[10px] text-slate-500">{sl.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {sl.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 6: Authorized Audit Records */}
          {results?.audit && results.audit.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Audit Operations (Authorized)</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.audit.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleSelectResult(a.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/60 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-rose-700">{a.title}</p>
                      <p className="text-[10px] text-slate-500">{a.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {a.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group 7: Reports */}
          {results?.reports && results.reports.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Executive Reports</span>
              </div>
              <div className="space-y-1 mt-1">
                {results.reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelectResult(r.route)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/60 cursor-pointer transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-purple-700">{r.title}</p>
                      <p className="text-[10px] text-slate-500">{r.subtitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
