// Privacy Policy — Maths Aura
// Source: Google Doc provided by the app owner (Publisher: Rovofy.io).
// This text must not be edited. Rendered verbatim in Settings → Privacy Policy.

export const PRIVACY_POLICY_META = {
  title: "Privacy Policy",
  publisher: "Rovofy.io",
  application: "Maths Aura",
  effectiveDate: "September 19th, 2026",
  contactEmail: "quvolution@gmail.com",
} as const;

export interface PrivacySection {
  heading: string;
  body: string[];
}

export const PRIVACY_POLICY_INTRO: string[] = [
  "Publisher: Rovofy.io",
  "Application: Maths Aura",
  "Effective Date: September 19th, 2026",
  'This Privacy Policy applies to Maths Aura ("the Application", "we", "our", or "us"), published by Rovofy.io, and distributed through the Google Play Store and web platforms. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Application. By using Maths Aura, you agree to the collection and use of information in accordance with this Privacy Policy.',
];

export const PRIVACY_POLICY_SECTIONS: PrivacySection[] = [
  {
    heading: "1. Information We Collect",
    body: [
      "Information You Provide Voluntarily",
      "We do not require you to provide any personal information to use Maths Aura. Specifically, we do not collect:",
      "User registration (not required to play)\nName or username\nEmail address\nAccount registration details\nSupport requests and communications\nFeedback and survey responses\nUser-generated content",
      "Automatically Collected Information",
      "Maths Aura itself does not collect any technical or usage information. The following data may be collected by third-party services integrated into the Application (such as Google AdMob and Google Play Services) and is subject to their respective privacy policies:",
      "Device type and model\nUnique device identifiers\nIP address\nOperating system and version\nMobile network information\nApplication version\nUsage statistics and interaction data\nCrash logs and diagnostics\nAdvertising identifiers",
      "We do not access, store, or transmit this data ourselves. Please refer to Google's Privacy Policy for details on how they handle this information.",
      "Data Stored Locally on Your Device",
      "The following data is stored locally on your device via browser localStorage and is never transmitted to us:",
      "Game progress, high scores, level, and achievements\nCharacter unlock status and in-game currency balances\nDaily streak and social share counts\nGDPR consent preference\nDeveloper mode flag (if enabled)",
      "None of this data is transmitted to us or any third party. It stays on your device and can be cleared at any time via your browser or app settings.",
    ],
  },
  {
    heading: "2. Device Information (Local Use Only)",
    body: [
      "Maths Aura reads the following device information solely for local performance optimisation — it is never transmitted or stored:",
      "Battery level and charging status (to reduce performance when battery is low)\nCPU core count (navigator.hardwareConcurrency) — to detect slow devices\nDevice memory (navigator.deviceMemory) — to detect low-memory devices\nScreen pixel ratio (devicePixelRatio) — for sharp Canvas rendering",
    ],
  },
  {
    heading: "3. What We Do NOT Collect",
    body: [
      "No name, email, phone number, or address\nNo device advertising ID (read or transmitted by our code)\nNo analytics, crash reports, or telemetry (beyond what third-party services collect)\nNo location data (GPS or IP-based)\nNo camera, microphone, or sensor access\nNo tracking pixels or fingerprinting\nNo WebSocket connections\nNo form inputs requesting personal data\nNo social media logins or account creation",
    ],
  },
  {
    heading: "4. Social Sharing",
    body: [
      "When you voluntarily use the share feature, Maths Aura opens your chosen social platform (WhatsApp, X/Twitter, Telegram) or native share dialog with your current score and game URL. This is entirely user-initiated — no data is shared automatically or in the background.",
    ],
  },
  {
    heading: "5. Cookies and Local Storage",
    body: [
      "Maths Aura itself does not set cookies. However, Google AdSense / AdMob (our advertising partner) uses cookies and local storage for the following essential purposes, regardless of whether ads are personalized or non-personalized:",
      "Fraud detection and prevention\nFrequency capping (limiting how often you see the same ad)\nAggregated ad reporting and measurement",
      "For users in the European Economic Area (EEA), the UK, and Switzerland, consent for this storage is obtained via Google's Funding Choices consent management platform (certified CMP) or our fallback consent dialog. You can withdraw consent at any time via the Privacy Settings button in the game menu.",
    ],
  },
  {
    heading: "6. Third-Party Services",
    body: [
      "Maths Aura uses the following third-party services:",
      "Google AdMob / AdSense — serves banner and rewarded ads. AdMob may collect device information, advertising ID, IP address, and usage data to serve ads. Ads served are non-personalized (context-based, not behavioral). See Google's Privacy Policy.",
      "Google Funding Choices (UMP) — manages GDPR consent collection for users in the European Economic Area, the UK, and Switzerland. This is Google's IAB TCF-certified consent management platform.",
      "Google Play Services — core Android functionality and app distribution.",
      "These services operate under their own privacy policies and may collect data as described therein. The game code itself does not read, access, or transmit any advertising identifiers.",
    ],
  },
  {
    heading: "7. Advertising",
    body: [
      "Maths Aura uses Google AdMob to serve non-personalized ads. Non-personalized ads are targeted using contextual information (e.g., the content of the game) rather than your past browsing behavior. Although these ads don't use cookies for personalization, they do use cookies for frequency capping, aggregated reporting, and fraud prevention as described above.",
      "You can manage your consent choices at any time:",
      "In-game: Tap the Privacy button in the main menu to open consent settings\nEEA/UK/Switzerland: A consent dialog is presented on first launch via Google Funding Choices\nDevice settings: Reset your advertising ID or opt out of interest-based ads",
    ],
  },
  {
    heading: "8. Location Information",
    body: [
      "Maths Aura does not collect your precise or approximate geographic location. We do not request location permissions, and no location data is accessed, collected, or transmitted.",
    ],
  },
  {
    heading: "9. Artificial Intelligence (AI) Features",
    body: [
      "Maths Aura does not currently use Artificial Intelligence technologies. If AI features are introduced in future updates, this Privacy Policy will be updated to describe their use and data processing practices.",
    ],
  },
  {
    heading: "10. Legal Bases for Processing (EEA, UK, and Switzerland)",
    body: [
      "Maths Aura does not operate backend servers and does not process personal data on its own infrastructure. However, third-party services integrated into the Application (such as Google AdMob) may process personal data under the following legal bases:",
      "Your consent — for advertising cookies and local storage\nLegitimate business interests — for fraud prevention, security, and service improvement\nCompliance with legal obligations — where required by applicable law",
      "Where consent is required, you may withdraw it at any time via the Privacy button in the game menu.",
    ],
  },
  {
    heading: "11. Your Privacy Rights",
    body: [
      "European Union (GDPR)",
      "If you are located in the EU/EEA, UK, or Switzerland, you may have the right to:",
      "Access your personal data\nCorrect inaccurate data\nDelete your data (\"Right to Erasure\")\nRestrict processing\nObject to processing\nData portability\nWithdraw consent\nLodge a complaint with a supervisory authority",
      "United States Privacy Rights",
      "Depending on your U.S. state of residence (including California, Colorado, Virginia, Connecticut, Utah, and others), you may have rights to:",
      "Know what personal information we collect\nRequest deletion of personal information\nCorrect inaccurate information\nOpt out of targeted advertising\nOpt out of data sharing or sale where applicable\nNon-discrimination for exercising privacy rights",
      "California residents may also have rights under the California Consumer Privacy Act (\"CCPA/CPRA\"). We do not knowingly sell personal information of minors under 16 years of age.",
      "To exercise any of these rights, contact us at quvolution@gmail.com.",
    ],
  },
  {
    heading: "12. Data Retention",
    body: [
      "Maths Aura operates entirely on your device — we do not operate any backend servers and do not retain any personal information. All game data is stored locally on your device and persists only until you clear it via your browser or app settings. Data collected by third-party services (such as Google AdMob) is subject to their respective privacy policies and retention practices.",
    ],
  },
  {
    heading: "13. International Data Transfers",
    body: [
      "Maths Aura itself does not transfer your data across borders, as we operate no backend infrastructure. However, third-party services integrated into the Application (such as Google AdMob) may process data in countries outside your country of residence in accordance with their privacy policies and applicable legal frameworks, including:",
      "Standard Contractual Clauses (SCCs)\nAdequacy decisions\nOther lawful transfer mechanisms",
    ],
  },
  {
    heading: "14. Children's Privacy",
    body: [
      "Maths Aura is suitable for all ages. We do not knowingly collect personal information from children under the age of 13, or the minimum age required by local law, without appropriate parental consent where required. If we become aware that a child has provided personal information unlawfully, we will delete it promptly. Parents or guardians may contact us regarding children's privacy concerns at quvolution@gmail.com.",
    ],
  },
  {
    heading: "15. Security",
    body: [
      "Maths Aura operates entirely on your device — no backend infrastructure exists. Game data is stored locally in your browser or app storage and is subject to the security of your own device. Third-party services (such as Google AdMob) implement their own security measures in accordance with their privacy policies. No method of transmission or storage is completely secure.",
    ],
  },
  {
    heading: "16. Opt-Out Rights",
    body: [
      "You may opt out of certain data collection and processing by:",
      "Uninstalling the Application\nDisabling permissions through device settings\nAdjusting advertising preferences in your device settings\nOpting out of personalized ads via the Privacy button in the game menu\nClearing game data via browser or app settings",
      "Some features may not function properly if permissions are disabled.",
    ],
  },
  {
    heading: "17. Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy periodically. We will notify users of material changes by updating the effective date or through in-app notifications where required by law. Continued use of the Application after updates constitutes acceptance of the revised Privacy Policy.",
    ],
  },
  {
    heading: "18. Platform-Specific Compliance",
    body: [
      "This Privacy Policy is intended to support compliance with:",
      "Google Play User Data Policy\nApple App Store Review Guidelines\nGeneral Data Protection Regulation (GDPR)\nCalifornia Consumer Privacy Act (CCPA/CPRA)\nUK GDPR\nApplicable international privacy laws",
    ],
  },
  {
    heading: "19. Contact Us",
    body: [
      "If you have any questions, requests, or concerns regarding this Privacy Policy or our privacy practices, please contact us:",
      "Publisher: Rovofy.io\nEmail: quvolution@gmail.com",
      "Rovofy.io — Maths Aura",
    ],
  },
];
