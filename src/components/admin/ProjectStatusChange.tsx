import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { AlertCircle, Flag, CheckCircle, MessageSquare } from 'lucide-react';
import type { ProjectStatus } from '../../types/project';

interface ProjectStatusChangeProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus, notes?: string) => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: React.ReactNode }[] = [
  {
    value: 'waiting_approval',
    label: 'Waiting Approval',
    icon: <AlertCircle className="w-4 h-4" />
  },
  {
    value: 'flagged',
    label: 'Flagged',
    icon: <Flag className="w-4 h-4" />
  },
  {
    value: 'approved',
    label: 'Approved',
    icon: <CheckCircle className="w-4 h-4" />
  },
  {
    value: 'changes_requested',
    label: 'Changes Requested',
    icon: <MessageSquare className="w-4 h-4" />
  }
];

export function ProjectStatusChange({ currentStatus, onStatusChange }: ProjectStatusChangeProps) {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false); // Close modal immediately for better UX

    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await onStatusChange(selectedStatus, notes);
      toast.success('Project status updated successfully');
      setNotes('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project status';
      toast.error(errorMessage);
      console.error('Status update error:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
      >
        Change Status
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 border border-white/10 rounded-lg shadow-xl z-50">
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-gray-900/95 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Admin Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}