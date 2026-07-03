import React from 'react';
import { Delete as DeleteIcon } from '@mui/icons-material';
import Button from './Button';

interface DeleteConfirmModalProps {
  open: boolean;
  saving: boolean;
  productTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ open, saving, productTitle, onClose, onConfirm }: DeleteConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col gap-5 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <DeleteIcon sx={{ fontSize: 24, color: '#ef4444' }} />
        </div>
        <div>
          <h2 className="text-base font-black text-zinc-900 tracking-tight">Delete Product?</h2>
          <p className="text-xs text-zinc-500 font-medium mt-1.5">
            Are you sure you want to permanently delete <strong className="text-zinc-800">"{productTitle}"</strong>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={saving}
            fullWidth
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
