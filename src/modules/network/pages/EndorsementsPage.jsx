import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Endorsement, Artist, Notification } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Star, Plus, X, MessageCircle, ThumbsUp, Award, Users } from 'lucide-react';

export default function EndorsementsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [endorsements, setEndorsements] = useState([]);
  const [receivedEndorsements, setReceivedEndorsements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [endorsementForm, setEndorsementForm] = useState({
    skill: '',
    message: '',
    rating: 5
  });

  const skills = [
    'Directing', 'Cinematography', 'Editing', 'VFX', 'Sound Design',
    'Production', 'Art Direction', 'Costume Design', 'Lighting',
    'Photography', 'Motion Graphics', 'Color Grading', 'Screenwriting'
  ];

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

    const fetchEndorsements = async () => {
      try {
        const allEndorsements = await Endorsement.list();
        
        const given = allEndorsements.filter(e => e.endorser_email === user.email);
        const received = allEndorsements.filter(e => e.recipient_email === user.email);

        const enrichedGiven = await Promise.all(
          given.map(async (endorsement) => {
            try {
              const artist = await Artist.filter({ email: endorsement.recipient_email });
              return { ...endorsement, artist: artist[0] || null };
            } catch (err) {
              return { ...endorsement, artist: null };
            }
          })
        );

        const enrichedReceived = await Promise.all(
          received.map(async (endorsement) => {
            try {
              const endorser = await Artist.filter({ email: endorsement.endorser_email });
              return { ...endorsement, endorser: endorser[0] || null };
            } catch (err) {
              return { ...endorsement, endorser: null };
            }
          })
        );

        setEndorsements(enrichedGiven.filter(e => e.artist));
        setReceivedEndorsements(enrichedReceived.filter(e => e.endorser));
      } catch (err) {
        console.error('Error fetching endorsements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndorsements();
  }, [user]);

  const handleCreateEndorsement = async () => {
    if (!selectedPerson || !endorsementForm.skill) return;

    try {
      await Endorsement.create({
        endorser_email: user.email,
        endorser_name: user.full_name,
        recipient_email: selectedPerson.email,
        recipient_type: 'artist',
        skill: endorsementForm.skill,
        message: endorsementForm.message,
        rating: endorsementForm.rating,
      });

      await Notification.create({
        recipient_email: selectedPerson.email,
        sender_email: user.email,
        sender_name: user.full_name,
        type: 'endorment',
        title: 'New Endorsement',
        message: `${user.full_name} endorsed you for ${endorsementForm.skill}`,
        action_required: false
      });

      setShowModal(false);
      setSelectedPerson(null);
      setEndorsementForm({ skill: '', message: '', rating: 5 });

      success('Endorsement Sent', `You endorsed ${selectedPerson.full_name} for ${endorsementForm.skill}`);
      // re-fetch after create
      const allE = await Endorsement.list();
      setEndorsements(allE.filter(e => e.endorser_email === user.email));
      setReceivedEndorsements(allE.filter(e => e.endorsed_email === user.email));
    } catch (err) {
      console.error('Error creating endorsement:', err);
      error('Failed', 'Failed to create endorsement');
    }
  };

  const handleDeleteEndorsement = async (endorsementId) => {
    try {
      await Endorsement.delete(endorsementId);
      setEndorsements(prev => prev.filter(e => e.id !== endorsementId));
      success('Deleted', 'Endorsement deleted successfully');
    } catch (err) {
      console.error('Error deleting endorsement:', err);
      error('Failed', 'Failed to delete endorsement');
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
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Endorsements</h1>
          <p className="text-sm text-gray-600 mt-1">
            Give and receive professional endorsements
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Give Endorsement
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Received Endorsements */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Received ({receivedEndorsements.length})
              </h2>
              {receivedEndorsements.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No endorsements received yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedEndorsements.map((endorsement) => (
                    <div key={endorsement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {endorsement.endorser?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{endorsement.endorser?.full_name}</p>
                            <p className="text-sm text-gray-500">{endorsement.skill}</p>
                          </div>
                        </div>
                        <div className="flex">{renderStars(endorsement.rating)}</div>
                      </div>
                      {endorsement.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{endorsement.message}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(endorsement.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Given Endorsements */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                Given ({endorsements.length})
              </h2>
              {endorsements.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No endorsements given yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {endorsements.map((endorsement) => (
                    <div key={endorsement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {endorsement.artist?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{endorsement.artist?.full_name}</p>
                            <p className="text-sm text-gray-500">{endorsement.skill}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(endorsement.rating)}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEndorsement(endorsement.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {endorsement.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{endorsement.message}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(endorsement.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

      {/* Endorsement Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Give Endorsement</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Artist Email</label>
                  <input
                    type="email"
                    value={selectedPerson?.email || ''}
                    onChange={(e) => setSelectedPerson({ ...selectedPerson, email: e.target.value })}
                    placeholder="Enter artist's email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Skill</label>
                  <select
                    value={endorsementForm.skill}
                    onChange={(e) => setEndorsementForm({ ...endorsementForm, skill: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select a skill</option>
                    {skills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setEndorsementForm({ ...endorsementForm, rating })}
                        className="p-2"
                      >
                        <Star
                          className={`w-6 h-6 ${rating <= endorsementForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Message (optional)</label>
                  <textarea
                    value={endorsementForm.message}
                    onChange={(e) => setEndorsementForm({ ...endorsementForm, message: e.target.value })}
                    placeholder="Add a personal message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateEndorsement} className="bg-black text-white hover:bg-gray-800">
                  Send Endorsement
                </Button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}