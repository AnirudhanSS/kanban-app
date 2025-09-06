import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #333;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const Success = styled.div`
  color: #27ae60;
  margin-bottom: 1rem;
  padding: 15px;
  background: #d5f4e6;
  border-radius: 5px;
  border: 1px solid #27ae60;
`;

const Error = styled.div`
  color: #e74c3c;
  margin-bottom: 1rem;
  padding: 15px;
  background: #fdf2f2;
  border-radius: 5px;
  border: 1px solid #e74c3c;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    background: #5a6fd8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  margin-top: 1rem;

  &:hover {
    color: #5a6fd8;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid or missing verification token');
      setIsVerifying(false);
    } else {
      setToken(tokenParam);
      // Auto-verify if token is present
      handleVerify(tokenParam);
    }
  }, [searchParams]);

  const handleVerify = async (verifyToken?: string) => {
    const tokenToUse = verifyToken || token;
    if (!tokenToUse) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.verifyEmail(tokenToUse);
      setMessage('Email verified successfully! You can now login to your account.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify email');
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authService.resendVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Container>
        <Card>
          <Title>Verifying Email...</Title>
          <Subtitle>
            <LoadingSpinner />
            Please wait while we verify your email address.
          </Subtitle>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>Email Verification</Title>
        <Subtitle>
          {error ? 'There was a problem verifying your email.' : 'Your email has been verified!'}
        </Subtitle>
        
        {message && <Success>{message}</Success>}
        {error && <Error>{error}</Error>}
        
        {!error && (
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        )}
        
        {error && (
          <>
            <Button onClick={() => handleVerify()} disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Try Again'}
            </Button>
            <LinkButton onClick={handleResendVerification} disabled={isLoading}>
              Resend Verification Email
            </LinkButton>
          </>
        )}
      </Card>
    </Container>
  );
};

export default VerifyEmail;
