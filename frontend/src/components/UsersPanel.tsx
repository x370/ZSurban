import React, { useState, useEffect } from 'react';
import { fetchUsersAdmin, AdminUser } from '../api/users';
import { CircularProgress, Alert } from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import Button from './Button';
import Input from './Input';

export default function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsersAdmin();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user._id.toLowerCase().includes(query)
    );
  });

  const getRoleClass = (role: string) => {
    if (role === 'admin') {
      return 'bg-rose-50 text-red-650 border border-rose-100';
    }
    return 'bg-emerald-50 text-[#00b884] border border-emerald-100';
  };

  return (
    <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col gap-6 text-left">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-50 border border-zinc-150 rounded-2xl flex items-center justify-center text-zinc-800">
            <PeopleIcon fontSize="medium" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Registered Users</h2>
            <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
              {filteredUsers.length} total users registered
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="w-64">
            <Input
              id="user-search"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<SearchIcon fontSize="small" className="text-zinc-400" />}
              className="py-2 text-xs"
            />
          </div>
          
          <Button onClick={loadUsers} variant="outline" className="px-4 py-2 text-xs select-none">
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Grid/Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <CircularProgress size={32} sx={{ color: '#00b884' }} />
          </div>
        ) : error ? (
          <Alert severity="error" className="rounded-xl text-xs">{error}</Alert>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-zinc-450 font-semibold text-xs">
            No users found matching "{searchQuery}".
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 text-[10px] font-black text-zinc-400 uppercase tracking-wider select-none">
                <th className="pb-3.5 pr-2">User ID</th>
                <th className="pb-3.5 px-3">Name</th>
                <th className="pb-3.5 px-3">Email Address</th>
                <th className="pb-3.5 px-3 text-center">Role</th>
                <th className="pb-3.5 pl-2 text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-xs font-semibold text-zinc-800">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-50/30 transition-colors">
                  <td className="py-4 pr-2 font-mono text-zinc-400 font-bold">
                    #{user._id.substring(user._id.length - 6).toUpperCase()}
                  </td>
                  <td className="py-4 px-3 text-zinc-900 font-extrabold">{user.name}</td>
                  <td className="py-4 px-3 text-zinc-500 font-bold">{user.email}</td>
                  <td className="py-4 px-3 text-center">
                    <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full select-none ${getRoleClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 pl-2 text-right text-zinc-450 font-bold">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
