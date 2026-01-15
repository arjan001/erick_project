import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, MapPin, Briefcase, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TeamAdmin() {
  const queryClient = useQueryClient();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', specialty: '', email: '' });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: team, isLoading } = useQuery({
    queryKey: ['myTeam'],
    queryFn: async () => {
      if (!user?.linked_entity_id) return null;
      return await base44.entities.Team.get(user.linked_entity_id);
    },
    enabled: !!user,
  });

  const updateTeamMutation = useMutation({
    mutationFn: (updatedData) => base44.entities.Team.update(team.id, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTeam'] });
      setIsAddingMember(false);
      setNewMember({ name: '', specialty: '', email: '' });
    },
  });

  if (!user || user.role !== 'team_admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600">Team Admin access required</p>
        </div>
      </div>
    );
  }

  const handleAddMember = () => {
    if (!newMember.name || !newMember.specialty) return;
    
    const currentMembers = team.team_members || [];
    updateTeamMutation.mutate({
      team_members: [...currentMembers, newMember]
    });
  };

  const handleRemoveMember = (index) => {
    const currentMembers = team.team_members || [];
    updateTeamMutation.mutate({
      team_members: currentMembers.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Team Dashboard</h1>
          <p className="text-gray-600">Manage your team and members</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading team data...</p>
          </div>
        ) : !team ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No team linked to your account</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Info Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-black">{team.team_code}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{team.city}, {team.country}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.specialties?.map((specialty) => (
                    <Badge key={specialty} className="bg-blue-100 text-blue-800">
                      {specialty.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>Team Size: {team.team_size?.replace('_', '-')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Team Members Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-black">Team Members</CardTitle>
                  <Button 
                    onClick={() => setIsAddingMember(!isAddingMember)}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAddingMember && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <Input
                      placeholder="Member Name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className="bg-white"
                    />
                    <Input
                      placeholder="Specialty (e.g., Cinematographer, Editor)"
                      value={newMember.specialty}
                      onChange={(e) => setNewMember({ ...newMember, specialty: e.target.value })}
                      className="bg-white"
                    />
                    <Input
                      placeholder="Email (optional)"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="bg-white"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleAddMember} className="bg-black text-white hover:bg-gray-800">
                        Save Member
                      </Button>
                      <Button onClick={() => setIsAddingMember(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {team.team_members?.length > 0 ? (
                  <div className="space-y-3">
                    {team.team_members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-black">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.specialty}</p>
                          {member.email && <p className="text-sm text-gray-500">{member.email}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No team members added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}