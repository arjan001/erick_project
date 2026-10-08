import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Plus, Edit, Trash2, Shield, Check, X } from 'lucide-react'

const roles = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: ['users.manage', 'roles.manage', 'content.manage', 'settings.manage', 'finance.manage']
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Creator profile management',
    permissions: ['profile.edit', 'portfolio.manage', 'jobs.apply', 'messages.send']
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Team profile management',
    permissions: ['profile.edit', 'portfolio.manage', 'jobs.apply', 'messages.send']
  },
  {
    id: 'project_owner',
    name: 'Project Owner',
    description: 'Client project management',
    permissions: ['projects.create', 'projects.manage', 'jobs.post', 'messages.send']
  },
  {
    id: 'backer',
    name: 'Backer',
    description: 'Investment and backing',
    permissions: ['projects.view', 'backing.manage', 'investments.view']
  }
]

const allPermissions = [
  { id: 'users.manage', label: 'Manage Users', category: 'User Management' },
  { id: 'roles.manage', label: 'Manage Roles', category: 'User Management' },
  { id: 'profile.edit', label: 'Edit Profile', category: 'Profile' },
  { id: 'portfolio.manage', label: 'Manage Portfolio', category: 'Profile' },
  { id: 'content.manage', label: 'Manage Content', category: 'Content' },
  { id: 'settings.manage', label: 'Manage Settings', category: 'System' },
  { id: 'finance.manage', label: 'Manage Finance', category: 'Finance' },
  { id: 'projects.create', label: 'Create Projects', category: 'Projects' },
  { id: 'projects.manage', label: 'Manage Projects', category: 'Projects' },
  { id: 'projects.view', label: 'View Projects', category: 'Projects' },
  { id: 'jobs.apply', label: 'Apply for Jobs', category: 'Jobs' },
  { id: 'jobs.post', label: 'Post Jobs', category: 'Jobs' },
  { id: 'messages.send', label: 'Send Messages', category: 'Communication' },
  { id: 'backing.manage', label: 'Manage Backing', category: 'Finance' },
  { id: 'investments.view', label: 'View Investments', category: 'Finance' }
]

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [editingPermissions, setEditingPermissions] = useState(false)

  const togglePermission = (permissionId) => {
    if (!selectedRole) return
    const newPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId]
    setSelectedRole({ ...selectedRole, permissions: newPermissions })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Manage user roles and their permissions</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{role.permissions.length} permissions</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Editor */}
        {selectedRole && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Permissions: {selectedRole.name}</CardTitle>
                <div className="flex gap-2">
                  {editingPermissions ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setEditingPermissions(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => setEditingPermissions(false)}>
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setEditingPermissions(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  allPermissions.reduce((acc, perm) => {
                    if (!acc[perm.category]) acc[perm.category] = []
                    acc[perm.category].push(perm)
                    return acc
                  }, {})
                ).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="space-y-2">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                              checked={selectedRole.permissions.includes(permission.id)}
                              onCheckedChange={() => editingPermissions && togglePermission(permission.id)}
                              disabled={!editingPermissions}
                            />
                            <span className="text-sm">{permission.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
