export interface SocialPlatformConfig {
  key: string;
  label: string;
  placeholder: string;
  iconName: string;
  fieldKeys: string[];
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    key: "website",
    label: "वेबसाइट (Website)",
    placeholder: "https://yourwebsite.com",
    iconName: "globe",
    fieldKeys: ["website", "website_url"],
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    placeholder: "https://x.com/username",
    iconName: "twitter",
    fieldKeys: ["twitter", "twitter_url", "x"],
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/username",
    iconName: "instagram",
    fieldKeys: ["instagram", "instagram_url"],
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
    iconName: "linkedin",
    fieldKeys: ["linkedin", "linkedin_url"],
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@channel",
    iconName: "youtube",
    fieldKeys: ["youtube", "youtube_url"],
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/username",
    iconName: "facebook",
    fieldKeys: ["facebook", "facebook_url"],
  },
  {
    key: "telegram",
    label: "Telegram",
    placeholder: "https://t.me/username",
    iconName: "telegram",
    fieldKeys: ["telegram", "telegram_url"],
  },
  {
    key: "threads",
    label: "Threads",
    placeholder: "https://threads.net/@username",
    iconName: "threads",
    fieldKeys: ["threads", "threads_url"],
  },
];

/**
 * Normalizes and extracts all valid active social URLs for a user profile.
 * Merges both user.social_links JSONB object and legacy root properties.
 */
export function getProfileSocialLinks(user: any): Array<{
  key: string;
  label: string;
  url: string;
  iconName: string;
}> {
  if (!user) return [];

  const activeLinks: Array<{
    key: string;
    label: string;
    url: string;
    iconName: string;
  }> = [];

  SOCIAL_PLATFORMS.forEach((platform) => {
    let url: string | undefined = undefined;

    // 1. Check inside user.social_links object
    if (user.social_links && typeof user.social_links === "object") {
      for (const fk of platform.fieldKeys) {
        if (user.social_links[fk]) {
          url = user.social_links[fk];
          break;
        }
      }
    }

    // 2. Check root user properties if not found inside social_links
    if (!url) {
      for (const fk of platform.fieldKeys) {
        if (user[fk]) {
          url = user[fk];
          break;
        }
      }
    }

    if (url && typeof url === "string" && url.trim().length > 0) {
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      activeLinks.push({
        key: platform.key,
        label: platform.label,
        url: formattedUrl,
        iconName: platform.iconName,
      });
    }
  });

  return activeLinks;
}
