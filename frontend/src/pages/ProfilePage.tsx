import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/authStore';
import { apiErrorMessage } from '../lib/api';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  if (!user) return null;

  const save = async () => {
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      await updateProfile({ name, phone, password: password || undefined });
      setPassword('');
      setMsg('Profile updated successfully.');
    } catch (e) {
      setErr(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-subtitle">{user.email} · {user.role}</p>
          </div>
        </div>

        {msg && <div className="mb-4 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-green-200">{msg}</div>}
        {err && <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200">{err}</div>}

        <div className="flex flex-col gap-4">
          <div>
            <label className="label-glass"><FiUser className="mr-1 inline" /> Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-glass" />
          </div>
          <div>
            <label className="label-glass"><FiMail className="mr-1 inline" /> Email (cannot change)</label>
            <input value={user.email} disabled className="input-glass opacity-50" />
          </div>
          <div>
            <label className="label-glass"><FiPhone className="mr-1 inline" /> Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-glass" />
          </div>
          <div>
            <label className="label-glass"><FiLock className="mr-1 inline" /> New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="input-glass"
            />
          </div>

          <button onClick={save} disabled={saving} className="btn-primary rounded-xl py-3.5 font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}