import React, { createContext, useContext, useState } from 'react';

type UserUpdateContextType = {
    refreshUser: () => void;
    userRefreshCount: number;
};

const UserUpdateContext = createContext<UserUpdateContextType>({
    refreshUser: () => { },
    userRefreshCount: 0,
});

export const useUserUpdate = () => useContext(UserUpdateContext);

export const UserUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userRefreshCount, setUserRefreshCount] = useState(0);

    const refreshUser = () => setUserRefreshCount((c) => c + 1);

    return (
        <UserUpdateContext.Provider value={{ refreshUser, userRefreshCount }}>
            {children}
        </UserUpdateContext.Provider>
    );
};