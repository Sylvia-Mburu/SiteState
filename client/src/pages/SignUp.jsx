import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
  return (
    <div className='p-3 max-w-lg mx-auto flex flex-col items-center'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <SignUp 
        routing="path" 
        path="/sign-up"
        signInUrl="/sign-in"
      />
      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
    </div>
  );
}
