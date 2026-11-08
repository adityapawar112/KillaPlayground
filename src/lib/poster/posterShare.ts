/**
 * posterShare.ts
 * Export, download, and multi-channel social media sharing utilities.
 * Uses native Web Share API with clipboard and social intent fallbacks.
 */

/**
 * Downloads a Blob directly to the user's browser
 */
export function downloadPosterBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Cleanly revoke URL to prevent memory leaks
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/**
 * Copies a PNG blob directly to the system clipboard
 */
export async function copyPosterToClipboard(blob: Blob): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  try {
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

/**
 * Native Web Share API trigger with fallback
 */
export async function sharePosterFile(params: {
  blob: Blob;
  filename: string;
  title: string;
  text: string;
  url?: string;
}): Promise<{ success: boolean; method: 'web-share' | 'clipboard' | 'download' }> {
  const { blob, filename, title, text, url = window.location.href } = params;

  if (typeof navigator !== 'undefined' && typeof File !== 'undefined') {
    const file = new File([blob], filename, { type: blob.type || 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return { success: true, method: 'web-share' };
      } catch (err: any) {
        // User cancelled share dialog
        if (err.name === 'AbortError') {
          return { success: false, method: 'web-share' };
        }
        console.warn('navigator.share with files failed, attempting clipboard fallback:', err);
      }
    }
  }

  // Fallback 1: Try copying image to clipboard
  const clipboardSuccess = await copyPosterToClipboard(blob);
  if (clipboardSuccess) {
    return { success: true, method: 'clipboard' };
  }

  // Fallback 2: Direct file download
  downloadPosterBlob(blob, filename);
  return { success: true, method: 'download' };
}

/**
 * Generates direct web intent links for desktop / social platforms
 */
export function getSocialShareLinks(title: string, text: string, url: string = 'https://www.killaplayground.games') {
  const shareMessage = `${title}\n${text}\n${url}`;

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };
}

