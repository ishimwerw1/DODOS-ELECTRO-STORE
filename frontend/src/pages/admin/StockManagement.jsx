import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  FaBox, FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaSearch, FaEdit, FaSave, FaTimes, FaChartBar, FaPrint,
  FaSync, FaFilter, FaWarehouse, FaShoppingBag,
} from 'react-icons/fa';
import { useLocale } from '../../context/LocaleContext';

const StatusBadge = ({ status }) => {
  const map = {
    out_of_stock: { label: 'Out of Stock', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    critical:     { label: 'Critical',     cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    low:          { label: 'Low Stock',    cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    ok:           { label: 'In Stock',     cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
  };
  const s = map[status] || map.ok;
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.cls}`}>
      {s.label}
    </span>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white mt-0.5">{value}</p>
    </div>
  </div>
);

/* ── Sales reports data helpers ── */
const SalesReportsArea = ({ salesData, formatPrice, groupBy, t }) => (
  <div className="space-y-6">
    {/* Totals */}
    <div className="grid grid-cols-2 gap-4">
      <div className="glass rounded-2xl border border-white/5 p-6 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Total Revenue</p>
        <p className="text-3xl font-black text-green-400">{formatPrice(salesData.totals?.revenue)}</p>
      </div>
      <div className="glass rounded-2xl border border-white/5 p-6 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Total Orders</p>
        <p className="text-3xl font-black text-blue-400">{salesData.totals?.orders ?? 0}</p>
      </div>
    </div>

    {/* Sales by date */}
    {salesData.salesByDate?.length > 0 && (
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-bold text-white text-sm">Sales by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Period</th>
                <th className="px-5 py-3 text-right">Orders</th>
                <th className="px-5 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {salesData.salesByDate.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-slate-300 font-mono">{row._id}</td>
                  <td className="px-5 py-3 text-right text-slate-300">{row.orders}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-semibold">{formatPrice(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Top products */}
    {salesData.topProducts?.length > 0 && (
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-bold text-white text-sm">Top 10 Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-right">Qty Sold</th>
                <th className="px-5 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {salesData.topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-slate-500 font-bold">{i + 1}</td>
                  <td className="px-5 py-3 text-slate-200 font-semibold">{p.name}</td>
                  <td className="px-5 py-3 text-right text-blue-400 font-bold">{p.soldQty}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-semibold">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Category breakdown */}
    {salesData.categoryBreakdown?.length > 0 && (
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-bold text-white text-sm">Revenue by Category</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">Qty Sold</th>
                <th className="px-5 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {salesData.categoryBreakdown.map((c, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-slate-200 font-semibold">{c._id || 'Unknown'}</td>
                  <td className="px-5 py-3 text-right text-blue-400 font-bold">{c.soldQty}</td>
                  <td className="px-5 py-3 text-right text-green-400 font-semibold">{formatPrice(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const StockManagement = () => {
  const { formatPrice } = useLocale();
  const [activeTab, setActiveTab]     = useState('stock');
  const [stockData, setStockData]     = useState({ summary: {}, products: [] });
  const [salesData, setSalesData]     = useState({ totals: {}, salesByDate: [], topProducts: [], categoryBreakdown: [] });
  const [loading, setLoading]         = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId]     = useState(null);
  const [editStock, setEditStock]     = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [groupBy, setGroupBy]         = useState('day');
  const printRef = useRef(null);

  useEffect(() => { fetchStock(); }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStockReport();
      setStockData(res.data);
    } catch {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const res = await adminAPI.getSalesReport({ from: dateFrom, to: dateTo, groupBy });
      setSalesData(res.data);
    } catch {
      toast.error('Failed to load sales report');
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => { if (activeTab === 'sales') fetchSales(); }, [activeTab]);

  const handleUpdateStock = async (id) => {
    if (editStock === '' || isNaN(editStock) || Number(editStock) < 0) {
      toast.error('Enter a valid stock number'); return;
    }
    try {
      await adminAPI.updateStock(id, { stock: Number(editStock) });
      toast.success('Stock updated');
      setEditingId(null);
      fetchStock();
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const handlePrint = () => window.print();

  const filtered = (stockData.products || []).filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const { summary } = stockData;

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-area { display: block !important; color: #000; background: #fff; }
          #print-area * { color: #000 !important; background: transparent !important; border-color: #ccc !important; }
          #print-area table { width: 100%; border-collapse: collapse; }
          #print-area th, #print-area td { border: 1px solid #ccc; padding: 6px 10px; font-size: 12px; }
          #print-area th { background: #f0f0f0 !important; font-weight: bold; }
        }
        @media screen { #print-area { display: block; } }
      `}</style>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'stock', label: 'Stock Overview', icon: FaWarehouse },
          { id: 'sales', label: 'Sales Report',   icon: FaChartBar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === id ? 'btn-glow text-white' : 'glass border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── STOCK OVERVIEW TAB ── */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <SummaryCard icon={FaBox}              label="Total Products" value={summary.totalProducts ?? '—'}  color="bg-blue-500/20 text-blue-400" />
            <SummaryCard icon={FaWarehouse}        label="Total Stock"    value={summary.totalStock ?? '—'}     color="bg-purple-500/20 text-purple-400" />
            <SummaryCard icon={FaShoppingBag}      label="Total Sold"     value={summary.totalSold ?? '—'}      color="bg-green-500/20 text-green-400" />
            <SummaryCard icon={FaTimesCircle}      label="Out of Stock"   value={summary.outOfStock ?? '—'}     color="bg-red-500/20 text-red-400" />
            <SummaryCard icon={FaExclamationTriangle} label="Critical (≤5)" value={summary.criticalStock ?? '—'} color="bg-orange-500/20 text-orange-400" />
            <SummaryCard icon={FaCheckCircle}      label="Low Stock (≤15)" value={summary.lowStock ?? '—'}     color="bg-yellow-500/20 text-yellow-400" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <FaSearch size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full input-dark rounded-xl pl-9 pr-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter size={11} className="text-slate-500" />
              {['all','out_of_stock','critical','low','ok'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === s ? 'btn-glow text-white' : 'glass border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All' : s === 'out_of_stock' ? 'Out of Stock' : s === 'critical' ? 'Critical' : s === 'low' ? 'Low' : 'OK'}
                </button>
              ))}
            </div>
            <button
              onClick={fetchStock}
              className="flex items-center gap-2 glass border border-white/10 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              <FaSync size={11} /> Refresh
            </button>
          </div>

          {/* Table */}
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Brand</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-4 py-3 text-center">Sold</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(9)].map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                        No products found
                      </td>
                    </tr>
                  ) : filtered.map(p => (
                    <tr key={p._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white/5 flex-shrink-0" />
                          <span className="font-semibold text-slate-200 line-clamp-2 max-w-[180px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{p.category}</td>
                      <td className="px-4 py-3 text-slate-400">{p.brand}</td>
                      <td className="px-4 py-3 text-right text-slate-300 font-mono">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3 text-center">
                        {editingId === p._id ? (
                          <input
                            type="number"
                            min="0"
                            value={editStock}
                            onChange={e => setEditStock(e.target.value)}
                            className="w-20 input-dark rounded-lg px-2 py-1 text-center text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className={`font-bold ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-orange-400' : p.stock <= 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                            {p.stock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300 font-semibold">{p.soldQty}</td>
                      <td className="px-4 py-3 text-right text-slate-300 font-mono text-xs">{formatPrice(p.revenue)}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-center">
                        {editingId === p._id ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleUpdateStock(p._id)} className="w-7 h-7 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center hover:bg-green-500/40 transition-colors" title="Save">
                              <FaSave size={11} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="w-7 h-7 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500/40 transition-colors" title="Cancel">
                              <FaTimes size={11} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(p._id); setEditStock(String(p.stock)); }}
                            className="w-7 h-7 glass border border-white/10 text-slate-400 rounded-lg flex items-center justify-center hover:text-blue-400 hover:border-blue-500/30 transition-colors mx-auto"
                            title="Edit stock"
                          >
                            <FaEdit size={11} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500">
                Showing {filtered.length} of {stockData.products?.length || 0} products
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SALES REPORT TAB ── */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="glass rounded-2xl border border-white/5 p-5 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="input-dark rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="input-dark rounded-xl px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Group By</label>
              <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
                className="input-dark rounded-xl px-3 py-2 text-sm">
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
            <button onClick={fetchSales}
              className="flex items-center gap-2 btn-glow text-white px-5 py-2.5 rounded-xl text-sm font-bold">
              <FaSync size={11} /> Generate Report
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 glass border border-white/10 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ml-auto">
              <FaPrint size={12} /> Print Report
            </button>
          </div>

          {/* Print area */}
          <div id="print-area">
            {/* Print header (visible only when printing) */}
            <div className="hidden print:block mb-6 text-center border-b pb-4">
              <h1 className="text-2xl font-black">DODOS ELECTRO STORE</h1>
              <h2 className="text-lg font-bold mt-1">Sales Report</h2>
              {(dateFrom || dateTo) && (
                <p className="text-sm mt-1">Period: {dateFrom || '—'} to {dateTo || '—'}</p>
              )}
              <p className="text-xs mt-1">Generated: {new Date().toLocaleString()}</p>
            </div>

            {salesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <SalesReportsArea salesData={salesData} formatPrice={formatPrice} groupBy={groupBy} t={t} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
