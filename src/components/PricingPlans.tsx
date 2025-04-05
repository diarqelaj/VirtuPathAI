const PricingPlans = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
          Subscription Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Example pricing tiers */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Basic</h3>
            <p className="mb-4">$10/month</p>
            <ul className="mb-4">
              <li>Access to daily tasks</li>
              <li>Basic progress tracking</li>
            </ul>
            <button className="w-full py-2 bg-blue-500 text-white rounded-lg">
              Choose Basic
            </button>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="mb-4">$30/month</p>
            <ul className="mb-4">
              <li>All Basic features</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <button className="w-full py-2 bg-blue-500 text-white rounded-lg">
              Choose Pro
            </button>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <p className="mb-4">Custom Pricing</p>
            <ul className="mb-4">
              <li>All Pro features</li>
              <li>Custom AI solutions</li>
              <li>Dedicated support</li>
            </ul>
            <button className="w-full py-2 bg-blue-500 text-white rounded-lg">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
