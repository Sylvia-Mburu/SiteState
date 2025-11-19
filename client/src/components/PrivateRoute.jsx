import { useAuth } from '@clerk/clerk-react';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  return isSignedIn ? <Outlet /> : <Navigate to='/sign-in' />;
}
