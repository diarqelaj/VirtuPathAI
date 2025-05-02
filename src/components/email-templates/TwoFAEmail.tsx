export const TwoFAEmail = ({ code }: { code: string }) => (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', padding: '20px' }}>
      <p>Hello 👋,</p>
      <p>Your 2FA verification code is:</p>
      <h2 style={{ fontSize: '32px', color: '#5e17eb' }}>{code}</h2>
      <p>This code expires in 5 minutes.</p>
      <p style={{ marginTop: '30px', color: '#999' }}>VirtuPath AI Security System</p>
    </div>
  );
  