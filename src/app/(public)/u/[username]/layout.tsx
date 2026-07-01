import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  // Handle @username case if passed
  const cleanUsername = username.startsWith('%40') ? username.substring(3) : username;
  const name = cleanUsername
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const bio = `युवाक्षर पर ${name} की आधिकारिक प्रोफ़ाइल।`;
  const url = `https://yuvakshar.tech/u/${cleanUsername}`;

  return {
    title: `${name} - युवाक्षर (Yuvakshar)`,
    description: bio,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${name} - युवाक्षर`,
      description: bio,
      url: url,
      type: 'profile',
      siteName: 'Yuvakshar',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - युवाक्षर`,
      description: bio,
    },
  };
}

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  const cleanUsername = username.startsWith('%40') ? username.substring(3) : username;
  const url = `https://yuvakshar.tech/u/${cleanUsername}`;
  const name = cleanUsername
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: name,
    url: url,
    mainEntityOfPage: {
      '@type': 'ProfilePage',
      '@id': url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
