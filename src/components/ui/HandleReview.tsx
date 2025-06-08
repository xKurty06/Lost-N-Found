import React, { useState } from 'react';
import { createClient } from '../../supabase/clients/client';
import { useToast } from './ToastProvider';

interface HandleReviewProps {
  open: boolean;
  onClose: () => void;
  item: any;
  modalType: 'accept' | 'reject';
  onStatusChange?: (status: 'claimed' | 'not_claimed') => void;
}

export default function HandleReview({ open, onClose, item, modalType, onStatusChange }: HandleReviewProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const { showToast } = useToast();

  if (!open) return null;

  const handleAction = async (status: 'claimed' | 'not_claimed') => {
    if (!reason.trim()) {
      showToast('Reason is required.', 'error');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    // Optionally, you can store the reason/notes in a review table or as part of the item if schema allows
    const { error } = await supabase
      .from('items')
      .update({ status })
      .eq('id', item.id);
    setLoading(false);
    if (!error) {
      showToast(
        status === 'claimed' ? 'Item marked as claimed.' : 'Item returned to found pool.',
        'success'
      );
      if (onStatusChange) onStatusChange(status);
      onClose();
    } else {
      showToast('Failed to update item status.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        className="bg-white shadow-2xl p-8 w-full max-w-lg relative animate-fadein-up mt-20 max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{ borderRadius: 24 }}
        onSubmit={e => { e.preventDefault(); handleAction(modalType === 'accept' ? 'claimed' : 'not_claimed'); }}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-green-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-extrabold text-green-800 mb-6 text-center">
          {modalType === 'accept' ? 'Accept Claim' : 'Reject Claim'}
        </h2>
        <div className="flex flex-col gap-4">
          <label className="font-semibold text-green-900">Reason<span className="text-red-500">*</span>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none resize-none"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              rows={2}
              maxLength={200}
              placeholder={modalType === 'accept' ? 'Why are you accepting this claim?' : 'Why are you rejecting this claim?'}
            />
          </label>
          <label className="font-semibold text-green-900">Notes (optional)
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none resize-none"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Additional notes for record (optional)"
            />
          </label>
        </div>
        <div className="flex flex-row gap-4 mt-8">
          <button
            type="button"
            className="w-1/2 bg-gray-200 hover:bg-gray-300 text-green-900 font-bold py-3 rounded-full shadow transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`w-1/2 ${modalType === 'accept' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-3 rounded-full shadow-lg transition disabled:opacity-60`}
            disabled={loading}
          >
            {loading ? 'Processing...' : modalType === 'accept' ? 'Accept' : 'Reject'}
          </button>
        </div>
      </form>
    </div>
  );
}
