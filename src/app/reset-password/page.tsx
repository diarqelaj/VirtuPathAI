import { Suspense } from "react";
import ResetPasswordPage from "./ResetPasswordPage";

export const dynamic = "force-dynamic"; // ✅ disables static export

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
