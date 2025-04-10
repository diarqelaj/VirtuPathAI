"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import { FloatingNav } from '@/components/ui/FloatingNavbar';
import { navItems } from '@/data';
import { CreditCardIcon, CalendarIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { Spotlight } from '@/components/ui/Spotlight';

const PaymentPage = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handlePayment = async () => {
    setError('');
    const validCards = ['4111 1111 1111 1111', '4242 4242 4242 4242'];
  
    if (!validCards.includes(cardNumber.trim())) {
      setError('Invalid card number. Try a test card like 4111 1111 1111 1111');
      return;
    }
  
    // Assume you stored the selected course in localStorage during the course selection step
    const pending = JSON.parse(localStorage.getItem('pendingEnrollment') || '{}');
    const { careerPathID, userID } = pending;
  
    try {
      await fetch('/api/UserSubscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID,
          careerPathID,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // example: 30-day access
          lastAccessedDay: 0,
        }),
      });
  
      localStorage.removeItem('pendingEnrollment');
      setSuccess(true);
  
      setTimeout(() => {
        router.push('/tasks');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while processing your subscription.');
    }
  };

  return (
    <div className="relative bg-black-100 text-white flex flex-col min-h-screen">
      <FloatingNav navItems={navItems} />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <main className="flex-1 pt-45 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {success && (
            <div className="mb-8 p-4 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg text-center text-sm font-medium">
              🎉 Thank you for your purchase! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 text-red-300 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Payment Details
              </h1>
              <p className="mt-2 text-gray-400">Secure payment processing</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div className="space-y-6">
                <div className="group relative">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative">
                    <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="group relative">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="group relative">
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400" />
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Cardholder Name"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 rounded-lg border border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-6 bg-[#0c0c16] rounded-xl border border-gray-800/50 space-y-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Web Development Course</span>
                    <span className="font-medium">€49.00</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400">-€10.00</span>
                  </div>

                  <div className="pt-4 border-t border-gray-800/50">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-500">€59.00</span>
                        <span className="text-xl font-bold text-purple-400">€49.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Complete Payment
                </button>

                <p className="text-center text-sm text-gray-400">
                  Secure SSL encryption 🔒
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentPage;
