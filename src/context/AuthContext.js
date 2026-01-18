import {createContext} from "react";
/*
 * AuthContext
 *
 * Skapar ett React Context som används för att dela
 * autentiseringsdata (t.ex. token och userId) mellan komponenter.
 *
 * Innehåller ingen logik – endast själva context-objektet.
 */
export const AuthContext = createContext(null);
