import React, { createContext, useContext, useState } from "react";

type ProfilePreviewContextType = {
    show: boolean;
    open: () => void;
    close: () => void;
};

const ProfilePreviewContext = createContext<ProfilePreviewContextType>({
    show: false,
    open: () => { },
    close: () => { },
});

export const useProfilePreview = () => useContext(ProfilePreviewContext);

export const ProfilePreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [show, setShow] = useState(false);
    const open = () => setShow(true);
    const close = () => setShow(false);

    return (
        <ProfilePreviewContext.Provider value={{ show, open, close }}>
            {children}
        </ProfilePreviewContext.Provider>
    );
};