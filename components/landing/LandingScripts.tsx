"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

declare global {
  interface Window {
    a2zCookies?: CookiePreferences;
    scrollToSection?: (sectionId: string) => void;
    switchScope?: (scopeId: string) => void;
    toggleFaq?: (item: HTMLElement) => void;
    submitDemoForm?: (event: Event) => Promise<void>;
  }
}

function getInput(id: string): HTMLInputElement | null {
  const node = document.getElementById(id);
  return node instanceof HTMLInputElement ? node : null;
}

function getSelect(id: string): HTMLSelectElement | null {
  const node = document.getElementById(id);
  return node instanceof HTMLSelectElement ? node : null;
}

function setFieldInvalidState(
  field: HTMLInputElement | HTMLSelectElement | null,
  isInvalid: boolean,
) {
  if (!field) {
    return;
  }

  field.classList.toggle("field-invalid", isInvalid);
  field.setAttribute("aria-invalid", isInvalid ? "true" : "false");
}

function ensureStatusNode(container: ParentNode | null): HTMLParagraphElement | null {
  if (!container) {
    return null;
  }

  const existing = document.getElementById("df-status");
  if (existing instanceof HTMLParagraphElement) {
    return existing;
  }

  const statusNode = document.createElement("p");
  statusNode.id = "df-status";
  statusNode.className = "df-note";
  statusNode.setAttribute("role", "status");
  container.appendChild(statusNode);
  return statusNode;
}

export default function LandingScripts() {
  useEffect(() => {
    const cleanupFns: Array<() => void> = [];
    const observers: Array<{ disconnect: () => void }> = [];
    const cookieKey = "a2z_cookies";

    /**
     * Public landing interactions stay in one controller so the public markup
     * can remain declarative while behavior stays typed, reviewable, and free
     * of inline script attributes.
     */
    const cookieBanner = document.getElementById("cookie-banner");
    const cookieActions = cookieBanner?.querySelector(".ck-actions");
    const cookieAccept = document.getElementById("cookie-accept");
    const cookieSave = document.getElementById("cookie-save");
    const cookieReject = document.getElementById("cookie-reject");
    const analyticsToggle = getInput("ck-analytics");
    const marketingToggle = getInput("ck-marketing");
    const mainNav = document.getElementById("main-nav");
    let cookieTimeout: number | null = null;

    const readCookiePreferences = (): CookiePreferences | null => {
      try {
        const rawValue = localStorage.getItem(cookieKey);
        if (!rawValue) {
          return null;
        }

        const parsed = JSON.parse(rawValue) as Partial<CookiePreferences>;
        return {
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          ts: typeof parsed.ts === "number" ? parsed.ts : Date.now(),
        };
      } catch {
        return null;
      }
    };

    const hideCookieBanner = () => cookieBanner?.classList.remove("show");
    const showCookieBanner = () => cookieBanner?.classList.add("show");

    const persistCookiePreferences = (
      analytics: boolean,
      marketing: boolean,
    ) => {
      const preferences: CookiePreferences = {
        necessary: true,
        analytics,
        marketing,
        ts: Date.now(),
      };

      try {
        localStorage.setItem(cookieKey, JSON.stringify(preferences));
      } catch {
        // The banner should still close even if storage is unavailable.
      }

      window.a2zCookies = preferences;
      hideCookieBanner();
    };

    const savedPreferences = readCookiePreferences();
    if (savedPreferences) {
      window.a2zCookies = savedPreferences;
      if (analyticsToggle) {
        analyticsToggle.checked = savedPreferences.analytics;
      }
      if (marketingToggle) {
        marketingToggle.checked = savedPreferences.marketing;
      }
    } else {
      cookieTimeout = window.setTimeout(showCookieBanner, 500);
    }

    if (cookieBanner && cookieActions && window.innerWidth <= 640) {
      const existingManageButton = cookieBanner.querySelector(".ck-manage-mobile");
      if (!existingManageButton) {
        const manageButton = document.createElement("button");
        manageButton.type = "button";
        manageButton.className = "ck-manage-mobile";
        manageButton.textContent = "Manage";
        manageButton.setAttribute("aria-expanded", "false");

        const handleManage = () => {
          const isExpanded = cookieBanner.classList.toggle("expanded");
          manageButton.textContent = isExpanded ? "Close" : "Manage";
          manageButton.setAttribute("aria-expanded", String(isExpanded));
        };

        manageButton.addEventListener("click", handleManage);
        cleanupFns.push(() => manageButton.removeEventListener("click", handleManage));
        cookieActions.insertBefore(manageButton, cookieActions.firstChild);
      }
    }

    const handleCookieAccept = () => {
      if (analyticsToggle) {
        analyticsToggle.checked = true;
      }
      if (marketingToggle) {
        marketingToggle.checked = true;
      }
      cookieBanner?.classList.remove("expanded");
      persistCookiePreferences(true, true);
    };

    const handleCookieSave = () => {
      cookieBanner?.classList.remove("expanded");
      persistCookiePreferences(
        analyticsToggle?.checked ?? false,
        marketingToggle?.checked ?? false,
      );
    };

    const handleCookieReject = () => {
      if (analyticsToggle) {
        analyticsToggle.checked = false;
      }
      if (marketingToggle) {
        marketingToggle.checked = false;
      }
      cookieBanner?.classList.remove("expanded");
      persistCookiePreferences(false, false);
    };

    cookieAccept?.addEventListener("click", handleCookieAccept);
    cookieSave?.addEventListener("click", handleCookieSave);
    cookieReject?.addEventListener("click", handleCookieReject);
    cleanupFns.push(() => cookieAccept?.removeEventListener("click", handleCookieAccept));
    cleanupFns.push(() => cookieSave?.removeEventListener("click", handleCookieSave));
    cleanupFns.push(() => cookieReject?.removeEventListener("click", handleCookieReject));

    const scrollToSection = (sectionId: string) => {
      const target = document.getElementById(sectionId);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const switchScope = (scopeId: string) => {
      document.querySelectorAll<HTMLElement>(".stab[data-scope-target]").forEach((tab) => {
        const isActive = tab.dataset.scopeTarget === scopeId;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      document.querySelectorAll<HTMLElement>(".sp[data-scope-panel]").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.scopePanel === scopeId);
      });
    };

    const toggleFaq = (item: HTMLElement) => {
      const wasOpen = item.classList.contains("open");

      document.querySelectorAll<HTMLElement>(".fq[data-faq-toggle='true']").forEach((faq) => {
        faq.classList.remove("open");
        faq.setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        item.classList.add("open");
        item.setAttribute("aria-expanded", "true");
      }
    };

    window.a2zCookies = savedPreferences ?? undefined;
    window.scrollToSection = scrollToSection;
    window.switchScope = switchScope;
    window.toggleFaq = toggleFaq;

    document
      .querySelectorAll<HTMLElement>("[data-scroll-target]")
      .forEach((button) => {
        const handleClick = () => {
          const sectionId = button.dataset.scrollTarget;
          if (sectionId) {
            scrollToSection(sectionId);
          }
        };

        button.addEventListener("click", handleClick);
        cleanupFns.push(() => button.removeEventListener("click", handleClick));
      });

    document
      .querySelectorAll<HTMLElement>("[data-scope-target]")
      .forEach((button) => {
        const handleClick = () => {
          const scopeId = button.dataset.scopeTarget;
          if (scopeId) {
            switchScope(scopeId);
          }
        };

        button.addEventListener("click", handleClick);
        cleanupFns.push(() => button.removeEventListener("click", handleClick));
      });

    document
      .querySelectorAll<HTMLElement>(".fq[data-faq-toggle='true']")
      .forEach((item) => {
        const handleClick = () => toggleFaq(item);
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleFaq(item);
          }
        };

        item.addEventListener("click", handleClick);
        item.addEventListener("keydown", handleKeyDown);
        cleanupFns.push(() => item.removeEventListener("click", handleClick));
        cleanupFns.push(() => item.removeEventListener("keydown", handleKeyDown));
      });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("vis");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observers.push(revealObserver);
    document.querySelectorAll(".rev").forEach((element) => revealObserver.observe(element));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          const target = Number.parseFloat(element.dataset.target ?? "0");
          const decimals = Number.parseInt(element.dataset.dec ?? "0", 10);
          const duration = 1400;
          const start = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = (target * eased).toFixed(decimals);

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              element.textContent = target.toFixed(decimals);
            }
          };

          requestAnimationFrame(tick);
          counterObserver.unobserve(element);
        });
      },
      { threshold: 0.5 },
    );
    observers.push(counterObserver);
    document.querySelectorAll(".cu").forEach((element) => counterObserver.observe(element));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const sectionId = entry.target.id;
          document.querySelectorAll<HTMLElement>(".btb-item").forEach((item) => {
            item.classList.toggle("active", item.dataset.scrollTarget === sectionId);
          });
        });
      },
      { threshold: 0.4 },
    );
    observers.push(sectionObserver);
    ["home", "platform", "amine", "ccs"].forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        sectionObserver.observe(section);
      }
    });

    const handleNavScroll = () => {
      mainNav?.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    cleanupFns.push(() => window.removeEventListener("scroll", handleNavScroll));
    handleNavScroll();

    /**
     * The public demo form writes into the live `leads` table today.
     * Because the current landing form is richer than the checked-in schema,
     * additional booking details are packed into the `source` field until the
     * later DB follow-up adds a dedicated intake contract.
     */
    const demoForm = document.getElementById("demo-form");
    const demoFormWrap = document.getElementById("demo-form-wrap");
    const demoSuccess = document.getElementById("df-success");
    const statusNode = ensureStatusNode(demoFormWrap);
    const submitButton = document.getElementById("df-submit");
    const submitButtonLabel = document.getElementById("df-btn-text");

    const setStatus = (tone: "warning" | "success", message: string) => {
      if (!statusNode) {
        return;
      }

      statusNode.textContent = message;
      statusNode.classList.remove("status-warning", "status-success");
      statusNode.classList.add(tone === "warning" ? "status-warning" : "status-success");
    };

    const clearStatus = () => {
      if (!statusNode) {
        return;
      }

      statusNode.textContent = "";
      statusNode.classList.remove("status-warning", "status-success");
    };

    const submitDemoForm = async (event: Event) => {
      event.preventDefault();

      const firstName = getInput("df-fname");
      const lastName = getInput("df-lname");
      const email = getInput("df-email");
      const company = getInput("df-company");
      const phone = getInput("df-phone");
      const interest = getSelect("df-interest");
      const sector = getSelect("df-sector");
      const consent = getInput("df-consent");

      const firstNameValue = firstName?.value.trim() ?? "";
      const lastNameValue = lastName?.value.trim() ?? "";
      const emailValue = email?.value.trim().toLowerCase() ?? "";
      const companyValue = company?.value.trim() ?? "";
      const phoneValue = phone?.value.trim() ?? "";
      const interestValue = interest?.value ?? "";
      const sectorValue = sector?.value ?? "";
      const hasConsent = consent?.checked ?? false;

      const requiredFieldResults = [
        [firstName, firstNameValue.length === 0],
        [lastName, lastNameValue.length === 0],
        [email, emailValue.length === 0],
        [company, companyValue.length === 0],
        [interest, interestValue.length === 0],
      ] as const;

      requiredFieldResults.forEach(([field, isInvalid]) => {
        setFieldInvalidState(field, isInvalid);
      });
      setFieldInvalidState(sector, false);

      if (requiredFieldResults.some(([, isInvalid]) => isInvalid)) {
        clearStatus();
        setStatus("warning", "Complete every required booking field before submitting the request.");
        return;
      }

      const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
      if (!emailLooksValid) {
        setFieldInvalidState(email, true);
        clearStatus();
        setStatus("warning", "Enter a valid work email so the team can confirm your demo slot.");
        return;
      }

      if (!hasConsent) {
        clearStatus();
        setStatus("warning", "Confirm privacy consent before sending the booking request.");
        consent?.focus();
        return;
      }

      clearStatus();

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
      }
      if (submitButtonLabel) {
        submitButtonLabel.textContent = "Booking demo...";
      }

      const sourcePayload = JSON.stringify({
        form: "landing-page",
        first_name: firstNameValue,
        last_name: lastNameValue,
        company: companyValue,
        phone: phoneValue || null,
        interest: interestValue,
      });

      const insertPayload: Record<string, string | boolean | null> = {
        email: emailValue,
        product_label: companyValue,
        cn_code: interestValue,
        consent_accepted: true,
        source: sourcePayload,
      };

      if (sectorValue) {
        insertPayload.sector = sectorValue;
      }

      const { error } = await supabase.from("leads").insert(insertPayload);

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
      if (submitButtonLabel) {
        submitButtonLabel.textContent = "Book My Demo ->";
      }

      if (error) {
        clearStatus();
        setStatus(
          "warning",
          "The booking request could not be saved right now. Please try again shortly or contact the team directly.",
        );
        return;
      }

      demoFormWrap?.classList.add("is-hidden");
      demoSuccess?.classList.add("show");
      clearStatus();
      if (demoForm instanceof HTMLFormElement) {
        demoForm.reset();
      }
    };

    window.submitDemoForm = submitDemoForm;

    if (demoForm instanceof HTMLFormElement) {
      demoForm.addEventListener("submit", submitDemoForm);
      cleanupFns.push(() => demoForm.removeEventListener("submit", submitDemoForm));
    }

    return () => {
      if (cookieTimeout !== null) {
        window.clearTimeout(cookieTimeout);
      }

      observers.forEach((observer) => observer.disconnect());
      cleanupFns.forEach((cleanup) => cleanup());

      delete window.scrollToSection;
      delete window.switchScope;
      delete window.toggleFaq;
      delete window.submitDemoForm;
    };
  }, []);

  return null;
}
