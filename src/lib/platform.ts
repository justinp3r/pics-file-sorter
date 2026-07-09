export type OS = 'macos' | 'windows' | 'linux' | 'other';

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

/** Detect the host operating system (used to label the "system default" theme). */
export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'other';
  const nav = navigator as NavigatorWithUAData;
  const platform = (
    nav.userAgentData?.platform ??
    nav.platform ??
    nav.userAgent
  ).toLowerCase();
  if (platform.includes('mac')) return 'macos';
  if (platform.includes('win')) return 'windows';
  if (platform.includes('linux')) return 'linux';
  return 'other';
}

export function osLabel(os: OS): string {
  switch (os) {
    case 'macos':
      return 'macOS';
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return 'OS';
  }
}

/** The OS-level dark mode preference, exposed by the browser. */
export function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
