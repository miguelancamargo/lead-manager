import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import LeadsView from './components/LeadsView';
import DashboardHome from './components/DashboardHome';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const Dashboard = () => {
    const { user } = useAuth();
    if (user?.role === 'sales') return <Navigate to="/leads" />;

    return (
        <DashboardLayout>
            <DashboardHome />
        </DashboardLayout>
    );
}

const Leads = () => {
    return (
        <DashboardLayout>
            <LeadsView />
        </DashboardLayout>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/leads" element={
                        <PrivateRoute>
                            <Leads />
                        </PrivateRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
