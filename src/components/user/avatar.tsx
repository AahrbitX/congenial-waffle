"use client";

import React from "react";
import { Avatar } from "@heroui/react";

interface AvatarProps {
  username: string;
  size?: "sm" | "md" | "lg";
  color?: "success" | "default" | "danger" | "accent" | "warning" | undefined;
  variant?: "default" | "soft" | undefined;
  className?: string;
}

const getInitials = (username: string): string => {
  const cleaned = username.trim();

  if (!cleaned) return "NA";

  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}A`.toUpperCase();
};

const UserAvatar: React.FC<AvatarProps> = ({
  username,
  size = "md",
  color = "accent",
  variant = "soft",
  className,
}) => {
  return (
    <Avatar size={size} color={color} variant={variant} className={className}>
      <Avatar.Fallback>{getInitials(username)}</Avatar.Fallback>
    </Avatar>
  );
};

export default UserAvatar;
