'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, hydrate, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (user?.role === 'admin') router.replace('/admin'); }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { identifier, password });
      if (data.user.role !== 'admin') {
        toast.error('This account is not an admin');
        setLoading(false);
        return;
      }
      setAuth(data.token, data.user);
      toast.success('Welcome back!');
      router.replace('/admin');
    } catch (err) {
      toast.error(apiError(err, 'Login failed'));
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand-800 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center text-white">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white text-xl font-bold text-brand-700">G</span>
          <h1 className="mt-3 text-2xl font-bold">GadgetGhor Admin</h1>
          <p className="text-sm text-brand-100">Sign in to manage your store</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">Email or username</label>
            <input type="text" className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="rahatcse5bu" autoComplete="username" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="animate-spin" /> : <><Lock size={16} /> Sign in</>}
          </button>
        </form>
      </div>
    </div>
  );
}
