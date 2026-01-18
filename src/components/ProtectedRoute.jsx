import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../context/useAuth";
/*
 * ProtectedRoute
 *
 * Skyddar routes som kräver inloggning.
 * Kontrollerar om användaren har en giltig token.
 *
 * - Om inte inloggad: omdirigerar till login-sidan
 * - Om inloggad: renderar den nästlade routen via <Outlet />
 */

const ProtectedRoute = () => {
    const {token} = useAuth();

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    return <Outlet/>;
};

export default ProtectedRoute;
