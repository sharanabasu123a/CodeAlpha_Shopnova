import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/authStore';
import { apiErrorMessage } from '../lib/api';

export default function LoginPage() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const navigate = useNavigate();
  const login = useAuth((s) => s.login);
  const user = useAuth((s) => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate(redirect, { replace: true });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in both fields.');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass w-full max-w-md rounded-3xl p-8"
      >
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-subtitle hover:text-white">
          <FiArrowLeft /> Back
        </button>
        <h1 className="font-display text-3xl font-bold">Welcome <span className="text-aurora">back</span></h1>
        <p className="mt-2 text-sm text-subtitle">Log in to continue your Shop Nova experience.</p>

        {error && (
          <div className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="label-glass">Email</label>
            <div className="input-glass flex items-center gap-2">
              <FiMail className="text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="label-glass">Password</label>
            <div className="input-glass flex items-center gap-2">
              <FiLock className="text-slate-500" />
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none"
                required
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="text-slate-400 hover:text-white" aria-label="Toggle password">
                {show ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full rounded-xl py-3.5 font-semibold text-white disabled:opacity-50">
            {submitting ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-subtitle">
          Don't have an account?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-aurora hover:underline">Create one</Link>
        </p>
        <div className="mt-5 rounded-xl bg-white/5 p-3 text-center text-xs text-subtitle">
          Demo admin: <code className="text-primary">admin@shopnova.com</code> / <code className="text-secondary">Admin@123</code>
          <br />
          Demo user: <code className="text-primary">ravi@mail.com</code> / <code className="text-secondary">Ravi@1234</code>
        </div>
      </motion.div>
    </div>
  );
}