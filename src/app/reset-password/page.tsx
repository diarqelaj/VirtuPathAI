import dynamicImport from "next/dynamic"; // ✅ rename the import

export const dynamic = "force-dynamic"; // ✅ safe to use this now

const ResetPasswordPage = dynamicImport(() => import("./ResetPasswordPage"), {
  ssr: false,
});

export default function Page() {
  return <ResetPasswordPage />;
}
