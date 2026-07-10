import React from "react";
import Link from "next/link";
import { Profile } from "@/store/types";

export interface AuthorLinkProps {
  author: Partial<Profile> | null | undefined;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function AuthorLink({ author, children, className = "", onClick }: AuthorLinkProps) {
  // Extract username from standard locations
  const username = author?.username || author?.slug || author?.id || (author as any)?.author_username;

  // Fallback to "#" if missing or invalid, as requested
  const isValidUsername = username && typeof username === "string" && username.trim().length >= 3 && username !== "unknown" && username !== "null" && username !== "undefined";
  
  const href = isValidUsername ? `/u/${username.trim().toLowerCase()}` : "#";

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
