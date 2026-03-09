'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Store, MessageCircle, ArrowLeft, Package, BadgeCheck,
  Phone, ShoppingBag,
} from 'lucide-react';

interface StoreData {
  _id: string;
  storeName: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  category: string;
  ownerName: string;
  totalProducts: number;
  totalViews: number;
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
}

function formatPrice(price: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const [storeRes, productsRes] = await Promise.all([
          fetch(`/api/marketplace/stores/${id}`),
          fetch(`/api/marketplace/products?storeId=${id}`),
        ]);
        if (storeRes.ok) setStore(await storeRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  const whatsappUrl = store
    ? `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello! I found your store "${store.storeName}" on COJF Marketplace and I'd like to enquire about your products.`)}`
    : '#';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Store size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="font-bold text-slate-700 dark:text-slate-300">Store not found</h2>
          <Link href="/marketplace" className="text-sm text-primary mt-2 inline-block">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-br from-primary/30 to-blue-400/20 relative overflow-hidden">
        {store.bannerUrl && (
          <img src={store.bannerUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link href="/marketplace" className="flex items-center gap-1.5 text-white/90 text-sm hover:text-white bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
            <ArrowLeft size={14} /> Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Store header */}
        <div className="-mt-12 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="w-full h-full object-cover" />
              ) : (
                <Store size={32} className="text-primary" />
              )}
            </div>
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {store.storeName}
                <BadgeCheck size={20} className="text-blue-500" />
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">by {store.ownerName}</p>
            </div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={16} />
            Contact Store
          </a>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-xl">{store.description}</p>

        <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8">
          <span className="flex items-center gap-1"><Package size={14} />{store.totalProducts} products</span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><Phone size={14} />WhatsApp checkout</span>
        </div>

        {/* Products grid */}
        <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-4 flex items-center gap-2">
          <ShoppingBag size={18} className="text-primary" />
          Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {products.map((product) => (
              <div key={product._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? 'In Stock' : 'Sold'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1">{product.title}</h3>
                  <p className="text-base font-bold text-primary dark:text-blue-400 mb-3">{formatPrice(product.price, product.currency)}</p>
                  {product.inStock && (
                    <a
                      href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'd like to buy "${product.title}" (${formatPrice(product.price, product.currency)}) from ${store.storeName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg text-xs transition-colors"
                    >
                      <MessageCircle size={13} /> Buy on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}