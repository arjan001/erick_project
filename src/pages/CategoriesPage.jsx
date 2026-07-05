import React, { useState, useEffect } from 'react';
import { ContentCategory } from '@/lib/supabaseEntities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await ContentCategory.filter({ status: 'active' }, 'display_order', 100);
        setCategories(all || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">All Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Browse all content categories — from cameras and lenses to lighting, audio, locations, and more.</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Categories are being curated. Check back soon!</p>
            <Link to={createPageUrl('Home')} className="mt-4 inline-block">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="aspect-square bg-white p-8 flex items-center justify-center">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl font-bold">{cat.name?.charAt(0)}</div>
                  )}
                </div>
                <div className="p-5 border-t border-gray-100">
                  <h3 className="text-base font-semibold uppercase tracking-tight mb-1">{cat.name}</h3>
                  {cat.item_count && <p className="text-xs text-gray-500 font-medium mb-2">{cat.item_count}</p>}
                  {cat.description && <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" size="lg" className="border-gray-300">Back to Home <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>
      </div>
    </div>
  );
}