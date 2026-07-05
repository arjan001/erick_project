import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContentCategory, FeaturedWork, SuccessStory, RecentProject } from '@/lib/supabaseEntities';
import { createPageUrl } from '@/shared/utils/routing';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategorySinglePage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [featuredWorks, setFeaturedWorks] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch category by slug
        const categories = await ContentCategory.filter({ slug, status: 'active' });
        const cat = categories?.[0] || null;
        setCategory(cat);

        if (cat) {
          // Fetch related content for this category
          const [works, stories, projects] = await Promise.all([
            FeaturedWork.filter({ category: cat.name, status: 'active' }, 'display_order', 9),
            SuccessStory.filter({ category: cat.name, status: 'published' }, 'display_order', 6),
            RecentProject.filter({ category: cat.name, is_active: true }, 'display_order', 4)
          ]);
          setFeaturedWorks(works || []);
          setSuccessStories(stories || []);
          setRecentProjects(projects || []);
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] py-20 px-4">
        <div className="max-w-[1800px] mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl('Categories')}>
            <Button variant="outline">Browse All Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-12 md:py-20">
          <Link to={createPageUrl('Categories')} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
          </Link>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">{category.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{category.description}</p>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {featuredWorks.length} Featured Works
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {successStories.length} Success Stories
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {recentProjects.length} Recent Projects
                </span>
              </div>
            </div>
            {category.image_url && (
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Works */}
      {featuredWorks.length > 0 && (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Featured Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorks.map((work) => (
              <div key={work.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                {work.images?.[0] && (
                  <div className="aspect-video bg-gray-100">
                    <img src={work.images[0]} alt={work.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{work.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{work.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Stories */}
      {successStories.length > 0 && (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {successStories.map((story) => (
              <div key={story.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                {story.images?.[0] && (
                  <div className="aspect-video bg-gray-100">
                    <img src={story.images[0]} alt={story.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{story.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                {project.images?.[0] && (
                  <div className="aspect-square bg-gray-100">
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{project.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Content */}
      {featuredWorks.length === 0 && successStories.length === 0 && recentProjects.length === 0 && (
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-20 text-center">
          <p className="text-gray-600 text-lg">No content available for this category yet.</p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-12">
        <Link to={createPageUrl('Categories')}>
          <Button variant="outline" size="lg" className="border-gray-300">
            Browse All Categories <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
