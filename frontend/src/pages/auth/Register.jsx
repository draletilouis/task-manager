import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextDefinition';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // Handle registration and manage loading state
  const handleRegister = async (email, password, name) => {
    setIsLoading(true);
    try {
      await register(email, password, name);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Register;