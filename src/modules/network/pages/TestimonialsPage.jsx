import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Testimonial, Artist, Notification } from '@/lib/supabaseEntities';
import ArtistSidebar from '@/components/ArtistSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Star, Plus, X, MessageCircle, ThumbsUp, Award, Users, Briefcase } from 'lucide-react';

export default function TestimonialsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [receivedTestimonials, setReceivedTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    project_title: '',
    content: '',
    rating: 5,
    collaboration_type: 'worked_together'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTestimonials = async () => {
      try {
        const allTestimonials = await Testimonial.list();
        
        const given = allTestimonials.filter(t => t.author_email === user.email);
        const received = allTestimonials.filter(t => t.recipient_email === user.email);

        const enrichedGiven = await Promise.all(
          given.map(async (testimonial) => {
            try {
              const artist = await Artist.filter({ email: testimonial.recipient_email });
              return { ...testimonial, recipient: artist[0] || null };
            } catch (err) {
              return { ...testimonial, recipient: null };
            }
          })
        );

        const enrichedReceived = await Promise.all(
          received.map(async (testimonial) => {
            try {
              const author = await Artist.filter({ email: testimonial.author_email });
              return { ...testimonial, author: author[0] || null };
            } catch (err) {
              return { ...testimonial, author: null };
            }
          })
        );

        setTestimonials(enrichedGiven.filter(t => t.recipient));
        setReceivedTestimonials(enrichedReceived.filter(t => t.author));
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [user]);

  const handleCreateTestimonial = async () => {
    if (!selectedPerson || !testimonialForm.project_title || !testimonialForm.content) return;

    try {
      await Testimonial.create({
        author_email: user.email,
        author_name: user.full_name,
        recipient_email: selectedPerson.email,
        recipient_type: 'artist',
        project_name: testimonialForm.project_title,
        content: testimonialForm.content,
        rating: testimonialForm.rating,
        collaboration_type: testimonialForm.collaboration_type,
      });

      await Notification.create({
        recipient_email: selectedPerson.email,
        sender_email: user.email,
        sender_name: user.full_name,
        type: 'testimonial',
        title: 'New Testimonial',
        message: `${user.full_name} wrote a testimonial about working with you`,
        action_required: false
      });

      setShowModal(false);
      setSelectedPerson(null);
      setTestimonialForm({ project_title: '', content: '', rating: 5, collaboration_type: 'worked_together' });

      success('Testimonial Sent', `You wrote a testimonial for ${selectedPerson.full_name}`);
      const allT = await Testimonial.list();
      setTestimonials(allT.filter(t => t.author_email === user.email));
      setReceivedTestimonials(allT.filter(t => t.recipient_email === user.email));
    } catch (err) {
      console.error('Error creating testimonial:', err);
      error('Failed', 'Failed to create testimonial');
    }
  };

  const handleDeleteTestimonial = async (testimonialId) => {
    try {
      await Testimonial.delete(testimonialId);
      setTestimonials(prev => prev.filter(t => t.id !== testimonialId));
      success('Deleted', 'Testimonial deleted successfully');
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      error('Failed', 'Failed to delete testimonial');
    }
  };

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full flex flex-col overflow-hidden bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
              <p className="text-sm text-gray-600 mt-1">
                Share your experience working with others
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Write Testimonial
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Received Testimonials */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Received ({receivedTestimonials.length})
              </h2>
              {receivedTestimonials.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No testimonials received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedTestimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {testimonial.author?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{testimonial.author?.full_name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {testimonial.project_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex">{renderStars(testimonial.rating)}</div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">"{testimonial.content}"</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(testimonial.created_date).toLocaleDateString()}</span>
                        <span className="capitalize">{testimonial.collaboration_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Given Testimonials */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                Given ({testimonials.length})
              </h2>
              {testimonials.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No testimonials written yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {testimonial.recipient?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{testimonial.recipient?.full_name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {testimonial.project_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(testimonial.rating)}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTestimonial(testimonial.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-3">"{testimonial.content}"</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(testimonial.created_date).toLocaleDateString()}</span>
                        <span className="capitalize">{testimonial.collaboration_type?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Testimonial Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Write Testimonial</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={selectedPerson?.email || ''}
                    onChange={(e) => setSelectedPerson({ ...selectedPerson, email: e.target.value })}
                    placeholder="Enter recipient's email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={testimonialForm.project_title}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, project_title: e.target.value })}
                    placeholder="e.g., Summer Campaign 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Collaboration Type</label>
                  <select
                    value={testimonialForm.collaboration_type}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, collaboration_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="worked_together">Worked Together</option>
                    <option value="hired_them">Hired Them</option>
                    <option value="was_hired_by">Was Hired By</option>
                    <option value="collaborated_on_project">Collaborated on Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setTestimonialForm({ ...testimonialForm, rating })}
                        className="p-2"
                      >
                        <Star
                          className={`w-6 h-6 ${rating <= testimonialForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Testimonial</label>
                  <textarea
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    placeholder="Share your experience working together..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateTestimonial} className="bg-black text-white hover:bg-gray-800">
                  Send Testimonial
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}