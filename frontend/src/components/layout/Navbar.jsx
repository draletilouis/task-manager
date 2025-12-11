import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextDefinition';
import Button from '../common/Button';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navbar on login/register pages
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link to="/workspaces" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">TaskManager</h1>
          </Link>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            {/* User email */}
            <div className="text-sm text-gray-600">
              {user?.email}
            </div>

            {/* Logout button */}
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
