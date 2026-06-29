import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const name = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const bio = `युवाक्षर पर ${name} की आधिकारिक प्रोफ़ाइल।`;
  const url = `https://yuvakshar.tech/profile/${slug}`;

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
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const url = `https://yuvakshar.tech/profile/${slug}`;
  const name = slug
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
