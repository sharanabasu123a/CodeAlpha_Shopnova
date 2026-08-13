import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/authStore';
import { apiErrorMessage } from '../lib/api';

export default function RegisterPage() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const user = useAuth((s) => s.user);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate(redirect, { replace: true });
    return null;
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!/^[0-9+\-\s]{10,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate(redirect, { replace: true });
    } catch (err) {
      setErrors({ form: apiErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const input = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>, icon: React.ReactNode) => (
    <div>
      <label className="label-glass">{label}</label>
      <div className="input-glass flex items-center gap-2">
        {icon}
        <input {...props} value={form[k]} onChange={set(k)} className="w-full bg-transparent outline-none" />
      </div>
      {errors[k] && <p className="mt-1 text-xs text-red-300">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <h1 className="font-display text-3xl font-bold">Create <span className="text-aurora">account</span></h1>
        <p className="mt-2 text-sm text-subtitle">Join Shop Nova in under a minute.</p>

        {errors.form && (
          <div className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200">{errors.form}</div>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          {input('name', 'Full Name', { placeholder: 'Ravi Kumar', required: true }, <FiUser className="text-slate-500" />)}
          {input('email', 'Email', { type: 'email', placeholder: 'you@email.com', required: true }, <FiMail className="text-slate-500" />)}
          {input('phone', 'Phone', { type: 'tel', placeholder: '9876543210', required: true }, <FiPhone className="text-slate-500" />)}

          <div>
            <label className="label-glass">Password</label>
            <div className="input-glass flex items-center gap-2">
              <FiLock className="text-slate-500" />
              <input
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Min 8 characters"
                className="w-full bg-transparent outline-none"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="text-slate-400 hover:text-white" aria-label="Toggle password">
                {show ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password}</p>}
          </div>

          {input('confirm', 'Confirm Password', { type: show ? 'text' : 'password', placeholder: 'Re-enter password' }, <FiLock className="text-slate-500" />)}

          <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full rounded-xl py-3.5 font-semibold text-white disabled:opacity-50">
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-subtitle">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-aurora hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}