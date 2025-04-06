import { useState } from 'react';
import { useRouter } from 'next/router';
import Footer from '@/components/Footer';
import { FloatingNav } from '@/components/ui/FloatingNavbar';

const mockCredentials = {
  'admin@example.com': { password: 'admin123', role: 'admin' },
  'user@example.com': { password: 'user123', role: 'user' },
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    const user = mockCredentials[email];
    if (user && user.password === password) {
      localStorage.setItem('user', JSON.stringify({ email, role: user.role }));
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={[]} />
      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;