import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
    apiKey: "AIzaSyC9c5yk7Smmjk3PRJgJm24PmXJfr0XpBlc",
    authDomain: "robert-portfolio-98d71.firebaseapp.com",
    projectId: "robert-portfolio-98d71",
    storageBucket: "robert-portfolio-98d71.firebasestorage.app",
    messagingSenderId: "125447409289",
    appId: "1:125447409289:web:010585084cc2a0fe8ec058"
};

const RECAPTCHA_V3_SITE_KEY = "6LcsLsArAAAAAIKuIslOZOQSSr7HSlZZD2qVHWhD";

export const app = initializeApp(firebaseConfig);
if (["localhost", "127.0.0.1"].includes(location.hostname)) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
try {
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY), isTokenAutoRefreshEnabled: true });
} catch (e) { console.warn("App Check init failed:", e); }
export const db = getFirestore(app);
