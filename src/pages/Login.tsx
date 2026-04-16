import React from 'react';
import { Navigate } from 'react-router-dom';

// Login is now opened as a modal on the landing page.
const Login: React.FC = () => <Navigate to="/landing?auth=login" replace />;

export default Login;
