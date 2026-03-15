import { useEffect, useMemo, useState } from "react";

const DISMISS_KEY = "android_apk_banner_dismissed";
const DEFAULT_APK_PATH = "/app-release.apk";

function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
}

export default function AndroidInstallBanner() {
  const [visible, setVisible] = useState(false);
  const apkUrl = useMemo(
    () => import.meta.env.VITE_ANDROID_APK_URL || DEFAULT_APK_PATH,
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    const shouldShow = isAndroidDevice() && !isStandalonePwa() && !dismissed;
    setVisible(shouldShow);
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
  };

  if (!visible) return null;

  return (
    <section className="mx-auto w-full max-w-7xl rounded-md bg-slate-200 px-3 py-4 text-center">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close install banner"
        className="float-right -mt-1 text-xl leading-none text-slate-500 hover:text-slate-700"
      >
        &times;
      </button>
      <p className="mb-3 text-xl font-semibold text-slate-900">
        Add Service App to your Homescreen!
      </p>
      <a
        href={apkUrl}
        download
        className="inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Install
      </a>
    </section>
  );
}
