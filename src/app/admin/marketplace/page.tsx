'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Store, Plus, Package, Trash2, Edit, CheckCircle, Clock,
  XCircle, AlertTriangle, MessageCircle, ShoppingBag, ArrowRight,
} from 'lucide-react';

interface MyStore {
  _id: string;
  storeName: string;
  description: string;
  whatsappNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  setupFeePaid: boolean;
  totalProducts: number;
  category: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  inStock: boolean;
  condition: string;
}

const CATEGORIES = [
  'food-beverages', 'clothing-fashion', 'books-media', 'electronics',
  'home-garden', 'beauty-health', 'services', 'crafts-handmade', 'other'
];

function formatPrice(price: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export default function MyStorePage() {
  const { data: session } = useSession();
  const [store, setStore] = useState<MyStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'NGN',
    category: 'other',
    condition: 'new',
    images: '',
    inStock: true,
    quantity: '',
  });

  useEffect(() => {
    const fetchMyStore = async () => {
      try {
        const [storesRes] = await Promise.all([
          fetch('/api/marketplace/stores?myStores=1'),
        ]);
        if (storesRes.ok) {
          const data = await storesRes.json();
          if (data.length > 0) {
            setStore(data[0]);
            if (data[0].status === 'approved') {
              const productsRes = await fetch(`/api/marketplace/products?storeId=${data[0]._id}`);
              if (productsRes.ok) setProducts(await productsRes.json());
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchMyStore();
  }, [session]);

  const handleAddProduct = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const res = await fetch('/api/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          storeId: store._id,
          price: parseFloat(productForm.price),
          quantity: productForm.quantity ? parseInt(productForm.quantity) : undefined,
          images: productForm.images ? productForm.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setProducts((prev) => [newProduct, ...prev]);
        setShowAddProduct(false);
        setProductForm({ title: '', description: '', price: '', currency: 'NGN', category: 'other', condition: 'new', images: '', inStock: true, quantity: '' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/marketplace/products/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const toggleStock = async (id: string, current: boolean) => {
    const res = await fetch(`/api/marketplace/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: !current }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, inStock: !current } : p));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="space-y-6 page-enter">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Store className="text-primary" size={24} />My Store
        </h1>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
          <Store size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="font-bold text-slate-800 dark:text-slate-200 text-xl mb-2">You don't have a store yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Apply to open a store and start selling to the church community</p>
          <Link href="/marketplace/apply" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
            Apply to Open a Store <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    approved: { label: 'Active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    suspended: { label: 'Suspended', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400', icon: AlertTriangle },
  };
  const StatusIcon = statusConfig[store.status].icon;

  return (
    <div className="space-y-6 page-enter">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Store className="text-primary" size={24} />My Store
      </h1>

      {/* Store card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{store.storeName}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[store.status].color}`}>
                <StatusIcon size={12} />
                {statusConfig[store.status].label}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">{store.description}</p>
            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><MessageCircle size={14} />{store.whatsappNumber}</span>
              <span className="flex items-center gap-1"><Package size={14} />{store.totalProducts} products</span>
            </div>
          </div>
          {store.status === 'approved' && (
            <Link href={`/marketplace/store/${store._id}`} target="_blank" className="flex items-center gap-2 text-sm text-primary dark:text-blue-400 hover:underline">
              <ShoppingBag size={15} />View Public Store
            </Link>
          )}
        </div>

        {store.status === 'pending' && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Your application is under review.</strong> The super admin will approve or reject it soon. Make sure you have completed the ₦5,000 setup fee payment.
          </div>
        )}

        {store.status === 'rejected' && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl p-4 text-sm text-red-800 dark:text-red-300">
            <strong>Your store application was rejected.</strong> Please contact the admin for more information.
          </div>
        )}
      </div>

      {/* Products section (only for approved stores) */}
      {store.status === 'approved' && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
              <Package size={18} className="text-primary" />My Products ({products.length})
            </h2>
            <button
              onClick={() => setShowAddProduct(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus size={15} />Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center">
              <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={28} className="text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-1 mb-1">{product.title}</h3>
                    <p className="font-bold text-primary dark:text-blue-400 mb-2">{formatPrice(product.price, product.currency)}</p>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleStock(product._id, product.inStock)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${product.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add product modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white">Add New Product</h3>
              <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Product Title *</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description *</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Price *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Currency</label>
                  <select
                    value={productForm.currency}
                    onChange={(e) => setProductForm((p) => ({ ...p, currency: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Condition</label>
                  <select
                    value={productForm.condition}
                    onChange={(e) => setProductForm((p) => ({ ...p, condition: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="new">New</option>
                    <option value="used-good">Used - Good</option>
                    <option value="used-fair">Used - Fair</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Image URLs (one per line)</label>
                <textarea
                  value={productForm.images}
                  onChange={(e) => setProductForm((p) => ({ ...p, images: e.target.value }))}
                  rows={2}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm((p) => ({ ...p, inStock: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Currently in stock</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 px-5 py-4 flex gap-3">
              <button
                onClick={() => setShowAddProduct(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={saving || !productForm.title || !productForm.price}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}