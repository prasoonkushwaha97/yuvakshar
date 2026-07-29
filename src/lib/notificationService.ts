/**
 * notificationService.ts
 * ─────────────────────────────────────────────────────────────────
 * Central typed notification emitter for Yuvakshar CMS.
 * Each function corresponds to a specific CMS event and calls
 * createSystemNotification() with pre-filled Hindi titles,
 * correct category/type/priority, and action deep-links.
 *
 * Usage in server actions:
 *   import { notifyArticlePublished } from "@/lib/notificationService";
 *   await notifyArticlePublished(id, title);
 * ─────────────────────────────────────────────────────────────────
 */

import { createSystemNotification } from "@/lib/actions/notificationActions";

// ─── ARTICLES ──────────────────────────────────────────────────────────────────

export async function notifyArticleSubmitted(articleId: string, title: string, authorName?: string) {
  return createSystemNotification({
    title: "नया लेख सबमिट हुआ",
    description: `"${title}"${authorName ? ` — ${authorName} द्वारा` : ""} समीक्षा हेतु सबमिट किया गया है।`,
    type: "info",
    category: "articles",
    priority: "medium",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticleSentForReview(articleId: string, title: string) {
  return createSystemNotification({
    title: "लेख समीक्षा हेतु भेजा गया",
    description: `"${title}" को समीक्षा के लिए भेज दिया गया है।`,
    type: "info",
    category: "articles",
    priority: "medium",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticlePublished(articleId: string, title: string) {
  return createSystemNotification({
    title: "लेख प्रकाशित हुआ",
    description: `"${title}" सफलतापूर्वक प्रकाशित किया गया है।`,
    type: "success",
    category: "articles",
    priority: "high",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticleUnpublished(articleId: string, title: string) {
  return createSystemNotification({
    title: "लेख अप्रकाशित किया गया",
    description: `"${title}" को वापस लिया गया और अप्रकाशित किया गया है।`,
    type: "warning",
    category: "articles",
    priority: "medium",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticleUpdated(articleId: string, title: string) {
  return createSystemNotification({
    title: "लेख अपडेट किया गया",
    description: `"${title}" में बदलाव किए गए हैं।`,
    type: "info",
    category: "articles",
    priority: "low",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticleRejected(articleId: string, title: string) {
  return createSystemNotification({
    title: "लेख अस्वीकृत किया गया",
    description: `"${title}" को समीक्षा के बाद अस्वीकृत कर दिया गया है।`,
    type: "error",
    category: "articles",
    priority: "high",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyRevisionRequested(articleId: string, title: string) {
  return createSystemNotification({
    title: "संशोधन अनुरोध",
    description: `"${title}" में संशोधन आवश्यक है। कृपया लेख की जाँच करें।`,
    type: "warning",
    category: "articles",
    priority: "high",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticleArchived(articleId: string, title: string) {
  return createSystemNotification({
    title: "लेख संग्रहीत किया गया",
    description: `"${title}" को संग्रह में भेज दिया गया है।`,
    type: "info",
    category: "articles",
    priority: "low",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

export async function notifyArticleFeatured(articleId: string, title: string) {
  return createSystemNotification({
    title: "विशेष लेख चयनित",
    description: `"${title}" को विशेष लेख के रूप में चुना गया है।`,
    type: "success",
    category: "articles",
    priority: "medium",
    entity_type: "article",
    entity_id: articleId,
    action_url: `/admin/articles/editor?id=${articleId}`,
    target_role: "all",
  });
}

// ─── MAGAZINE ──────────────────────────────────────────────────────────────────

export async function notifyMagazineCreated(issueId: string, title: string) {
  return createSystemNotification({
    title: "नई पत्रिका बनाई गई",
    description: `पत्रिका अंक "${title}" बनाया गया है।`,
    type: "info",
    category: "magazine",
    priority: "medium",
    entity_type: "magazine",
    entity_id: issueId,
    action_url: `/admin/magazine`,
    target_role: "all",
  });
}

export async function notifyMagazinePublished(issueId: string, title: string) {
  return createSystemNotification({
    title: "पत्रिका अंक प्रकाशित हुआ",
    description: `पत्रिका अंक "${title}" प्रकाशित किया गया है।`,
    type: "success",
    category: "magazine",
    priority: "high",
    entity_type: "magazine",
    entity_id: issueId,
    action_url: `/admin/magazine`,
    target_role: "all",
  });
}

export async function notifyMagazineArchived(issueId: string, title: string) {
  return createSystemNotification({
    title: "पत्रिका अंक संग्रहीत",
    description: `पत्रिका अंक "${title}" को संग्रह में भेजा गया है।`,
    type: "info",
    category: "magazine",
    priority: "low",
    entity_type: "magazine",
    entity_id: issueId,
    action_url: `/admin/magazine`,
    target_role: "all",
  });
}

// ─── CHAUPAL (COMMUNITY) ──────────────────────────────────────────────────────

export async function notifyChaupalReport(postId: string, reportReason?: string) {
  return createSystemNotification({
    title: "नई चौपाल रिपोर्ट प्राप्त हुई",
    description: `एक पोस्ट के विरुद्ध शिकायत दर्ज की गई है${reportReason ? `: "${reportReason}"` : "।"}`,
    type: "warning",
    category: "community",
    priority: "high",
    entity_type: "post",
    entity_id: postId,
    action_url: `/admin/community`,
    target_role: "all",
  });
}

export async function notifyChaupalReportResolved(postId: string) {
  return createSystemNotification({
    title: "चौपाल रिपोर्ट सुलझाई गई",
    description: "शिकायत की समीक्षा की गई और उचित कार्यवाही की गई है।",
    type: "success",
    category: "community",
    priority: "medium",
    entity_type: "post",
    entity_id: postId,
    action_url: `/admin/community`,
    target_role: "all",
  });
}

export async function notifyChaupalPostRemoved(postId: string) {
  return createSystemNotification({
    title: "चौपाल पोस्ट हटाई गई",
    description: "एक पोस्ट को नीति उल्लंघन के कारण हटाया गया है।",
    type: "warning",
    category: "community",
    priority: "medium",
    entity_type: "post",
    entity_id: postId,
    action_url: `/admin/community`,
    target_role: "all",
  });
}

export async function notifyChaupalLocked(postId: string) {
  return createSystemNotification({
    title: "चर्चा बंद की गई",
    description: "एक चर्चा को बंद कर दिया गया है।",
    type: "info",
    category: "community",
    priority: "low",
    entity_type: "post",
    entity_id: postId,
    action_url: `/admin/community`,
    target_role: "all",
  });
}

// ─── CONTACT MESSAGES ──────────────────────────────────────────────────────────

export async function notifyContactMessage(messageId: string, senderName: string, subject?: string) {
  return createSystemNotification({
    title: "नया संपर्क संदेश",
    description: `${senderName} से संदेश प्राप्त हुआ है${subject ? `: "${subject}"` : "।"}`,
    type: "info",
    category: "contact",
    priority: "medium",
    entity_type: "contact",
    entity_id: messageId,
    action_url: `/admin/contact-messages`,
    target_role: "all",
  });
}

export async function notifyContactMessageHighPriority(messageId: string, senderName: string) {
  return createSystemNotification({
    title: "उच्च प्राथमिकता संदेश!",
    description: `${senderName} का संदेश तत्काल ध्यान का अनुरोध करता है।`,
    type: "warning",
    category: "contact",
    priority: "critical",
    entity_type: "contact",
    entity_id: messageId,
    action_url: `/admin/contact-messages`,
    target_role: "all",
  });
}

export async function notifyContactMessageArchived(messageId: string) {
  return createSystemNotification({
    title: "संपर्क संदेश संग्रहीत",
    description: "एक संपर्क संदेश को संग्रह में भेज दिया गया है।",
    type: "info",
    category: "contact",
    priority: "low",
    entity_type: "contact",
    entity_id: messageId,
    action_url: `/admin/contact-messages`,
    target_role: "all",
  });
}

// ─── USERS ─────────────────────────────────────────────────────────────────────

export async function notifyUserRegistered(userId: string, userName: string) {
  return createSystemNotification({
    title: "नया उपयोगकर्ता पंजीकृत",
    description: `${userName} ने Yuvakshar पर खाता बनाया है।`,
    type: "info",
    category: "users",
    priority: "low",
    entity_type: "user",
    entity_id: userId,
    action_url: `/admin/users`,
    target_role: "all",
  });
}

export async function notifyUserVerified(userId: string, userName: string) {
  return createSystemNotification({
    title: "उपयोगकर्ता सत्यापित",
    description: `${userName} का खाता सत्यापित किया गया है।`,
    type: "success",
    category: "users",
    priority: "low",
    entity_type: "user",
    entity_id: userId,
    action_url: `/admin/users`,
    target_role: "all",
  });
}

export async function notifyUserPromotedEditor(userId: string, userName: string) {
  return createSystemNotification({
    title: "उपयोगकर्ता संपादक बना",
    description: `${userName} को संपादक (Editor) की भूमिका दी गई है।`,
    type: "success",
    category: "users",
    priority: "medium",
    entity_type: "user",
    entity_id: userId,
    action_url: `/admin/users`,
    target_role: "all",
  });
}

export async function notifyUserPromotedAdmin(userId: string, userName: string) {
  return createSystemNotification({
    title: "उपयोगकर्ता व्यवस्थापक बना",
    description: `${userName} को व्यवस्थापक (Admin) की भूमिका दी गई है।`,
    type: "success",
    category: "users",
    priority: "high",
    entity_type: "user",
    entity_id: userId,
    action_url: `/admin/users`,
    target_role: "all",
  });
}

export async function notifyUserSuspended(userId: string, userName: string) {
  return createSystemNotification({
    title: "उपयोगकर्ता निलंबित",
    description: `${userName} का खाता अस्थायी रूप से निलंबित किया गया है।`,
    type: "warning",
    category: "users",
    priority: "high",
    entity_type: "user",
    entity_id: userId,
    action_url: `/admin/users`,
    target_role: "all",
  });
}

export async function notifyUserRestored(userId: string, userName: string) {
  return createSystemNotification({
    title: "उपयोगकर्ता पुनः सक्रिय",
    description: `${userName} का खाता पुनः सक्रिय किया गया है।`,
    type: "success",
    category: "users",
    priority: "medium",
    entity_type: "user",
    entity_id: userId,
    action_url: `/admin/users`,
    target_role: "all",
  });
}

// ─── BANNER GALLERY ────────────────────────────────────────────────────────────

export async function notifyBannerUploaded(bannerId: string, title: string) {
  return createSystemNotification({
    title: "नया बैनर अपलोड हुआ",
    description: `बैनर "${title}" गैलरी में जोड़ा गया है।`,
    type: "info",
    category: "banners",
    priority: "low",
    entity_type: "banner",
    entity_id: bannerId,
    action_url: `/admin/media/banners`,
    target_role: "all",
  });
}

export async function notifyBannerActivated(bannerId: string, title: string) {
  return createSystemNotification({
    title: "बैनर सक्रिय किया गया",
    description: `बैनर "${title}" को होमपेज पर सक्रिय किया गया है।`,
    type: "success",
    category: "banners",
    priority: "medium",
    entity_type: "banner",
    entity_id: bannerId,
    action_url: `/admin/media/banners`,
    target_role: "all",
  });
}

export async function notifyBannerRemoved(bannerId: string, title: string) {
  return createSystemNotification({
    title: "बैनर हटाया गया",
    description: `बैनर "${title}" गैलरी से हटा दिया गया है।`,
    type: "warning",
    category: "banners",
    priority: "low",
    entity_type: "banner",
    entity_id: bannerId,
    action_url: `/admin/media/banners`,
    target_role: "all",
  });
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

export async function notifyBrandingUpdated(changedBy?: string) {
  return createSystemNotification({
    title: "ब्रांडिंग अपडेट की गई",
    description: `साइट की ब्रांडिंग सेटिंग्स${changedBy ? ` ${changedBy} द्वारा` : ""} अपडेट की गई हैं।`,
    type: "info",
    category: "settings",
    priority: "medium",
    action_url: `/admin/cms/settings`,
    target_role: "all",
  });
}

export async function notifyLogoChanged(changedBy?: string) {
  return createSystemNotification({
    title: "लोगो बदला गया",
    description: `साइट का लोगो${changedBy ? ` ${changedBy} द्वारा` : ""} बदला गया है।`,
    type: "info",
    category: "settings",
    priority: "medium",
    action_url: `/admin/cms/settings`,
    target_role: "all",
  });
}

export async function notifySeoUpdated(changedBy?: string) {
  return createSystemNotification({
    title: "SEO सेटिंग्स अपडेट हुईं",
    description: `खोज इंजन अनुकूलन (SEO) सेटिंग्स${changedBy ? ` ${changedBy} द्वारा` : ""} अपडेट की गई हैं।`,
    type: "info",
    category: "settings",
    priority: "low",
    action_url: `/admin/cms/settings`,
    target_role: "all",
  });
}

// ─── SYSTEM ────────────────────────────────────────────────────────────────────

export async function notifyBackupCompleted() {
  return createSystemNotification({
    title: "बैकअप सफल रहा",
    description: "डेटाबेस बैकअप सफलतापूर्वक पूर्ण हुआ।",
    type: "success",
    category: "system",
    priority: "medium",
    target_role: "founder",
  });
}

export async function notifyBackupFailed(reason?: string) {
  return createSystemNotification({
    title: "बैकअप विफल हुआ!",
    description: `डेटाबेस बैकअप विफल रहा${reason ? `: ${reason}` : "।"} तत्काल जाँच करें।`,
    type: "error",
    category: "system",
    priority: "critical",
    target_role: "founder",
  });
}

export async function notifyMigrationCompleted(version: string) {
  return createSystemNotification({
    title: "डेटाबेस माइग्रेशन सफल",
    description: `माइग्रेशन ${version} सफलतापूर्वक पूर्ण हुआ।`,
    type: "success",
    category: "system",
    priority: "high",
    target_role: "founder",
  });
}

export async function notifyMigrationFailed(version: string, reason?: string) {
  return createSystemNotification({
    title: "डेटाबेस माइग्रेशन विफल!",
    description: `माइग्रेशन ${version} विफल रहा${reason ? `: ${reason}` : "।"}`,
    type: "error",
    category: "system",
    priority: "critical",
    target_role: "founder",
  });
}

export async function notifyStorageWarning(usagePercent: number) {
  return createSystemNotification({
    title: "स्टोरेज चेतावनी",
    description: `स्टोरेज उपयोग ${usagePercent}% पहुँच गया है। कृपया पुरानी फ़ाइलें हटाएँ।`,
    type: "warning",
    category: "system",
    priority: "high",
    target_role: "founder",
  });
}

export async function notifyStorageFull() {
  return createSystemNotification({
    title: "स्टोरेज भर गया!",
    description: "स्टोरेज स्थान समाप्त हो गया है। नई फ़ाइलें अपलोड नहीं होंगी।",
    type: "error",
    category: "system",
    priority: "critical",
    target_role: "founder",
  });
}
