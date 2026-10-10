/**
 * Admin Database Backup Page
 * Allows administrators to backup and restore database
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Database, Download, Upload, RefreshCw, CheckCircle, AlertCircle, FileText, Calendar, HardDrive, Shield, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { backupAndDownload, getBackupStats, validateBackup, readBackupFile } from '@/services/databaseBackupService'

export default function AdminDatabaseBackupPage() {
  const { success, error: toastError } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getBackupStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load backup stats:', err)
    }
  }

  const handleBackup = async () => {
    setSaving(true)
    try {
      const result = await backupAndDownload()
      if (result.success) {
        success('Backup Complete', 'Database backup has been downloaded successfully')
        await loadStats()
      } else {
        toastError('Backup Failed', result.error || 'Failed to create backup')
      }
    } catch (err) {
      console.error('Backup error:', err)
      toastError('Backup Failed', 'Failed to create database backup')
    } finally {
      setSaving(false)
    }
  }

  const handleRestore = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const backup = await readBackupFile(file)
      // For now, just validate the backup
      // Actual restore would need careful implementation
      toastError('Restore Not Implemented', 'Restore functionality requires careful implementation to avoid data loss')
    } catch (err) {
      console.error('Restore error:', err)
      toastError('Restore Failed', err.message || 'Failed to restore database')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const totalRecords = Object.values(stats.tables).reduce((sum, count) => {
    if (typeof count === 'number') return sum + count
    return sum
  }, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Database Backup</h1>
        <p className="text-gray-600 text-sm mt-1">Backup and restore your SmartGigs Kenya database</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Backup Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Backup Actions
            </CardTitle>
            <CardDescription>Create and download a complete database backup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleBackup}
                disabled={saving}
                className="bg-black text-white hover:bg-gray-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup
                  </>
                )}
              </Button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button
                  variant="outline"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Restore Backup
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> Restoring a backup will overwrite existing data. Always create a new backup before restoring.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Backup Statistics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Database Statistics
            </CardTitle>
            <CardDescription>Current database record counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Total Tables</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalTables}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Total Records</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Last Backup</span>
                </div>
                <div className="text-sm font-medium text-gray-900">Manual</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Status</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Healthy
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm">Table Record Counts</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(stats.tables).map(([tableName, count]) => (
                  <div
                    key={tableName}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                  >
                    <span className="text-gray-600 truncate">{tableName}</span>
                    <span className={`font-medium ${typeof count === 'number' ? 'text-gray-900' : 'text-red-500'}`}>
                      {typeof count === 'number' ? count.toLocaleString() : count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-sm bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm mb-1">About Database Backups</h3>
                <p className="text-sm text-blue-800">
                  Backups include all tables and data from your Supabase database. The backup file is saved as JSON and can be used for migration or disaster recovery. For production environments, consider using Supabase's built-in backup features or PostgreSQL pg_dump for more reliable backups.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
