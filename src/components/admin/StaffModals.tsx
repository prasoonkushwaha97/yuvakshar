"use client";

import React, { useState } from 'react';
import { createStaff, resetStaffPassword } from '@/lib/actions/userManagementActions';
import { toast } from 'sonner';

export function CreateStaffModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setLoading(true);
    const res = await createStaff(email, name, password);
    setLoading(false);
    if (res.success) {
      toast.success('Staff created successfully');
      onClose();
    } else {
      toast.error(res.error || 'Failed to create staff');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Create Staff</h2>
        <input className="w-full p-2 border rounded mb-2 dark:bg-slate-800" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full p-2 border rounded mb-2 dark:bg-slate-800" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full p-2 border rounded mb-4 dark:bg-slate-800" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleCreate} disabled={loading}>Create</button>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordModal({ userId, isOpen, onClose }: { userId: string, isOpen: boolean, onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setLoading(true);
    const res = await resetStaffPassword(userId, password);
    setLoading(false);
    if (res.success) {
      toast.success('Password reset successfully');
      onClose();
    } else {
      toast.error(res.error || 'Failed to reset password');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Reset Staff Password</h2>
        <input className="w-full p-2 border rounded mb-4 dark:bg-slate-800" placeholder="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleReset} disabled={loading}>Reset</button>
        </div>
      </div>
    </div>
  );
}
