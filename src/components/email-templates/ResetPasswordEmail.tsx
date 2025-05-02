import * as React from "react";
import { Html } from "@react-email/html";

interface Props {
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<Props> = ({ resetLink }) => {
  return (
    <Html lang="en">
      <div>
        <h1>Reset your password</h1>
        <p>
          Click the link below to reset your password. This link expires in 15 minutes.
        </p>
        <a href={resetLink}>Reset Password</a>
      </div>
    </Html>
  );
};
