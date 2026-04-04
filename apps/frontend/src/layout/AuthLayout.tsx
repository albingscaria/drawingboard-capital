import React from 'react';

/**
 * Authentication layout component that provides a split-screen design with content on the left
 * and a background image on the right side.
 */
interface AuthLayoutProps {
  /** The content to display in the left panel of the authentication layout */
  children: React.ReactNode;
  /** URL of the image to display in the right panel */
  imageUrl: string;
}

export default function AuthLayout({ children, imageUrl }: AuthLayoutProps) {
  return (
    <div className="min-h-screen min-w-screen flex flex-row">
      <div className="w-1/2 bg-blue-12 flex relative text-white flex-col items-center justify-center">
        <img
          src={'https://ypslbjbumuxmfrcpeicl.supabase.co/storage/v1/object/public/brand-assets/Main%20Light.png'}
          alt={'DrawingBoard Logo'}
          className="h-16 aspect-auto absolute top-12 left-12"
          aria-hidden
        />
        {children}
      </div>
      <div className="w-1/2 flex items-center max-h-screen justify-center">
        <img
          src={imageUrl}
          aria-hidden
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
