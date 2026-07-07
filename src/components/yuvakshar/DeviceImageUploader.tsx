"use client";

import React from "react";
import MediaUploader from "../media/MediaUploader";

interface DeviceImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  folder?: string;
  label?: string;
  aspectRatio?: string;
  className?: string;
}

export default function DeviceImageUploader({
  value,
  onChange,
  label = "छवि अपलोड करें (Upload Image)",
  aspectRatio = "aspect-video",
  className = "",
}: DeviceImageUploaderProps) {
  return (
    <MediaUploader
      value={value}
      onChange={(url) => onChange(url)}
      label={label}
      aspectRatio={aspectRatio}
      className={className}
      requireAltText={false} // don't break existing implementations that don't expect alt text
    />
  );
}
