'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Search, Store, MessageCircle, Tag,
  Star, ChevronRight, Filter, Package, X, ArrowRight,
  Sparkles, BadgeCheck,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Items' },
  { value: 'food-beverages', label: 'Food & Drinks' },
  { value: 'clothing-fashion', label: 'Clothing & Fashion' },
  { value: 'books-media', label: 'Books & Media' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home-garden', label: 'Home & Garden' },
  { value: 'beauty-health', label: 'Beauty & Health' },
  { value: 'services', label: 'Services' },
  { value: 'crafts-handmade', label: 'Crafts & Handmade' },
  { value: 'other', label: 'Other' },
];

interface Store {
  _id: string;
  storeName: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  category: string;
  totalProducts: number;
  totalViews: number;
  ownerName: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  images: string[];
  inStock: boolean;
  storeId: {
    _id: string;
    storeName: string;
    whatsappNumber: string;
    status: string;
  };
}

function formatPrice(price: number, currency: string = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

function WhatsAppCheckout({ whatsapp, productTitle, price, currency }: {
  whatsapp: string; productTitle: string; price: number; currency: string;
}) {
  const clean = whatsapp.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `Hello! I'm interested in purchasing "${productTitle}" (${formatPrice(price, currency)}) from your store on COJF Marketplace. Is it still available?`
  );
  const url = `https://wa.me/${clean}?text=${msg}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/20"
    >
      <MessageCircle size={16} />
      Buy via WhatsApp
    </a>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* Product image */}
      <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
        {product.images?.[0] && !imgError ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
            {product.inStock ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
        {product.condition !== 'new' && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {product.condition === 'used-good' ? 'Used - Good' : 'Used - Fair'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
          <Store size={11} />
          {product.storeId?.storeName}
        </p>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 mb-2">{product.title}</h3>
        <p className="text-lg font-bold text-primary dark:text-blue-400 mb-3">
          {formatPrice(product.price, product.currency)}
        </p>

        {product.inStock && product.storeId?.whatsappNumber ? (
          <WhatsAppCheckout
            whatsapp={product.storeId.whatsappNumber}
            productTitle={product.title}
            price={product.price}
            currency={product.currency}
          />
        ) : (
          <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-semibold px-4 py-2.5 rounded-xl text-sm cursor-not-allowed">
            <MessageCircle size={16} />
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}

function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/marketplace/store/${store._id}`} className="block">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-primary/20 to-blue-400/20 dark:from-primary/30 dark:to-blue-400/30 relative overflow-hidden">
          {store.bannerUrl && (
            <img src={store.bannerUrl} alt="" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="px-4 pb-4">
          {/* Store logo */}
          <div className="-mt-6 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-md overflow-hidden flex items-center justify-center">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="w-full h-full object-cover" />
              ) : (
                <Store size={22} className="text-primary" />
              )}
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {store.storeName}
                <BadgeCheck size={14} className="text-blue-500 shrink-0" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">by {store.ownerName}</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{store.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><Package size={11} />{store.totalProducts} products</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <MessageCircle size={11} />WhatsApp Ready
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  const [tab, setTab] = useState<'products' | 'stores'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);

      const [productsRes, storesRes] = await Promise.all([
        fetch(`/api/marketplace/products?${params}`),
        fetch('/api/marketplace/stores'),
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (storesRes.ok) setStores(await storesRes.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => setSearch(searchInput);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ShoppingBag size={22} />
            </div>
            <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Church Marketplace</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Buy & Sell Within the Church</h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl">
            Shop directly from fellow church members. Every purchase goes directly to the seller via WhatsApp — no middlemen.
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-xl">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button onClick={handleSearch} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{stores.length}</div>
              <div className="text-blue-200">Active Stores</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">{products.length}</div>
              <div className="text-blue-200">Products Listed</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-blue-200">WhatsApp Based</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Open store CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Want to open your own store?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Apply for approval and start selling to the church community</p>
            </div>
          </div>
          <Link href="/marketplace/apply" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap">
            Apply to Sell <ArrowRight size={14} />
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'products' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Package size={15} /> Products ({products.length})
          </button>
          <button
            onClick={() => setTab('stores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'stores' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Store size={15} /> Stores ({stores.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-slate-200 dark:bg-slate-700" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'products' ? (
          products.length === 0 ? (
            <div className="text-center py-16">
              <Package size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">No products found</h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )
        ) : (
          stores.length === 0 ? (
            <div className="text-center py-16">
              <Store size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">No stores yet</h3>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Be the first to open a store!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <StoreCard key={store._id} store={store} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}