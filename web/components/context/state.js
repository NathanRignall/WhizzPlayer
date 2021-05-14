import { createContext, useContext } from "react";

export const AppContext = createContext();

export function AppWrapper(props) {
    return (
        <AppContext.Provider value={props.data}>
            {props.children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
