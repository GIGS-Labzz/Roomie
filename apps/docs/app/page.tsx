"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Key, 
  CreditCard, 
  CheckSquare, 
  Share2, 
  Code, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Play, 
  Sparkles,
  ChevronRight,
  Info,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  LogOut,
  Settings,
  User,
  Globe
} from "lucide-react";
import { Logo } from "@repo/ui/logo";
import { DOCS_CONTENT } from "../src/content";

type SectionType = "intro" | "oauth" | "passport" | "splits" | "checkout" | "network" | "dashboard" | "sandbox";

interface SidebarItem {
  id: SectionType;
  label: string;
  icon: React.ComponentType<any>;
  category: "GETTING STARTED" | "AUTHENTICATION" | "API ENDPOINTS" | "PLAYGROUND";
}

interface DevUser {
  orgName: string;
  email: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  webhookUrl: string;
  webhookSecret: string;
  scopes: {
    profile: boolean;
    verification: boolean;
    network: boolean;
  };
  webhookEvents: {
    splits: boolean;
    checkout: boolean;
  };
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<SectionType>("intro");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // --- AUTH STATE & LOCALSTORAGE DATABASE ---
  const [devSession, setDevSession] = useState<DevUser | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  
  // Auth Form Fields
  const [authOrgName, setAuthOrgName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load active session and theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    // Seed default developer account if it doesn't exist
    const usersJson = localStorage.getItem("roomie_dev_users") || "[]";
    let usersList: DevUser[] = [];
    try {
      usersList = JSON.parse(usersJson);
    } catch (e) {
      usersList = [];
    }

    const hasSudoDev = usersList.some((u) => u.email.toLowerCase() === "dev@roomie.ng");

    if (!hasSudoDev) {
      const sudoDevUser: DevUser = {
        orgName: "Roomie Core Devs",
        email: "dev@roomie.ng",
        clientId: "roomie-client-sudo-dev-100293",
        clientSecret: "rm_sec_sudo_dev_key_88f2b1a",
        webhookUrl: "https://platform.roomie.ng/webhooks/roomie",
        webhookSecret: "wh_sec_sudo_dev_webhook_secret",
        scopes: {
          profile: true,
          verification: true,
          network: true
        },
        redirectUris: ["https://platform.roomie.ng/auth/callback"],
        webhookEvents: {
          splits: true,
          checkout: true
        }
      };
      
      usersList.push(sudoDevUser);
      localStorage.setItem("roomie_dev_users", JSON.stringify(usersList));
    }

    // Ensure password credentials are also mapped independently
    const credentialsJson = localStorage.getItem("roomie_dev_credentials") || "{}";
    let credentialsMap: Record<string, string> = {};
    try {
      credentialsMap = JSON.parse(credentialsJson);
    } catch (e) {
      credentialsMap = {};
    }
    if (credentialsMap["dev@roomie.ng"] !== "devRoomie") {
      credentialsMap["dev@roomie.ng"] = "devRoomie";
      localStorage.setItem("roomie_dev_credentials", JSON.stringify(credentialsMap));
    }

    // Check local storage for active session
    const savedSession = localStorage.getItem("roomie_dev_session");
    if (savedSession) {
      try {
        setDevSession(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem("roomie_dev_session");
      }
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- DASHBOARD EDIT STATES ---
  const [dashboardTab, setDashboardTab] = useState<"credentials" | "webhooks" | "settings">("credentials");
  const [showSecret, setShowSecret] = useState(false);
  const [newRedirectUri, setNewRedirectUri] = useState("");
  
  // Dashboard profile edits
  const [editOrgName, setEditOrgName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Sync profile edits with session changes
  useEffect(() => {
    if (devSession) {
      setEditOrgName(devSession.orgName);
      setEditEmail(devSession.email);
    }
  }, [devSession]);

  // --- MOCK SANDBOX STATES ---
  const [sandboxTab, setSandboxTab] = useState<"oauth" | "splits" | "checkout">("oauth");
  const [oauthStep, setOauthStep] = useState<1 | 2 | 3>(1);
  const [showOauthModal, setShowOauthModal] = useState(false);
  
  // Sandbox values - defaulted to session values if logged in
  const [clientId, setClientId] = useState("roomie-client-8812c3f8-a1b7");
  const [clientSecret, setClientSecret] = useState("rm_sec_99a82bd188f2");
  const [redirectUri, setRedirectUri] = useState("https://unihousing.ng/auth/callback");
  const [scopes, setScopes] = useState({
    profile: true,
    verification: true,
    network: false
  });
  const [authCode, setAuthCode] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  
  // Splits Simulation
  const [invoiceAmount, setInvoiceAmount] = useState(400000); // in Naira
  const [splitRatioA, setSplitRatioA] = useState(50); // Roommate A percentage
  const [roommateAPaid, setRoommateAPaid] = useState(false);
  const [roommateBPaid, setRoommateBPaid] = useState(false);
  const [splitClearedWebhook, setSplitClearedWebhook] = useState<any>(null);

  // Checkout Consent Simulation
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [billsSettled, setBillsSettled] = useState(true);
  const [keysReturned, setKeysReturned] = useState(true);
  const [noDamages, setNoDamages] = useState(true);
  const [checkoutDate, setCheckoutDate] = useState("2026-08-31");
  const [checkoutWebhook, setCheckoutWebhook] = useState<any>(null);

  // --- SYNC SANDBOX WITH ACTIVE SESSION ---
  useEffect(() => {
    if (devSession) {
      setClientId(devSession.clientId);
      setClientSecret(devSession.clientSecret);
      setRedirectUri(devSession.redirectUris[0] || "https://unihousing.ng/auth/callback");
      setScopes({
        profile: devSession.scopes.profile,
        verification: devSession.scopes.verification,
        network: devSession.scopes.network
      });
    } else {
      setClientId("roomie-client-8812c3f8-a1b7");
      setClientSecret("rm_sec_99a82bd188f2");
      setRedirectUri("https://unihousing.ng/auth/callback");
      setScopes({
        profile: true,
        verification: true,
        network: false
      });
    }
    // Reset sandbox steps on session changes
    resetOauth();
    resetSplits();
    resetCheckout();
  }, [devSession, activeSection]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sidebarItems: SidebarItem[] = [
    { id: "intro", label: "Overview & Quickstart", icon: Info, category: "GETTING STARTED" },
    { id: "oauth", label: "Roomie OAuth SSO", icon: Key, category: "AUTHENTICATION" },
    { id: "passport", label: "GET /api/oauth/userinfo", icon: Share2, category: "API ENDPOINTS" },
    { id: "splits", label: "POST /api/splits", icon: CreditCard, category: "API ENDPOINTS" },
    { id: "checkout", label: "POST /api/checkout/consent", icon: CheckSquare, category: "API ENDPOINTS" },
    { id: "network", label: "GET /api/network/mutual/:userId", icon: Share2, category: "API ENDPOINTS" },
    { id: "dashboard", label: "Developer Dashboard", icon: Settings, category: "PLAYGROUND" },
    { id: "sandbox", label: "Developer Sandbox", icon: Terminal, category: "PLAYGROUND" },
  ];

  // --- AUTH REGISTER & LOGIN ACTIONS ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authOrgName || !authEmail || !authPassword) {
      setAuthError("All fields are required.");
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    // Check if user already exists
    const usersJson = localStorage.getItem("roomie_dev_users") || "[]";
    const usersList: any[] = JSON.parse(usersJson);
    const userExists = usersList.some((u) => u.email.toLowerCase() === authEmail.toLowerCase());

    if (userExists) {
      setAuthError("An account with this email already exists.");
      return;
    }

    // Generate fresh app credentials
    const newClientId = `roomie-client-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`;
    const newClientSecret = `rm_sec_${Math.random().toString(36).substring(2, 18)}`;
    const newWebhookSecret = `wh_sec_${Math.random().toString(36).substring(2, 18)}`;

    const newDevUser: DevUser = {
      orgName: authOrgName,
      email: authEmail,
      clientId: newClientId,
      clientSecret: newClientSecret,
      webhookUrl: "https://my-agency.com/api/webhooks/roomie",
      webhookSecret: newWebhookSecret,
      scopes: {
        profile: true,
        verification: true,
        network: false
      },
      redirectUris: ["https://my-agency.com/auth/callback"],
      webhookEvents: {
        splits: true,
        checkout: true
      }
    };

    // Save user and password mapping
    const credentialsJson = localStorage.getItem("roomie_dev_credentials") || "{}";
    const credentialsMap = JSON.parse(credentialsJson);
    credentialsMap[authEmail.toLowerCase()] = authPassword;

    usersList.push(newDevUser);
    localStorage.setItem("roomie_dev_users", JSON.stringify(usersList));
    localStorage.setItem("roomie_dev_credentials", JSON.stringify(credentialsMap));

    // Save active session
    localStorage.setItem("roomie_dev_session", JSON.stringify(newDevUser));
    setDevSession(newDevUser);
    
    // Clear forms
    setAuthOrgName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthConfirmPassword("");
    triggerToast("Developer account registered successfully!");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail || !authPassword) {
      setAuthError("Email and Password are required.");
      return;
    }

    const credentialsJson = localStorage.getItem("roomie_dev_credentials") || "{}";
    const credentialsMap = JSON.parse(credentialsJson);
    const correctPassword = credentialsMap[authEmail.toLowerCase()];

    if (!correctPassword || correctPassword !== authPassword) {
      setAuthError("Invalid email or password.");
      return;
    }

    const usersJson = localStorage.getItem("roomie_dev_users") || "[]";
    const usersList: DevUser[] = JSON.parse(usersJson);
    const activeUser = usersList.find((u) => u.email.toLowerCase() === authEmail.toLowerCase());

    if (!activeUser) {
      setAuthError("Failed to resolve profile. Re-register.");
      return;
    }

    localStorage.setItem("roomie_dev_session", JSON.stringify(activeUser));
    setDevSession(activeUser);

    setAuthEmail("");
    setAuthPassword("");
    triggerToast("Welcome back to Roomie Console!");
  };

  const handleLogOut = () => {
    localStorage.removeItem("roomie_dev_session");
    setDevSession(null);
    triggerToast("Logged out of Developer Console.");
  };

  const handleDeleteAccount = () => {
    if (!devSession) return;

    const confirmDelete = window.confirm("Are you absolutely sure you want to delete this developer account? All generated Client Secrets and configurations will be permanently revoked.");
    if (!confirmDelete) return;

    const usersJson = localStorage.getItem("roomie_dev_users") || "[]";
    let usersList: DevUser[] = JSON.parse(usersJson);
    usersList = usersList.filter((u) => u.email.toLowerCase() !== devSession.email.toLowerCase());

    const credentialsJson = localStorage.getItem("roomie_dev_credentials") || "{}";
    const credentialsMap = JSON.parse(credentialsJson);
    delete credentialsMap[devSession.email.toLowerCase()];

    localStorage.setItem("roomie_dev_users", JSON.stringify(usersList));
    localStorage.setItem("roomie_dev_credentials", JSON.stringify(credentialsMap));
    localStorage.removeItem("roomie_dev_session");

    setDevSession(null);
    triggerToast("Developer account deleted.");
  };

  // --- CREDENTIALS UPDATE ACTIONS ---
  const saveDashboardChanges = (updatedUser: DevUser) => {
    setDevSession(updatedUser);
    localStorage.setItem("roomie_dev_session", JSON.stringify(updatedUser));

    // Update in users database
    const usersJson = localStorage.getItem("roomie_dev_users") || "[]";
    let usersList: DevUser[] = JSON.parse(usersJson);
    usersList = usersList.map((u) => u.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : u);
    localStorage.setItem("roomie_dev_users", JSON.stringify(usersList));
    triggerToast("Configurations updated successfully!");
  };

  const handleRegenerateSecret = () => {
    if (!devSession) return;
    const confirmRegen = window.confirm("Regenerating the secret will immediately invalidate your previous secret key. Ensure you update your backend services. Do you want to continue?");
    if (!confirmRegen) return;

    const updatedUser = {
      ...devSession,
      clientSecret: `rm_sec_${Math.random().toString(36).substring(2, 18)}`
    };
    saveDashboardChanges(updatedUser);
    triggerToast("New Client Secret generated!");
  };

  const handleAddRedirectUri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devSession || !newRedirectUri.trim()) return;

    // Check duplicates
    if (devSession.redirectUris.includes(newRedirectUri.trim())) {
      alert("This redirect URI is already registered.");
      return;
    }

    const updatedUser = {
      ...devSession,
      redirectUris: [...devSession.redirectUris, newRedirectUri.trim()]
    };
    saveDashboardChanges(updatedUser);
    setNewRedirectUri("");
  };

  const handleRemoveRedirectUri = (uri: string) => {
    if (!devSession) return;
    if (devSession.redirectUris.length <= 1) {
      alert("You must maintain at least one redirect Callback URI.");
      return;
    }
    const updatedUser = {
      ...devSession,
      redirectUris: devSession.redirectUris.filter((u) => u !== uri)
    };
    saveDashboardChanges(updatedUser);
  };

  const handleToggleScope = (scopeKey: keyof DevUser["scopes"]) => {
    if (!devSession) return;
    const updatedUser = {
      ...devSession,
      scopes: {
        ...devSession.scopes,
        [scopeKey]: !devSession.scopes[scopeKey]
      }
    };
    saveDashboardChanges(updatedUser);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devSession) return;

    const updatedUser = {
      ...devSession,
      orgName: editOrgName,
    };
    saveDashboardChanges(updatedUser);
  };

  // Simple Markdown Parser Component
  const renderMarkdown = (mdText: string) => {
    const lines = mdText.split("\n");
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeLines: string[] = [];
    let listItems: string[] = [];

    const elements: React.ReactNode[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key}`} className="list-disc pl-6 mb-4 space-y-2 text-sage-700 dark:text-sage-200">
            {listItems.map((item, idx) => {
              const parts = item.split(/`([^`]+)`/g);
              return (
                <li key={idx}>
                  {parts.map((p, pidx) => 
                    pidx % 2 === 1 ? <code key={pidx} className="bg-sage-100 dark:bg-sage-900/60 text-brand-600 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800/30 text-sm">{p}</code> : p
                  )}
                </li>
              );
            })}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeString = codeLines.join("\n");
          const blockId = `code-${index}`;
          elements.push(
            <div key={blockId} className="relative group my-6 rounded-lg overflow-hidden border border-brand-200 dark:border-brand-800/30 bg-slate-50 dark:bg-[#0f130e]">
              <div className="flex items-center justify-between px-4 py-2 bg-[#eae8dc] dark:bg-[#141b12] border-b border-brand-200 dark:border-brand-800/20 text-xs text-sage-600 dark:text-sage-400 font-mono">
                <span>{codeLanguage || "text"}</span>
                <button
                  onClick={() => handleCopy(codeString, blockId)}
                  className="flex items-center gap-1.5 hover:text-brand-650 dark:hover:text-brand-300 transition-colors"
                >
                  {copiedCode === blockId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                      <span className="text-brand-500 dark:text-brand-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm text-sage-800 dark:text-sage-200 font-mono leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeLines = [];
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3);
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Headers
      if (line.startsWith("# ")) {
        flushList(index);
        elements.push(
          <h1 key={index} className="text-3xl font-bold font-display text-foreground mt-8 mb-4 border-b border-brand-200 dark:border-brand-900/30 pb-2">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        flushList(index);
        elements.push(
          <h2 key={index} className="text-xl font-semibold font-display text-brand-650 dark:text-brand-300 mt-6 mb-3">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        flushList(index);
        elements.push(
          <h3 key={index} className="text-lg font-medium text-peach-600 dark:text-peach-300 mt-5 mb-2">
            {line.substring(4)}
          </h3>
        );
      }
      // Lists
      else if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        const itemText = line.trim().substring(2);
        listItems.push(itemText);
      }
      // Horizontal Rule
      else if (line.trim() === "---") {
        flushList(index);
        elements.push(<hr key={index} className="my-6 border-brand-200 dark:border-brand-900/20" />);
      }
      // Standard Paragraph
      else if (line.trim().length > 0) {
        flushList(index);
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        elements.push(
          <p key={index} className="text-sage-800 dark:text-sage-200 leading-relaxed mb-4">
            {parts.map((part, pidx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={pidx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("`") && part.endsWith("`")) {
                return <code key={pidx} className="bg-sage-100 dark:bg-sage-900/60 text-brand-600 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200 dark:border-brand-800/30 text-sm font-mono">{part.slice(1, -1)}</code>;
              }
              return part;
            })}
          </p>
        );
      } else {
        flushList(index);
      }
    });

    flushList(lines.length);
    return elements;
  };

  // --- SANDBOX RUNTIME FUNCTIONS ---
  const launchSSO = () => {
    if (!clientId || !redirectUri) return;
    setShowOauthModal(true);
  };

  const handleAuthorize = () => {
    setShowOauthModal(false);
    const mockCode = `rm_auth_${Math.random().toString(36).substring(2, 12)}`;
    setAuthCode(mockCode);
    setOauthStep(2);
  };

  const swapCodeForToken = () => {
    const mockToken = `rm_atk_${Math.random().toString(36).substring(2, 20)}`;
    setAccessToken(mockToken);
    setOauthStep(3);
  };

  const fetchPassport = () => {
    setProfileData({
      roomie_id: "@john_doe",
      display_name: "John Doe",
      email: "john@unilag.edu.ng",
      identity_status: {
        student_verified: scopes.verification,
        verification_status: scopes.verification ? "VERIFIED" : "UNVERIFIED",
        verified_at: scopes.verification ? "2026-06-15T12:00:00Z" : null
      },
      demographics: {
        age: 21,
        gender: "male",
        university: "UNILAG",
        faculty: "Science",
        year_of_study: 3
      },
      preferences: {
        min_budget: 80000,
        max_budget: 150000,
        lifestyle_tags: ["quiet", "no_smoking"]
      },
      current_roommate_partner: scopes.profile ? {
        id: "partner-uuid-123",
        roomie_id: "@jane_smith",
        display_name: "Jane Smith"
      } : null
    });
  };

  const resetOauth = () => {
    setOauthStep(1);
    setAuthCode("");
    setAccessToken("");
    setProfileData(null);
  };

  // Split calculations
  const totalAmountKobo = invoiceAmount * 100;
  const portionA = Math.round(invoiceAmount * (splitRatioA / 100));
  const portionB = invoiceAmount - portionA;

  const triggerPaySplit = (roommate: "A" | "B") => {
    if (roommate === "A") setRoommateAPaid(true);
    if (roommate === "B") setRoommateBPaid(true);

    if ((roommate === "A" && roommateBPaid) || (roommate === "B" && roommateAPaid)) {
      setSplitClearedWebhook({
        event: "split.payment.cleared",
        data: {
          payment_reference: "landlord-tracking-ref-98213",
          total_amount: totalAmountKobo,
          status: "SUCCESS",
          cleared_at: new Date().toISOString(),
          splits: [
            {
              user_id: "user-uuid-john",
              amount_paid: portionA * 100,
              channel: "card"
            },
            {
              user_id: "user-uuid-jane",
              amount_paid: portionB * 100,
              channel: "bank_transfer"
            }
          ]
        }
      });
    }
  };

  const resetSplits = () => {
    setRoommateAPaid(false);
    setRoommateBPaid(false);
    setSplitClearedWebhook(null);
  };

  // Checkout Consent
  const initiateCheckout = () => {
    setCheckoutStep(2);
  };

  const approveCheckout = (approved: boolean) => {
    if (approved) {
      setCheckoutWebhook({
        event: "checkout.consent.approved",
        data: {
          checkout_request_id: "checkout-uuid-8712",
          connection_id: "roommate-connection-uuid",
          checkout_date: checkoutDate,
          checklist: {
            bills_settled: billsSettled,
            keys_returned: keysReturned,
            no_damages: noDamages
          },
          split_refund_ratio: {
            initiator: 0.5,
            acceptor: 0.5
          }
        }
      });
      setCheckoutStep(3);
    } else {
      setCheckoutStep(1);
      setCheckoutWebhook(null);
    }
  };

  const resetCheckout = () => {
    setCheckoutStep(1);
    setCheckoutWebhook(null);
  };

  return (
    <div className={`${theme}`}>
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300">
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-brand-800/15 glass-panel sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant={theme === "dark" ? "light" : "default"} showWordmark={true} className="logo-container-docs" />
            <span className="text-xs text-brand-500 font-mono ml-1 mt-1 px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">platform.roomie</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 text-brand-400 hover:text-brand-300 transition-all flex items-center justify-center"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-brand-600" />}
            </button>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-brand-500/30 text-brand-400 bg-brand-950/20">
              <Sparkles className="w-3 h-3 text-brand-400" />
              API v1.0.0
            </span>
            <a
              href="https://github.com/GIGS-Labzz/Roomie"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-sage-600 dark:text-sage-300 hover:text-foreground transition-colors"
            >
              GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-72 border-r border-brand-800/15 p-6 flex flex-col justify-between overflow-y-auto shrink-0 bg-[var(--sidebar-bg)] hidden md:flex transition-colors duration-300">
            <div className="space-y-6">
              {(["GETTING STARTED", "AUTHENTICATION", "API ENDPOINTS", "PLAYGROUND"] as const).map((category) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-xs font-semibold text-brand-500/60 dark:text-brand-500/60 tracking-wider font-mono px-3">
                    {category}
                  </h3>
                  <ul className="space-y-1">
                    {sidebarItems
                      .filter((item) => item.category === category)
                      .map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        const isApi = item.category === "API ENDPOINTS";
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => setActiveSection(item.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                                isActive
                                  ? "bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/30"
                                  : "text-sage-700 dark:text-sage-400 hover:text-slate-900 dark:hover:text-sage-100 hover:bg-brand-900/10 border border-transparent"
                              }`}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand-500 dark:text-brand-400" : "text-sage-500"}`} />
                              <span className={isApi ? "font-mono text-xs" : "font-medium"}>
                                {item.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Sidebar Profile / Footer Logged In indicator */}
            {devSession && (
              <div className="border-t border-brand-200 dark:border-brand-900/40 pt-4 mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-peach-200 dark:bg-brand-950 flex items-center justify-center font-bold text-xs text-peach-700 dark:text-brand-300 border border-peach-300 dark:border-brand-900">
                    {devSession.orgName.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <span className="block text-xs font-semibold truncate text-foreground leading-tight">
                      {devSession.orgName}
                    </span>
                    <span className="block text-[10px] text-sage-500 truncate leading-none">
                      {devSession.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogOut}
                  title="Sign Out Console"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-sage-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </aside>

          {/* Content Panel */}
          <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto overflow-y-auto w-full">
            {activeSection === "dashboard" ? (
              // --- DEVELOPER HUB PORTAL DASHBOARD ---
              devSession === null ? (
                // Lacking session: render Signup/Login view
                <div className="max-w-md mx-auto my-12 glass-panel rounded-2xl overflow-hidden shadow-xl border border-brand-200 dark:border-brand-900">
                  <div className="flex border-b border-brand-200 dark:border-brand-900/40">
                    <button
                      onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                      className={`flex-1 py-3 text-center text-sm font-semibold transition-all ${
                        authMode === "signup"
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
                          : "text-sage-500 hover:text-foreground"
                      }`}
                    >
                      Create Developer ID
                    </button>
                    <button
                      onClick={() => { setAuthMode("login"); setAuthError(""); }}
                      className={`flex-1 py-3 text-center text-sm font-semibold transition-all ${
                        authMode === "login"
                          ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
                          : "text-sage-500 hover:text-foreground"
                      }`}
                    >
                      Developer Login
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold font-display text-foreground">
                        {authMode === "signup" ? "Get Credentials Credentials" : "Console Login"}
                      </h2>
                      <p className="text-xs text-sage-600 dark:text-sage-400 mt-1">
                        Access Client Keys, set redirect URIs, configure webhooks, and sync your settings.
                      </p>
                    </div>

                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <form onSubmit={authMode === "signup" ? handleRegister : handleLogin} className="space-y-4">
                      {authMode === "signup" && (
                        <div>
                          <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">ORGANIZATION NAME</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. UniHousing Agencies"
                            value={authOrgName}
                            onChange={(e) => setAuthOrgName(e.target.value)}
                            className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">DEVELOPER EMAIL</label>
                        <input
                          type="email"
                          required
                          placeholder="dev@unihousing.ng"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">PASSWORD</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        />
                      </div>

                      {authMode === "signup" && (
                        <div>
                          <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">CONFIRM PASSWORD</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white dark:text-[#090c08] font-bold rounded-lg transition-all text-sm mt-2 flex items-center justify-center gap-2"
                      >
                        {authMode === "signup" ? (
                          <>
                            <User className="w-4 h-4" />
                            Create Developer Profile
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Authorize Developer Session
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                // Session is active: Render settings tabs
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold font-display text-foreground">Developer Console</h1>
                      <p className="text-sage-600 dark:text-sage-300">
                        Manage app credentials, sync redirect URIs, configure webhooks and settings.
                      </p>
                    </div>
                  </div>

                  {/* Dashboard Tab headers */}
                  <div className="flex border-b border-brand-200 dark:border-brand-900/30 gap-2">
                    {[
                      { id: "credentials", label: "Credentials & Auth", icon: Key },
                      { id: "webhooks", label: "Webhooks Integration", icon: Globe },
                      { id: "settings", label: "Profile & Console", icon: Settings },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = dashboardTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setDashboardTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                            isActive
                              ? "border-brand-500 text-brand-500 dark:text-brand-400 bg-brand-950/10"
                              : "border-transparent text-sage-600 dark:text-sage-400 hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab: Credentials */}
                  {dashboardTab === "credentials" && (
                    <div className="space-y-6">
                      {/* Client ID / Secrets Card */}
                      <div className="glass-panel rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                          Client API Credentials
                        </h2>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">CLIENT ID</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={devSession.clientId}
                                className="flex-1 bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono select-all focus:outline-none"
                              />
                              <button
                                onClick={() => handleCopy(devSession.clientId, "client-id")}
                                className="px-3 py-1.5 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs font-mono transition-all flex items-center gap-1 shrink-0"
                              >
                                {copiedCode === "client-id" ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">CLIENT SECRET</label>
                            <div className="flex gap-2">
                              <input
                                type={showSecret ? "text" : "password"}
                                readOnly
                                value={devSession.clientSecret}
                                className="flex-1 bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono select-all focus:outline-none"
                              />
                              <button
                                onClick={() => setShowSecret(!showSecret)}
                                className="px-3 py-1.5 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs transition-all flex items-center justify-center shrink-0"
                              >
                                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleCopy(devSession.clientSecret, "client-secret")}
                                className="px-3 py-1.5 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs font-mono transition-all flex items-center gap-1 shrink-0"
                              >
                                {copiedCode === "client-secret" ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={handleRegenerateSecret}
                                className="px-3 py-1.5 bg-peach-500/10 dark:bg-peach-500/20 border border-peach-500/30 text-peach-600 dark:text-peach-400 hover:bg-peach-500/20 rounded-lg text-xs font-mono transition-all flex items-center gap-1 shrink-0"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Regen</span>
                              </button>
                            </div>
                            <span className="block text-[10px] text-peach-600 dark:text-peach-400 mt-1.5 font-mono">
                              WARNING: Keep this secret secure. Never share or expose it in client-side code.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scopes Config Card */}
                      <div className="glass-panel rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                          Allowed OAuth Scopes
                        </h2>
                        <div className="space-y-3">
                          <p className="text-xs text-sage-600 dark:text-sage-350">
                            Configure which resources your Client Secret is allowed to request during the OAuth token exchange flow.
                          </p>

                          <div className="space-y-2 pt-2">
                            {[
                              { key: "profile", label: "profile:read", desc: "Access basic profiles, user budget tag maps, and joint roommate details" },
                              { key: "verification", label: "verification:read", desc: "Verify student status badge logic, checks, and admin approvals status" },
                              { key: "network", label: "network:read", desc: "Retrieve shared co-tenants mutual networks between roommates" },
                            ].map((scopeItem) => (
                              <label key={scopeItem.key} className="flex items-start gap-3 text-sm cursor-pointer p-2.5 rounded-lg hover:bg-brand-500/5 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={devSession.scopes[scopeItem.key as keyof typeof devSession.scopes]}
                                  onChange={() => handleToggleScope(scopeItem.key as any)}
                                  className="accent-brand-500 mt-1"
                                />
                                <div>
                                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-300">{scopeItem.label}</span>
                                  <span className="block text-xs text-sage-500 mt-0.5">{scopeItem.desc}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Redirect URIs Array Manager */}
                      <div className="glass-panel rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                          OAuth Redirect Callback URIs
                        </h2>
                        
                        <div className="space-y-4">
                          <p className="text-xs text-sage-600 dark:text-sage-350">
                            Authorized callback redirect endpoints to return OAuth tokens and Authorization codes safely after logins.
                          </p>

                          {/* List registered URIs */}
                          <ul className="space-y-2">
                            {devSession.redirectUris.map((uri) => (
                              <li key={uri} className="flex items-center justify-between p-2.5 bg-[var(--console-bg)] border border-[var(--console-border)] rounded-lg text-xs font-mono">
                                <span className="truncate text-foreground pr-2">{uri}</span>
                                <button
                                  onClick={() => handleRemoveRedirectUri(uri)}
                                  disabled={devSession.redirectUris.length <= 1}
                                  className="p-1 rounded hover:bg-red-500/10 text-sage-400 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sage-400 transition-colors shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>

                          {/* Add URI field */}
                          <form onSubmit={handleAddRedirectUri} className="flex gap-2">
                            <input
                              type="url"
                              required
                              placeholder="https://my-agency.com/callback"
                              value={newRedirectUri}
                              onChange={(e) => setNewRedirectUri(e.target.value)}
                              className="flex-1 bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white dark:text-[#090c08] font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add URI</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Webhooks */}
                  {dashboardTab === "webhooks" && (
                    <div className="space-y-6">
                      <div className="glass-panel rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                          Webhooks Endpoint Configuration
                        </h2>

                        <div className="space-y-4">
                          <p className="text-xs text-sage-600 dark:text-sage-350">
                            Configure your backend URL. Roomie will POST real-time split rent clearance callbacks and roommate checkout approvals to this listener.
                          </p>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">WEBHOOK DESTINATION URL</label>
                              <input
                                type="url"
                                placeholder="https://my-agency.com/webhooks/roomie"
                                value={devSession.webhookUrl}
                                onChange={(e) => {
                                  const updatedUser = { ...devSession, webhookUrl: e.target.value };
                                  saveDashboardChanges(updatedUser);
                                }}
                                className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">SIGNING SECRET</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={devSession.webhookSecret}
                                  className="flex-1 bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono select-all focus:outline-none"
                                />
                                <button
                                  onClick={() => handleCopy(devSession.webhookSecret, "webhook-secret")}
                                  className="px-3 py-1.5 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs font-mono transition-all flex items-center gap-1 shrink-0"
                                >
                                  {copiedCode === "webhook-secret" ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>Copy</span>
                                </button>
                              </div>
                              <span className="block text-[10px] text-sage-500 mt-1 font-mono">
                                Use this key to hash incoming payloads and verify webhook authenticity.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Webhook Events selection */}
                      <div className="glass-panel rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                          Subscribe Webhook Events
                        </h2>
                        <div className="space-y-3">
                          <p className="text-xs text-sage-600 dark:text-sage-350">
                            Select which real-time event updates Roomie should forward to your webhook handler.
                          </p>

                          <div className="space-y-2 pt-2">
                            {[
                              { key: "splits", label: "split.payment.cleared", desc: "Sent when both roommates pay Paystack split shares, clearing rent/deposits" },
                              { key: "checkout", label: "checkout.consent.approved", desc: "Sent when co-roommates mutually approve checkout damage logs, unlocking refunds" }
                            ].map((evt) => (
                              <label key={evt.key} className="flex items-start gap-3 text-sm cursor-pointer p-2.5 rounded-lg hover:bg-brand-500/5 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={devSession.webhookEvents[evt.key as keyof typeof devSession.webhookEvents]}
                                  onChange={() => {
                                    const updatedUser = {
                                      ...devSession,
                                      webhookEvents: {
                                        ...devSession.webhookEvents,
                                        [evt.key]: !devSession.webhookEvents[evt.key as keyof typeof devSession.webhookEvents]
                                      }
                                    };
                                    saveDashboardChanges(updatedUser);
                                  }}
                                  className="accent-brand-500 mt-1"
                                />
                                <div>
                                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-300">{evt.label}</span>
                                  <span className="block text-xs text-sage-500 mt-0.5">{evt.desc}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab: Settings */}
                  {dashboardTab === "settings" && (
                    <div className="space-y-6">
                      <div className="glass-panel rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                          Developer Organization Profile
                        </h2>

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">ORGANIZATION NAME</label>
                            <input
                              type="text"
                              required
                              value={editOrgName}
                              onChange={(e) => setEditOrgName(e.target.value)}
                              className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1">DEVELOPER CONTACT EMAIL</label>
                            <input
                              type="email"
                              disabled
                              value={editEmail}
                              className="w-full bg-[var(--console-bg)] border border-brand-200 dark:border-brand-800/30 text-sage-500 rounded px-3 py-1.5 text-xs select-all focus:outline-none cursor-not-allowed"
                            />
                            <span className="block text-[10px] text-sage-500 mt-1 font-mono">
                              Contact Email is fixed to your account identifier.
                            </span>
                          </div>

                          <button
                            type="submit"
                            className="py-1.5 px-4 bg-brand-500 hover:bg-brand-600 text-white dark:text-[#090c08] font-bold rounded-lg text-xs transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save Profile Changes
                          </button>
                        </form>
                      </div>

                      {/* Log Out & Account Deletion Card */}
                      <div className="glass-panel rounded-xl p-6 space-y-4 border border-red-500/10">
                        <h2 className="text-lg font-bold font-display text-red-500 border-b border-red-500/10 pb-2">
                          Console System Actions & Danger Zone
                        </h2>
                        
                        <p className="text-xs text-sage-600 dark:text-sage-350">
                          Perform developer system actions, clear console session cache data, or permanently remove registered profiles.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <button
                            onClick={handleLogOut}
                            className="px-4 py-2 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out Session
                          </button>

                          <button
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-950/15 border border-red-500/30 text-red-500 hover:bg-red-950/25 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Developer Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : activeSection !== "sandbox" ? (
              // --- GENERAL MARKDOWN DOCUMENT VIEWER ---
              <div className="space-y-6">
                <article className={`prose ${theme === "dark" ? "prose-invert" : ""} max-w-none`}>
                  {renderMarkdown(DOCS_CONTENT[activeSection] || "")}
                </article>

                <div className="pt-8 mt-12 border-t border-brand-200 dark:border-brand-900/20 flex justify-between items-center text-sm text-sage-500 font-mono">
                  <span>Last updated: July 2026</span>
                  <a
                    href={`https://github.com/GIGS-Labzz/Roomie/edit/main/apps/docs/content/${activeSection}.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-brand-500 dark:text-brand-400 hover:text-brand-650 dark:hover:text-brand-300 hover:underline transition-colors"
                  >
                    Edit this page on GitHub
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              // --- SANDBOX VIEW ---
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-display text-foreground">Roomie API Sandbox</h1>
                    {devSession && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-brand-500/20 text-brand-500 bg-brand-500/5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Credentials Linked: {devSession.orgName}
                      </span>
                    )}
                  </div>
                  <p className="text-sage-600 dark:text-sage-300 mt-1">
                    Simulate REST API sequences interactively. View requests, webhooks, and returned JSON structures.
                  </p>
                </div>

                {/* Sandbox Tabs */}
                <div className="flex border-b border-brand-200 dark:border-brand-900/30 gap-2">
                  {[
                    { id: "oauth", label: "SSO & Passport", icon: Key },
                    { id: "splits", label: "Split Payments", icon: CreditCard },
                    { id: "checkout", label: "Checkout Consent", icon: CheckSquare },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = sandboxTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSandboxTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                          isActive
                            ? "border-brand-500 text-brand-500 dark:text-brand-400 bg-brand-950/10"
                            : "border-transparent text-sage-600 dark:text-sage-400 hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab: OAuth & Passport */}
                {sandboxTab === "oauth" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Controls */}
                    <div className="lg:col-span-7 space-y-6 glass-panel rounded-xl p-6">
                      <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                        SSO Simulator
                      </h2>

                      {oauthStep === 1 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1.5">CLIENT ID</label>
                              <input
                                type="text"
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1.5">CLIENT SECRET</label>
                              <input
                                type="text"
                                value={clientSecret}
                                onChange={(e) => setClientSecret(e.target.value)}
                                className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1.5">REDIRECT URI</label>
                            <input
                              type="text"
                              value={redirectUri}
                              onChange={(e) => setRedirectUri(e.target.value)}
                              className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-2">SCOPES (PERMISSION REQUESTS)</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2.5 text-sm text-sage-700 dark:text-sage-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={scopes.profile}
                                  onChange={(e) => setScopes({ ...scopes, profile: e.target.checked })}
                                  className="accent-brand-500"
                                />
                                <span>profile:read (Renter details & current roommate)</span>
                              </label>
                              <label className="flex items-center gap-2.5 text-sm text-sage-700 dark:text-sage-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={scopes.verification}
                                  onChange={(e) => setScopes({ ...scopes, verification: e.target.checked })}
                                  className="accent-brand-500"
                                />
                                <span>verification:read (Student verification state)</span>
                              </label>
                              <label className="flex items-center gap-2.5 text-sm text-sage-700 dark:text-sage-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={scopes.network}
                                  onChange={(e) => setScopes({ ...scopes, network: e.target.checked })}
                                  className="accent-brand-500"
                                />
                                <span>network:read (Mutual roommate numbers)</span>
                              </label>
                            </div>
                          </div>

                          <button
                            onClick={launchSSO}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white dark:text-[#090c08] font-bold rounded-lg transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Launch SSO Login Flow
                          </button>
                        </div>
                      )}

                      {oauthStep === 2 && (
                        <div className="space-y-4">
                          <div className="bg-brand-500/10 dark:bg-brand-950/20 border border-brand-500/20 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              User Signed In & Authorized Scopes
                            </div>
                            <p className="text-xs text-sage-600 dark:text-sage-300 leading-relaxed">
                              Roomie redirected back to Redirect Callback URL with code:
                            </p>
                            <div className="bg-[var(--input-bg)] border border-[var(--console-border)] p-2 rounded text-xs font-mono text-brand-600 dark:text-brand-300 break-all select-all">
                              {redirectUri}?code={authCode}
                            </div>
                          </div>

                          <button
                            onClick={swapCodeForToken}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-peach-500 hover:bg-peach-600 active:scale-95 text-white dark:text-[#090c08] font-bold rounded-lg transition-all"
                          >
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            Swap Auth Code for Token (POST /oauth/token)
                          </button>
                        </div>
                      )}

                      {oauthStep === 3 && (
                        <div className="space-y-4">
                          <div className="bg-brand-500/10 dark:bg-brand-950/20 border border-brand-500/20 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              OAuth Handshake Complete
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="block text-[10px] text-sage-400 font-mono">ACCESS TOKEN</span>
                                <span className="font-mono text-xs text-brand-600 dark:text-brand-300 break-all">{accessToken}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-sage-400 font-mono">TYPE / EXPIRES</span>
                                <span className="font-mono text-xs text-sage-700 dark:text-sage-200">Bearer / 900s</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={fetchPassport}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white dark:text-[#090c08] font-bold rounded-lg transition-all"
                            >
                              <Sparkles className="w-4 h-4" />
                              Request Renter Passport
                            </button>
                            <button
                              onClick={resetOauth}
                              className="px-4 py-2 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-sm transition-all"
                            >
                              Reset Flow
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Console Output */}
                    <div className="lg:col-span-5 flex flex-col bg-[var(--console-bg)] border border-[var(--console-border)] rounded-xl p-4 font-mono">
                      <div className="flex items-center gap-2 text-xs text-sage-650 dark:text-sage-400 border-b border-brand-200 dark:border-brand-900/30 pb-2 mb-4 shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Console Request & Response Output</span>
                      </div>
                      <div className="flex-1 overflow-y-auto text-xs space-y-4 min-h-[300px]">
                        {oauthStep === 1 && (
                          <div className="text-sage-500 italic">
                            Waiting for OAuth initiation... Launch SSO to start.
                          </div>
                        )}
                        
                        {oauthStep === 2 && (
                          <div className="space-y-2">
                            <div className="text-brand-600 dark:text-brand-400"># Swap code request payload</div>
                            <div className="text-[#c47e28] dark:text-[#eeba76]">POST /v1/oauth/token HTTP/1.1</div>
                            <div className="bg-[var(--input-bg)] p-2.5 rounded border border-[var(--console-border)] text-foreground whitespace-pre">
{`{
  "client_id": "${clientId}",
  "client_secret": "${clientSecret.substring(0, 8)}...",
  "code": "${authCode}",
  "redirect_uri": "${redirectUri}"
}`}
                            </div>
                          </div>
                        )}

                        {oauthStep === 3 && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="text-brand-600 dark:text-brand-400"># OAuth token response received</div>
                              <div className="text-brand-500 dark:text-[#8AAF6E]">HTTP/1.1 200 OK</div>
                              <div className="bg-[var(--input-bg)] p-2.5 rounded border border-[var(--console-border)] text-foreground whitespace-pre">
{`{
  "access_token": "${accessToken}",
  "token_type": "Bearer",
  "expires_in": 900,
  "refresh_token": "rm_rtk_mock...",
  "scope": [
    ${Object.keys(scopes).filter(k => scopes[k as keyof typeof scopes]).map(k => `"${k}:read"`).join(",\n    ")}
  ]
}`}
                              </div>
                            </div>

                            {profileData && (
                              <div className="space-y-2">
                                <div className="text-brand-650 dark:text-brand-400"># GET /v1/oauth/userinfo</div>
                                <div className="text-brand-500 dark:text-[#8AAF6E]">HTTP/1.1 200 OK</div>
                                <div className="bg-[var(--input-bg)] p-2.5 rounded border border-[var(--console-border)] text-foreground overflow-x-auto whitespace-pre">
                                  {JSON.stringify(profileData, null, 2)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Splits */}
                {sandboxTab === "splits" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Controls */}
                    <div className="lg:col-span-7 space-y-6 glass-panel rounded-xl p-6">
                      <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                        Rent Split Routing Setup
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1.5">
                            RENT INVOICE AMOUNT (₦)
                          </label>
                          <input
                            type="number"
                            value={invoiceAmount}
                            onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                            className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono text-sage-500 dark:text-sage-400 mb-1.5">
                            <span>ROOMMATE A RATIO: {splitRatioA}%</span>
                            <span>ROOMMATE B RATIO: {100 - splitRatioA}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="5"
                            value={splitRatioA}
                            onChange={(e) => setSplitRatioA(Number(e.target.value))}
                            className="w-full accent-brand-500 cursor-ew-resize bg-brand-500/10 dark:bg-brand-950/40 rounded-lg appearance-none h-2"
                          />
                        </div>

                        <div className="border border-brand-200 dark:border-brand-900/20 bg-brand-500/5 dark:bg-brand-950/10 rounded-lg p-4 space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">Calculated Split Splits</h4>
                          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div className="p-3 bg-[var(--input-bg)] rounded border border-brand-200 dark:border-brand-900/20">
                              <span className="block text-sage-600 dark:text-sage-400 mb-1">Roommate A (John)</span>
                              <span className="text-base text-brand-600 dark:text-brand-300 font-bold">
                                ₦{portionA.toLocaleString()}
                              </span>
                              <span className="block text-[10px] text-sage-500 mt-1">Subaccount: ACCT_JOHN_MOCK</span>
                              
                              <button
                                onClick={() => triggerPaySplit("A")}
                                disabled={roommateAPaid}
                                className={`w-full mt-2 py-1 px-2 rounded text-[10px] font-bold ${
                                  roommateAPaid
                                    ? "bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20 cursor-default"
                                    : "bg-brand-500 text-white dark:text-[#090c08] hover:bg-brand-600 active:scale-95 transition-all"
                                }`}
                              >
                                {roommateAPaid ? "✔ Portion Settled" : "Simulate Paystack Pay"}
                              </button>
                            </div>

                            <div className="p-3 bg-[var(--input-bg)] rounded border border-brand-200 dark:border-brand-900/20">
                              <span className="block text-sage-600 dark:text-sage-400 mb-1">Roommate B (Jane)</span>
                              <span className="text-base text-brand-600 dark:text-brand-300 font-bold">
                                ₦{portionB.toLocaleString()}
                              </span>
                              <span className="block text-[10px] text-sage-500 mt-1">Subaccount: ACCT_JANE_MOCK</span>

                              <button
                                onClick={() => triggerPaySplit("B")}
                                disabled={roommateBPaid}
                                className={`w-full mt-2 py-1 px-2 rounded text-[10px] font-bold ${
                                  roommateBPaid
                                    ? "bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20 cursor-default"
                                    : "bg-brand-500 text-white dark:text-[#090c08] hover:bg-brand-600 active:scale-95 transition-all"
                                }`}
                              >
                                {roommateBPaid ? "✔ Portion Settled" : "Simulate Paystack Pay"}
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={resetSplits}
                          className="w-full py-1.5 px-4 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs font-mono transition-all"
                        >
                          Reset Splits Sandbox
                        </button>
                      </div>
                    </div>

                    {/* Right Console Output */}
                    <div className="lg:col-span-5 flex flex-col bg-[var(--console-bg)] border border-[var(--console-border)] rounded-xl p-4 font-mono">
                      <div className="flex items-center gap-2 text-xs text-sage-650 dark:text-sage-400 border-b border-brand-200 dark:border-brand-900/30 pb-2 mb-4 shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Webhook Log & API Payload</span>
                      </div>
                      <div className="flex-1 overflow-y-auto text-xs space-y-4 min-h-[300px]">
                        <div className="space-y-2">
                          <div className="text-brand-600 dark:text-brand-400"># API Split Initialization Config</div>
                          <div className="text-[#c47e28] dark:text-[#eeba76]">POST /v1/splits HTTP/1.1</div>
                          <div className="bg-[var(--input-bg)] p-2.5 rounded border border-[var(--console-border)] text-foreground whitespace-pre">
{`{
  "connection_id": "conn-001928-xx8a",
  "title": "August Rent Invoice",
  "total_amount": ${totalAmountKobo},
  "is_housing_fee": true,
  "payment_reference": "landlord-tracking-ref-98213",
  "split_ratio": {
    "initiator": ${splitRatioA / 100},
    "acceptor": ${(100 - splitRatioA) / 100}
  }
}`}
                          </div>
                        </div>

                        {splitClearedWebhook ? (
                          <div className="space-y-2">
                            <div className="text-peach-600 dark:text-peach-400"># RECEIVED WEBHOOK EVENT</div>
                            <div className="text-brand-600 dark:text-brand-300">[HTTP POST] {devSession ? devSession.webhookUrl : "https://unihousing.ng/webhooks/roomie"}</div>
                            <div className="bg-[var(--input-bg)] p-2.5 rounded border border-brand-500/20 text-brand-600 dark:text-brand-300 overflow-x-auto whitespace-pre">
                              {JSON.stringify(splitClearedWebhook, null, 2)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sage-500 italic">
                            Click "Simulate Paystack Pay" for both roommates A & B to trigger payment clearance webhook.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Checkout Consent */}
                {sandboxTab === "checkout" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Controls */}
                    <div className="lg:col-span-7 space-y-6 glass-panel rounded-xl p-6">
                      <h2 className="text-lg font-bold font-display text-brand-650 dark:text-brand-300 border-b border-brand-200 dark:border-brand-900/20 pb-2">
                        Checkout Consent Simulator
                      </h2>

                      {checkoutStep === 1 && (
                        <div className="space-y-4">
                          <p className="text-xs text-sage-600 dark:text-sage-300 leading-relaxed">
                            Roommate A (Daniel) initiates checkout from the Roomie PWA by specifying planned date and state auditing checklist:
                          </p>

                          <div>
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-1.5">CHECKOUT DATE</label>
                            <input
                              type="date"
                              value={checkoutDate}
                              onChange={(e) => setCheckoutDate(e.target.value)}
                              className="w-full bg-[var(--input-bg)] border border-brand-200 dark:border-brand-800/30 text-foreground rounded px-3 py-1.5 text-xs font-mono focus:border-brand-500 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs font-mono text-sage-500 dark:text-sage-400 mb-2">CHECKLIST AUDITING</label>
                            <label className="flex items-center gap-2.5 text-sm text-sage-700 dark:text-sage-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={billsSettled}
                                onChange={(e) => setBillsSettled(e.target.checked)}
                                className="accent-brand-500"
                              />
                              <span>All shared room bills fully settled</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-sm text-sage-700 dark:text-sage-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={keysReturned}
                                onChange={(e) => setKeysReturned(e.target.checked)}
                                className="accent-brand-500"
                              />
                              <span>Keys cleaned and returned to box</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-sm text-sage-700 dark:text-sage-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={noDamages}
                                onChange={(e) => setNoDamages(e.target.checked)}
                                className="accent-brand-500"
                              />
                              <span>No room damages occurred (locks/tiles)</span>
                            </label>
                          </div>

                          <button
                            onClick={initiateCheckout}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white dark:text-[#090c08] font-bold rounded-lg transition-all"
                          >
                            <Play className="w-4 h-4" />
                            Initiate Checkout Request
                          </button>
                        </div>
                      )}

                      {checkoutStep === 2 && (
                        <div className="space-y-4">
                          <div className="bg-peach-200/10 dark:bg-brand-950/20 border border-peach-500/20 dark:border-brand-500/20 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-peach-600 dark:text-peach-300 font-medium text-sm">
                              <Info className="w-4 h-4" />
                              Pending Roommate B Consent
                            </div>
                            <p className="text-xs text-sage-605 dark:text-sage-300 leading-relaxed">
                              Roommate B (Chidi) must approve checkout requests before the safety caution splits are triggered:
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => approveCheckout(true)}
                              className="flex-1 py-2 px-4 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white dark:text-[#090c08] font-bold rounded-lg transition-all text-sm"
                            >
                              Approve Daniel's Checkout
                            </button>
                            <button
                              onClick={() => approveCheckout(false)}
                              className="py-2 px-4 bg-red-950/10 dark:bg-red-950/20 border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-950/30 rounded-lg text-sm transition-all"
                            >
                              Reject Checkout
                            </button>
                          </div>
                        </div>
                      )}

                      {checkoutStep === 3 && (
                        <div className="space-y-4">
                          <div className="bg-brand-500/10 dark:bg-brand-950/20 border border-brand-500/20 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              Checkout Consent Fully Approved!
                            </div>
                            <p className="text-xs text-sage-605 dark:text-sage-300 leading-relaxed">
                              Webhooks sent. The caution refunds can now split back in safety.
                            </p>
                          </div>

                          <button
                            onClick={resetCheckout}
                            className="w-full py-1.5 px-4 bg-brand-900/10 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30 text-brand-600 dark:text-brand-400 hover:bg-brand-900/20 rounded-lg text-xs font-mono transition-all"
                          >
                            Restart Checkout Simulation
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Console Output */}
                    <div className="lg:col-span-5 flex flex-col bg-[var(--console-bg)] border border-[var(--console-border)] rounded-xl p-4 font-mono">
                      <div className="flex items-center gap-2 text-xs text-sage-655 dark:text-sage-400 border-b border-brand-200 dark:border-brand-900/30 pb-2 mb-4 shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Webhook Log & Status API</span>
                      </div>
                      <div className="flex-1 overflow-y-auto text-xs space-y-4 min-h-[300px]">
                        {checkoutStep === 1 && (
                          <div className="text-sage-500 italic">
                            Configure the checklist and click "Initiate Checkout Request" to run.
                          </div>
                        )}

                        {checkoutStep === 2 && (
                          <div className="space-y-2">
                            <div className="text-brand-600 dark:text-brand-400"># API Database Request Status</div>
                            <div className="bg-[var(--input-bg)] p-2.5 rounded border border-[var(--console-border)] text-foreground whitespace-pre">
{`{
  "request_id": "checkout-req-uuid-1123",
  "status": "INITIATED",
  "checkout_date": "${checkoutDate}",
  "checklist": {
    "bills_settled": ${billsSettled},
    "keys_returned": ${keysReturned},
    "no_damages": ${noDamages}
  }
}`}
                            </div>
                          </div>
                        )}

                        {checkoutStep === 3 && checkoutWebhook && (
                          <div className="space-y-2">
                            <div className="text-brand-600 dark:text-brand-400"># RECEIVED WEBHOOK EVENT</div>
                            <div className="text-brand-600 dark:text-brand-300">[HTTP POST] {devSession ? devSession.webhookUrl : "https://unihousing.ng/webhooks/roomie"}</div>
                            <div className="bg-[var(--input-bg)] p-2.5 rounded border border-brand-500/20 text-brand-600 dark:text-brand-300 overflow-x-auto whitespace-pre">
                              {JSON.stringify(checkoutWebhook, null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Mock SSO Consent Modal */}
        {showOauthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[var(--sidebar-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Logo size="xs" variant={theme === "dark" ? "light" : "default"} showWordmark={true} className="logo-container-docs" />
                  <span className="text-xs text-brand-500 font-mono ml-1 px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">SSO Connect</span>
                </div>
                <button 
                  onClick={() => setShowOauthModal(false)}
                  className="text-sage-500 hover:text-foreground transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold font-display text-foreground">
                  Authorize Partner Integration
                </h3>
                <p className="text-xs text-sage-600 dark:text-sage-400">
                  A housing provider wants to connect with your Roomie ID to establish your shared tenancy passport.
                </p>
              </div>

              <div className="bg-brand-500/5 dark:bg-brand-950/20 border border-brand-500/15 rounded-lg p-4 space-y-3">
                <span className="block text-[10px] text-brand-650 dark:text-brand-500/70 font-mono font-semibold uppercase tracking-wider">
                  This app will have access to:
                </span>
                <ul className="space-y-2 text-xs text-sage-700 dark:text-sage-300">
                  {scopes.profile && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Your renter profile details & verified roommate identifier</span>
                    </li>
                  )}
                  {scopes.verification && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Your school student identity verification details</span>
                    </li>
                  )}
                  {scopes.network && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Mutual connections networks and degree stats</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAuthorize}
                  className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white dark:text-[#090c08] font-bold rounded-xl text-sm transition-all"
                >
                  Allow Access & Authorize
                </button>
                <button
                  onClick={() => setShowOauthModal(false)}
                  className="flex-1 py-2 bg-brand-900/10 dark:bg-brand-900/20 hover:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl text-sm transition-all border border-brand-200 dark:border-brand-800/30"
                >
                  Deny Access
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-brand-500 text-white dark:text-slate-900 text-xs px-4.5 py-2.5 rounded-xl font-mono shadow-brutal dark:shadow-brutal bg-[#8AAF6E] flex items-center gap-2 border-2 border-slate-900">
            <CheckCircle2 className="w-4 h-4 text-white dark:text-slate-900" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
