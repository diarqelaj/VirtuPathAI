"use client";

export default function NotificationsSettings() {
  return (
    <div className="space-y-8 max-w-3xl">
      <h2 className="text-2xl font-bold">Notification Preferences</h2>

      <div className="space-y-4">
        <CheckboxSetting label="Email me when there are product updates" />
        <CheckboxSetting label="Send me career tips and resources" />
        <CheckboxSetting label="Notify me when a new career path launches" />
        <CheckboxSetting label="Notify me of discounts and promotions" />
      </div>
    </div>
  );
}

function CheckboxSetting({ label }: { label: string }) {
  return (
    <label className="flex items-start space-x-3">
      <input
        type="checkbox"
        defaultChecked
        className="mt-1 h-4 w-4 rounded bg-black border-white/20 text-purple-500 focus:ring-purple-500"
      />
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}
