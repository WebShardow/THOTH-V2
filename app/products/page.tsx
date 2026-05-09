'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  thumbnail?: string;
  category?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-indigo-600 hover:text-indigo-700 transition">
            Micro CMS
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-slate-600 hover:text-indigo-600 transition font-semibold">Home</Link>
            <Link href="/products" className="text-indigo-600 hover:text-indigo-700 transition font-semibold font-bold">Products</Link>
            <Link href="/login" className="text-slate-600 hover:text-indigo-600 transition font-semibold">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 py-16 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-5xl font-black text-slate-900 mb-4">Product Catalog</h1>
          <p className="text-xl text-slate-600">
            Explore our comprehensive collection of products and solutions.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin text-3xl">⚙️</div>
              <p className="text-slate-600 mt-4 font-semibold">Loading products...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-700 font-bold">⚠️ {error}</p>
              <p className="text-slate-600 text-sm mt-2">
                Make sure the backend API is running and the database is configured.
              </p>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-slate-700 text-lg font-semibold">No products found yet.</p>
              <p className="text-slate-600 mt-2">
                Products will appear here once added in the <Link href="/login" className="text-indigo-600 hover:underline font-bold">admin panel</Link>.
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden hover:border-indigo-600 hover:shadow-lg transition-all group"
                >
                  {product.thumbnail && (
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{product.name}</h3>
                    {product.category && (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 rounded px-3 py-1 inline-block mb-3">
                        {product.category}
                      </span>
                    )}
                    {product.description && (
                      <p className="text-slate-600 text-sm line-clamp-3 mb-4">{product.description}</p>
                    )}
                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="inline-block text-indigo-600 hover:text-indigo-700 font-bold text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-8 mt-12">
        <div className="mx-auto max-w-6xl text-center text-slate-400">
          <p>Powered by Micro Headless CMS — API-First Content Platform</p>
        </div>
      </footer>
    </main>
  );
}
