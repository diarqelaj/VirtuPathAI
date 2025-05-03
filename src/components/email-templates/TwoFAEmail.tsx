import * as React from "react";
import { Html, Head, Preview, Body } from "@react-email/components";

interface Props {
  code: string;
}

export const TwoFAEmail: React.FC<Props> = ({ code }) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your 2FA verification code for VirtuPath AI</Preview>

      <Body style={{ backgroundColor: "#0a0a1f", margin: 0, padding: 0 }}>
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
                    Your 2FA Verification Code
                  </td>
                </tr>

                {/* Code */}
                <tr>
                  <td
                    style={{
                      color: "#ffffff",
                      fontSize: "32px",
                      fontWeight: "bold",
                      textAlign: "center",
                      letterSpacing: "4px",
                      padding: "20px 0",
                    }}
                  >
                    {code}
                  </td>
                </tr>

                {/* Message */}
                <tr>
                  <td
                    style={{
                      color: "#d1d5db",
                      fontSize: "14px",
                      textAlign: "center",
                      paddingBottom: "24px",
                    }}
                  >
                    This code will expire in <strong>5 minutes</strong>. If you didn’t request this, you can ignore this email.
                  </td>
                </tr>

                {/* Footer */}
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
                    © {new Date().getFullYear()} VirtuPath AI • Securing your future.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
};
