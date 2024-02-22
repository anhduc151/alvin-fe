import { useAuth } from 'api/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { AuthLogin } from '@chainlit/react-components';

// import { Logo } from 'components/atoms/logo';

import logo from '../assets/logo.png';

import { useQuery } from 'hooks/query';

import { apiClientState } from 'state/apiClient';

export default function Login() {
  const query = useQuery();
  const { data: config, setAccessToken, user } = useAuth();
  const [error, setError] = useState('');
  const apiClient = useRecoilValue(apiClientState);

  const navigate = useNavigate();

  const handleHeaderAuth = async () => {
    try {
      const json = await apiClient.headerAuth();
      setAccessToken(json.access_token);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePasswordLogin = async (
    email: string,
    password: string,
    callbackUrl: string
  ) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const json = await apiClient.passwordAuth(formData);
      setAccessToken(json.access_token);
      navigate(callbackUrl);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    setError(query.get('error') || '');
    document.title = 'Login - Alvin AI';
  }, [query]);

  useEffect(() => {
    if (!config) {
      return;
    }
    if (!config.requireLogin) {
      navigate('/message');
    }
    if (config.headerAuth) {
      handleHeaderAuth();
    }
    if (user) {
      navigate('/message');
    }
  }, [config, user]);

  return (
    <div className="login">
      <div className="login_name">
        <img src={logo} alt="" className="login_name_logo" />
        <p className="login_name_title">Alvin AI</p>
      </div>

      <AuthLogin
        title="Login"
        error={error}
        callbackUrl="/message"
        providers={config?.oauthProviders || []}
        onPasswordSignIn={
          config?.passwordAuth ? handlePasswordLogin : undefined
        }
        onOAuthSignIn={async (provider: string) => {
          window.location.href = apiClient.getOAuthEndpoint(provider);
        }}
        // renderLogo={<Logo style={{ maxWidth: '60%', maxHeight: '90px' }} />}
      />
    </div>
  );
}
