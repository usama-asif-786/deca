import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

import Login from '@/components/Login';
import Signup from '@/components/Signup';
import { AppLayout } from '@/components/AppLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/hello" element={<AppLayout title={''} children={undefined} />} />

      {/* <Route element={<PrivateRoute />}> */}
        {/* <Route path="/" element={<Dashboard />} />

        <Route element={<RoleRoute allowedRoles={['admin', 'superuser']} />}>
          <Route path="/usermanagement" element={<UserManagement />} />
        </Route> */}
      {/* </Route> */}

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
