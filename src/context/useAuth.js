import {useContext} from "react";
import {AuthContext} from "./AuthContext";
/*
 * useAuth
 *
 * Custom hook som används av komponenter för att komma åt
 * autentiseringsdata och funktioner.
 *
 * Använder AuthContext internt och ska endast användas
 * inom AuthProvider.
 */

export const useAuth = () => useContext(AuthContext);
