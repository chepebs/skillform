import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

// Register is now opened as a modal on the landing page.
const Register: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  return <Navigate to={`/landing?auth=register${token ? `&token=${token}` : ''}`} replace />;
};

export default Register;
