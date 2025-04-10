"use client";

import { useState } from 'react';
import Footer from '@/components/Footer';
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, LockClosedIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Spotlight } from '@/components/ui/Spotlight';
import { navItems } from "@/data";
import api from '@/lib/api';

type Credentials = {
  [email: string]: { password: string; role: string };
};



const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    const pending = localStorage.getItem('pendingEnrollment');
  
    if (isLogin) {
      try {
        const response = await api.get('/Users');
        const users = response.data;
  
        const foundUser = users.find(
          (user: any) => user.email === email && user.passwordHash === password
        );
  
        if (foundUser) {
          localStorage.setItem('user', JSON.stringify(foundUser));
          localStorage.setItem('userID', foundUser.userID.toString()); // ✅ FIXED: store userID
  
          if (pending) {
            localStorage.removeItem('pendingEnrollment');
            router.push('/payment');
          } else {
            router.push('/');
          }
        } else {
          setError('Invalid email or password');
        }
      } catch (err) {
        setError('Failed to fetch users');
      }
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
  
      try {
        const newUser = {
          fullName: name,
          email,
          passwordHash: password, // In production, hash this!
          registrationDate: new Date().toISOString(),
        };
  
        const response = await api.post('/Users', newUser);
  
        const registeredUser = response.data;
        localStorage.setItem('user', JSON.stringify(registeredUser));
        localStorage.setItem('userID', registeredUser.userID.toString()); // ✅ FIXED: store userID
  
        if (pending) {
          localStorage.removeItem('pendingEnrollment');
          router.push('/payment');
        } else {
          router.push('/');
        }
      } catch (err) {
        setError('Registration failed. Email might already exist.');
      }
    }
  };
  
  
  
  

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
      
      <main className="flex-1 pt-50 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="mt-2 text-gray-400">
                {isLogin ? 'Please sign in to continue' : 'Start your learning journey'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                {!isLogin && (
                  <div className="group relative">
                    <UserCircleIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                  </div>
                )}

                <div className="group relative">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>

                <div className="group relative">
                  <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>

                {!isLogin && (
                  <div className="group relative">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-800"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-800"></div>
              </div>

              <p className="text-center text-gray-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {isLogin ? 'Create account' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;