import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

export default function SignInPage() {
  return (
    <div className='p-3 max-w-lg mx-auto flex flex-col items-center'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
      <SignIn 
        routing="path" 
        path="/sign-in"
        signUpUrl="/sign-up"
      />
      <div className='flex gap-2 mt-5'>
        <p>Don't have an account?</p>
        <Link to="/sign-up">
          <span className='text-blue-700'>Sign up</span>
        </Link>
      </div>
    </div>
  );
}
