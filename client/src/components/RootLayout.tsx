import React from 'react';

export interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <div className="root-layout max-w-screen-xl mx-auto p-4 text-center">
      {children}
    </div>
  );
};

export default RootLayout;
