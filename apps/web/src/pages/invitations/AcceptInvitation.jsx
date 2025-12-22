import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import api from '../../api/client';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch invitation details
  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const response = await api.get(`/invitations/${token}`);
        setInvitation(response.data.invitation);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load invitation');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post(`/invitations/${token}/accept`);
      setSuccess(true);

      // Redirect to workspace after 2 seconds
      setTimeout(() => {
        navigate(`/workspaces/${response.data.workspace.id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept invitation');
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    setError('');

    try {
      await api.post(`/invitations/${token}/decline`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to decline invitation');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Loading invitation..." subtitle="">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        title="Welcome aboard!"
        subtitle="You've successfully joined the workspace"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-gray-700 mb-4">
            You've been added to <strong>{invitation?.workspace.name}</strong> as a{' '}
            {invitation?.role.toLowerCase()}.
          </p>
          <p className="text-sm text-gray-600">
            Redirecting to workspace...
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (error && !invitation) {
    return (
      <AuthLayout title="Invalid Invitation" subtitle={error}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <p className="text-gray-700 mb-6">
            This invitation link may be invalid, expired, or already used.
          </p>
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Workspace Invitation"
      subtitle={`${invitation?.inviter.name || invitation?.inviter.email} invited you to join`}
    >
      <div className="space-y-6">
        {/* Workspace Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {invitation?.workspace.name}
          </h3>
          {invitation?.workspace.description && (
            <p className="text-gray-600 text-sm mb-3">
              {invitation.workspace.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Role:</span>
            <span className="font-semibold text-gray-900">
              {invitation?.role}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Invitation
              </>
            )}
          </button>

          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-full text-sm border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          By accepting, you'll be able to view and collaborate on projects in this workspace.
        </p>
      </div>
    </AuthLayout>
  );
};

export default AcceptInvitation;
