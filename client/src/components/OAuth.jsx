import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const { signIn } = useSignIn();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
    >
      Continue with Google
    </button>
  );
}
