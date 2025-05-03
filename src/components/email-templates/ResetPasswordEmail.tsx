import * as React from "react";
import { Html, Head, Preview } from "@react-email/components";

interface Props {
  resetLink: string;
}

export const ResetPasswordEmail: React.FC<Props> = ({ resetLink }) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your VirtuPath AI password</Preview>

      <body style={{ backgroundColor: "#0a0a1f", margin: 0, padding: 0 }}>
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: "#0a0a1f", padding: "24px 0" }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  backgroundColor: "#0a0a1f",
                  borderRadius: "12px",
                  padding: "40px 32px",
                  color: "#ffffff",
                  fontFamily: "'Segoe UI', sans-serif",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                }}
              >
                {/* Logo + Title */}
                <tr>
                  <td align="center" style={{ paddingBottom: "24px" }}>
                    <img
                      src="https://i.imgur.com/L5e08yk.png"
                      alt="VirtuPath Logo"
                      width="40"
                      height="40"
                      style={{ borderRadius: "8px" }}
                    />
                    <h2
                      style={{
                        margin: "8px 0 0",
                        color: "#a78bfa",
                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      VirtuPath AI
                    </h2>
                  </td>
                </tr>

                {/* Header */}
                <tr>
                  <td
                    style={{
                      color: "#a78bfa",
                      fontSize: "22px",
                      fontWeight: "bold",
                      paddingBottom: "12px",
                      textAlign: "center",
                    }}
                  >
                    Reset your password
                  </td>
                </tr>

                {/* Message */}
                <tr>
                  <td
                    style={{
                      color: "#d1d5db",
                      fontSize: "14px",
                      paddingBottom: "24px",
                      textAlign: "center",
                    }}
                  >
                    We received a request to reset your password. Click the button below to choose a new one. This link
                    will expire in <strong>15 minutes</strong>.
                  </td>
                </tr>

                {/* Button */}
                <tr>
                  <td align="center" style={{ paddingBottom: "24px" }}>
                    <a
                      href={resetLink}
                      style={{
                        backgroundColor: "#7c3aed",
                        color: "#ffffff",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>

                {/* Footer Note */}
                <tr>
                  <td
                    style={{
                      color: "#6b7280",
                      fontSize: "12px",
                      textAlign: "center",
                      paddingBottom: "20px",
                    }}
                  >
                    If you didn’t request this, you can safely ignore this email.
                  </td>
                </tr>

                {/* Footer Line */}
                <tr>
                  <td
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      paddingTop: "20px",
                      fontSize: "12px",
                      color: "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    © {new Date().getFullYear()} VirtuPath AI • Empowering your future.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </Html>
  );
};
