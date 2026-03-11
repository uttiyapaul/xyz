"use client";

import { useEffect } from "react";

type Cleanup = () => void;

export default function LandingScripts() {
  useEffect(() => {
    const cleanups: Cleanup[] = [];
    const mainEl = document.getElementById("main");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyS3Widths = () => {
      document.querySelectorAll<HTMLElement>(".s3-fill").forEach((bar) => {
        const width = bar.dataset.width;
        if (width) bar.style.width = `${width}%`;
      });
    };

    const animateCounter = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.target ?? "0");
      const decimals = parseInt(el.dataset.dec ?? "0", 10);
      if (Number.isNaN(target)) return;
      if (prefersReduced) {
        el.textContent =
          decimals > 0 ? target.toFixed(decimals) : Math.round(target).toLocaleString("en-IN");
        el.dataset.animated = "true";
        return;
      }
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent =
          decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-IN");
        if (progress < 1) requestAnimationFrame(tick);
        else el.dataset.animated = "true";
      };
      requestAnimationFrame(tick);
    };

    const coerceValue = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return "";
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;
      const numeric = Number(trimmed.replace(/,/g, ""));
      if (!Number.isNaN(numeric) && trimmed.match(/^-?\d+(\.\d+)?$/)) return numeric;
      return trimmed;
    };

    const parseCsv = (text: string) => {
      const rows: string[][] = [];
      let current = "";
      let row: string[] = [];
      let inQuotes = false;
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        if (char === "\"") {
          if (inQuotes && text[i + 1] === "\"") {
            current += "\"";
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          row.push(current);
          current = "";
        } else if ((char === "\n" || char === "\r") && !inQuotes) {
          if (char === "\r" && text[i + 1] === "\n") i += 1;
          row.push(current);
          if (row.some((cell) => cell.trim() !== "")) rows.push(row);
          row = [];
          current = "";
        } else {
          current += char;
        }
      }
      if (current.length || row.length) {
        row.push(current);
        if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      }
      const headers = rows.shift()?.map((h) => h.trim()) ?? [];
      return rows.map((cells) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header] = (cells[index] ?? "").trim();
        });
        return obj;
      });
    };

    const setByPath = (obj: Record<string, any>, path: string, value: any) => {
      const segments: Array<string | number> = [];
      const regex = /([^[.\]]+)|\[(\d+)\]/g;
      let match: RegExpExecArray | null = regex.exec(path);
      while (match) {
        if (match[1]) segments.push(match[1]);
        if (match[2]) segments.push(Number(match[2]));
        match = regex.exec(path);
      }
      let cursor: any = obj;
      segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        if (isLast) {
          cursor[segment] = value;
          return;
        }
        if (cursor[segment] == null) {
          cursor[segment] = typeof segments[index + 1] === "number" ? [] : {};
        }
        cursor = cursor[segment];
      });
    };

    const getByPath = (obj: any, path?: string) => {
      if (!obj || !path) return undefined;
      return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    };

    const metricsFromCsv = (rows: Array<Record<string, string>>) => {
      const metrics: Record<string, any> = {};
      rows.forEach((row) => {
        const path = row.path || row.Path || row.metric || "";
        const raw = row.value || row.Value || "";
        if (!path) return;
        setByPath(metrics, path, coerceValue(raw));
      });
      return metrics;
    };

    const fetchMetrics = async () => {
      const endpoint =
        mainEl?.dataset.metricsEndpoint ||
        (window as Window & { __XYZ_METRICS_ENDPOINT__?: string }).__XYZ_METRICS_ENDPOINT__ ||
        "/data/client-metrics.json";
      const dataType =
        mainEl?.dataset.metricsType || (endpoint.toLowerCase().endsWith(".csv") ? "csv" : "json");
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) return null;
        const text = await response.text();
        if (dataType === "csv") {
          const rows = parseCsv(text);
          return metricsFromCsv(rows);
        }
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    const updateLogos = (container: HTMLElement | null, logos?: string[]) => {
      if (!container || !logos || !logos.length) return;
      container.innerHTML = "";
      logos.forEach((logo) => {
        const span = document.createElement("span");
        span.textContent = logo;
        container.appendChild(span);
      });
    };

    const updateKpis = (scopeId: string, kpis?: Array<Record<string, any>>) => {
      if (!kpis || !kpis.length) return;
      const row = document.querySelector<HTMLElement>(`#scope-${scopeId} .kpi-row`);
      if (!row) return;
      const cards = Array.from(row.querySelectorAll<HTMLElement>(".kpi-card"));
      kpis.forEach((kpi, index) => {
        const card = cards[index];
        if (!card) return;
        const labelEl = card.querySelector<HTMLElement>(".kpi-label");
        const valueEl = card.querySelector<HTMLElement>(".kpi-val");
        const trendEl = card.querySelector<HTMLElement>(".kpi-trend");
        if (labelEl && kpi.label) labelEl.textContent = String(kpi.label);
        if (valueEl && kpi.value !== undefined) valueEl.textContent = String(kpi.value);
        if (trendEl && kpi.trend) trendEl.textContent = String(kpi.trend);
        if (trendEl && kpi.trendClass) {
          trendEl.classList.remove("t-up", "t-down", "t-flat");
          trendEl.classList.add(kpi.trendClass);
        }
      });
    };

    const statusClass = (status?: string) => {
      const value = (status ?? "").toLowerCase();
      if (value.includes("verified")) return "pill-v";
      if (value.includes("pending")) return "pill-p";
      if (value.includes("complete")) return "pill-c";
      return "pill-p";
    };

    const createCell = (value: string, className?: string) => {
      const td = document.createElement("td");
      if (className) td.className = className;
      td.textContent = value;
      return td;
    };

    const createStatusCell = (status?: string) => {
      const td = document.createElement("td");
      const pill = document.createElement("span");
      pill.className = `pill ${statusClass(status)}`;
      pill.textContent = status ?? "";
      td.appendChild(pill);
      return td;
    };

    const renderScope1Table = (rows?: Array<Record<string, any>>, total?: Record<string, any>) => {
      const body = document.getElementById("scope1-body");
      if (!body || !rows || !rows.length) return;
      body.innerHTML = "";
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.append(
          createCell(String(row.site ?? "")),
          createCell(String(row.source ?? "")),
          createCell(String(row.emissions ?? ""), "mono"),
          createCell(String(row.cbamPct ?? ""), "mono"),
          createStatusCell(row.status)
        );
        body.appendChild(tr);
      });
      if (total) {
        const tr = document.createElement("tr");
        tr.className = "total-row";
        const labelCell = document.createElement("td");
        labelCell.colSpan = 2;
        const strong = document.createElement("strong");
        strong.textContent = "Total Scope 1";
        labelCell.appendChild(strong);
        tr.append(
          labelCell,
          createCell(String(total.emissions ?? ""), "mono"),
          createCell(String(total.cbamPct ?? ""), "mono"),
          createStatusCell(total.status)
        );
        body.appendChild(tr);
      }
    };

    const renderScope2Table = (rows?: Array<Record<string, any>>, total?: Record<string, any>) => {
      const body = document.getElementById("scope2-body");
      if (!body || !rows || !rows.length) return;
      body.innerHTML = "";
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.append(
          createCell(String(row.site ?? "")),
          createCell(String(row.source ?? "")),
          createCell(String(row.locationBased ?? ""), "mono"),
          createCell(String(row.marketBased ?? ""), "mono"),
          createStatusCell(row.status)
        );
        body.appendChild(tr);
      });
      if (total) {
        const tr = document.createElement("tr");
        tr.className = "total-row";
        const labelCell = document.createElement("td");
        labelCell.colSpan = 2;
        const strong = document.createElement("strong");
        strong.textContent = "Total Scope 2";
        labelCell.appendChild(strong);
        tr.append(
          labelCell,
          createCell(String(total.locationBased ?? ""), "mono"),
          createCell(String(total.marketBased ?? ""), "mono"),
          createStatusCell(total.status)
        );
        body.appendChild(tr);
      }
    };

    const renderScope3Bars = (bars?: Array<Record<string, any>>) => {
      const container = document.getElementById("scope3-bars");
      if (!container || !bars || !bars.length) return;
      container.innerHTML = "";
      bars.forEach((bar) => {
        const row = document.createElement("div");
        row.className = "s3-row";
        const label = document.createElement("div");
        label.className = "s3-label";
        label.textContent = String(bar.label ?? "");
        const track = document.createElement("div");
        track.className = "s3-track";
        const fill = document.createElement("div");
        fill.className = "s3-fill";
        if (bar.width !== undefined) fill.dataset.width = String(bar.width);
        track.appendChild(fill);
        const value = document.createElement("div");
        value.className = "s3-val";
        value.textContent = String(bar.value ?? "");
        row.append(label, track, value);
        container.appendChild(row);
      });
      applyS3Widths();
    };

    const applyMetrics = async () => {
      const metrics = await fetchMetrics();
      if (!metrics) return;

      const proofLabel = document.getElementById("proof-label");
      if (metrics.proof?.label && proofLabel) {
        proofLabel.textContent = String(metrics.proof.label);
      }
      updateLogos(document.getElementById("proof-logos"), metrics.proof?.logos);

      document.querySelectorAll<HTMLElement>(".counter[data-metric]").forEach((el) => {
        const value = getByPath(metrics, el.dataset.metric);
        if (value === undefined || value === null) return;
        const metricValue = typeof value === "object" && "value" in value ? value.value : value;
        const metricDecimals =
          typeof value === "object" && value && "decimals" in value ? value.decimals : undefined;
        if (metricValue !== undefined) el.dataset.target = String(metricValue);
        if (metricDecimals !== undefined) el.dataset.dec = String(metricDecimals);
        if (el.dataset.animated === "true") animateCounter(el);
      });

      if (metrics.client?.solutionTitle) {
        const solutionTitle = document.getElementById("solution-h2");
        if (solutionTitle) solutionTitle.textContent = String(metrics.client.solutionTitle);
      }
      if (metrics.client?.solutionSub) {
        const solutionSub = document.getElementById("solution-sub");
        if (solutionSub) solutionSub.textContent = String(metrics.client.solutionSub);
      }
      if (metrics.client?.mockupOrg) {
        const mockupOrg = document.getElementById("mockup-org");
        if (mockupOrg) mockupOrg.textContent = String(metrics.client.mockupOrg);
      }

      updateKpis("s1", metrics.scope1?.kpis);
      updateKpis("s2", metrics.scope2?.kpis);
      updateKpis("s3", metrics.scope3?.kpis);

      renderScope1Table(metrics.scope1?.rows, metrics.scope1?.total);
      renderScope2Table(metrics.scope2?.rows, metrics.scope2?.total);
      renderScope3Bars(metrics.scope3?.bars);

      if (metrics.results?.tag) {
        const resultsTag = document.getElementById("results-tag");
        if (resultsTag) resultsTag.textContent = String(metrics.results.tag);
      }
      if (metrics.results?.quote) {
        const resultsQuote = document.getElementById("results-h2");
        if (resultsQuote) resultsQuote.textContent = String(metrics.results.quote);
      }
      if (metrics.results?.author) {
        const resultsAuthor = document.getElementById("results-author");
        if (resultsAuthor) resultsAuthor.textContent = String(metrics.results.author);
      }
      if (metrics.results?.authorOrg) {
        const resultsOrg = document.getElementById("results-author-org");
        if (resultsOrg) resultsOrg.textContent = String(metrics.results.authorOrg);
      }
      if (Array.isArray(metrics.results?.stats)) {
        const resultsStats = document.getElementById("results-stats");
        if (resultsStats) {
          resultsStats.innerHTML = "";
          metrics.results.stats.forEach((stat: Record<string, any>) => {
            const item = document.createElement("div");
            item.setAttribute("role", "listitem");
            const value = document.createElement("span");
            value.className = "rstat-val";
            value.textContent = String(stat.value ?? "");
            const label = document.createElement("span");
            label.className = "rstat-label";
            label.textContent = String(stat.label ?? "");
            item.append(value, label);
            resultsStats.appendChild(item);
          });
        }
      }
    };

    void applyMetrics();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const nav = document.querySelector<HTMLElement>(".nav");
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (revealEls.length) {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => revealObs.observe(el));
      cleanups.push(() => revealObs.disconnect());
    }

    const counters = Array.from(document.querySelectorAll<HTMLElement>(".counter"));
    if (counters.length) {
      const counterObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target as HTMLElement);
              counterObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      counters.forEach((el) => counterObs.observe(el));
      cleanups.push(() => counterObs.disconnect());
    }

    const faqItems = Array.from(document.querySelectorAll<HTMLElement>(".faq-item"));
    const handleFaqToggle = (item: HTMLElement) => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((el) => {
        el.classList.remove("open");
        el.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        item.setAttribute("aria-expanded", "true");
      }
    };
    faqItems.forEach((item) => {
      const onClick = () => handleFaqToggle(item);
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleFaqToggle(item);
        }
      };
      item.addEventListener("click", onClick);
      item.addEventListener("keydown", onKey);
      cleanups.push(() => {
        item.removeEventListener("click", onClick);
        item.removeEventListener("keydown", onKey);
      });
    });

    const scopeTabs = Array.from(document.querySelectorAll<HTMLButtonElement>(".scope-tab"));
    const scopePanels = Array.from(document.querySelectorAll<HTMLElement>(".scope-panel"));
    const setScope = (scopeId: string, button: HTMLButtonElement) => {
      scopePanels.forEach((panel) => panel.classList.remove("active"));
      scopeTabs.forEach((tab) => {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      });
      const panel = document.getElementById(`scope-${scopeId}`);
      if (panel) panel.classList.add("active");
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      if (scopeId === "s3") applyS3Widths();
    };
    scopeTabs.forEach((tab) => {
      const scopeId = tab.dataset.scope ?? "s1";
      const onClick = () => setScope(scopeId, tab);
      tab.addEventListener("click", onClick);
      cleanups.push(() => tab.removeEventListener("click", onClick));
    });
    const activeScope = scopeTabs.find((tab) => tab.classList.contains("active"));
    if (activeScope) {
      setScope(activeScope.dataset.scope ?? "s1", activeScope);
    }

    const bottomTabs = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".tab-item, .tab-cta")
    );
    const setActiveTab = (hash: string) => {
      const target = hash || "#home";
      bottomTabs.forEach((tab) => {
        const href = tab.getAttribute("href") || "";
        const isHome = target === "#home" && href === "#home";
        const isActive = isHome || (target !== "#home" && href === target);
        tab.classList.toggle("active", isActive);
      });
    };
    const onHashChange = () => setActiveTab(window.location.hash || "#home");
    bottomTabs.forEach((tab) => {
      const onClick = () => setActiveTab(tab.getAttribute("href") || "#home");
      tab.addEventListener("click", onClick);
      cleanups.push(() => tab.removeEventListener("click", onClick));
    });
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    cleanups.push(() => window.removeEventListener("hashchange", onHashChange));

    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("cookie-accept");
    const saveBtn = document.getElementById("cookie-save");
    const analyticsToggle = document.getElementById("ck-analytics") as HTMLInputElement | null;
    const marketingToggle = document.getElementById("ck-marketing") as HTMLInputElement | null;
    const cookieKey = "xyz-cookie-prefs";

    const hideCookie = () => cookieBanner?.classList.remove("show");
    const showCookie = () => cookieBanner?.classList.add("show");
    const saveCookie = () => {
      const payload = {
        analytics: analyticsToggle?.checked ?? false,
        marketing: marketingToggle?.checked ?? false,
        ts: Date.now(),
      };
      try {
        localStorage.setItem(cookieKey, JSON.stringify(payload));
      } catch {
        // Ignore storage failures (private mode or blocked storage).
      }
      hideCookie();
    };

    let hasPrefs = false;
    try {
      hasPrefs = !!localStorage.getItem(cookieKey);
    } catch {
      hasPrefs = false;
    }
    if (!hasPrefs) showCookie();

    if (acceptBtn) {
      const onAccept = () => {
        if (analyticsToggle) analyticsToggle.checked = true;
        if (marketingToggle) marketingToggle.checked = true;
        saveCookie();
      };
      acceptBtn.addEventListener("click", onAccept);
      cleanups.push(() => acceptBtn.removeEventListener("click", onAccept));
    }
    if (saveBtn) {
      const onSave = () => saveCookie();
      saveBtn.addEventListener("click", onSave);
      cleanups.push(() => saveBtn.removeEventListener("click", onSave));
    }

    const demoForm = document.getElementById("demo-form") as HTMLFormElement | null;
    const demoSuccess = document.getElementById("demo-success");
    const demoSubmit = document.getElementById("demo-submit-btn") as HTMLButtonElement | null;
    const demoBtnText = document.getElementById("demo-btn-text");
    if (demoForm) {
      const onSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        if (!demoForm.checkValidity()) {
          demoForm.reportValidity();
          return;
        }
        if (demoSubmit) demoSubmit.disabled = true;
        if (demoBtnText) demoBtnText.textContent = "Submitting...";
        window.setTimeout(() => {
          demoForm.style.display = "none";
          demoSuccess?.classList.add("show");
          if (demoSubmit) demoSubmit.disabled = false;
          if (demoBtnText) demoBtnText.textContent = "Book My Demo ->";
        }, 600);
      };
      demoForm.addEventListener("submit", onSubmit);
      cleanups.push(() => demoForm.removeEventListener("submit", onSubmit));
    }

    const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      const fallback = document.getElementById("hero-fallback");

      if (!ctx) {
        // No canvas context available; skip animation.
      } else if (prefersReduced) {
        canvas.style.display = "none";
        if (fallback) fallback.style.display = "block";
      } else {

      let w = 0;
      let h = 0;
      let animId = 0;
      let startTime: number | null = null;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      let mouseX = 0;
      let mouseY = 0;
      const onMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
      };
      canvas.addEventListener("mousemove", onMove);
      cleanups.push(() => canvas.removeEventListener("mousemove", onMove));

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const clamp = (value: number, min: number, max: number) =>
        Math.max(min, Math.min(max, value));
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const lerpRGB = (c1: number[], c2: number[], t: number) => [
        Math.round(lerp(c1[0], c2[0], t)),
        Math.round(lerp(c1[1], c2[1], t)),
        Math.round(lerp(c1[2], c2[2], t)),
      ];
      const rgb = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

      const RED_C = [220, 65, 45];
      const CYAN_C = [0, 212, 255];
      const GRN_C = [0, 255, 136];

      const PH_DUR = [3500, 3000, 3000, 4500];
      const PH_START = [0];
      for (let i = 1; i < PH_DUR.length; i += 1) {
        PH_START[i] = PH_START[i - 1] + PH_DUR[i - 1];
      }
      const TOTAL_DUR = PH_START[PH_DUR.length - 1] + PH_DUR[PH_DUR.length - 1];
      const LOOP_PH = PH_DUR.length;

      const PHASE_TEXTS = [
        "Client demo: Tata emissions across 5 facilities (demo data shown).",
        "Amine-grade CO2 capture engineered for Tata client processes.",
        "Every facility. Every emission. Every connection. Visible.",
        "Capture and compliance in perfect balance.",
      ];
      let lastPhaseIdx = -1;
      const updatePhaseText = (phase: number) => {
        const idx = Math.min(phase, PHASE_TEXTS.length - 1);
        if (idx === lastPhaseIdx) return;
        lastPhaseIdx = idx;
        const el = document.getElementById("hero-phase-text");
        if (!el) return;
        el.style.opacity = "0";
        window.setTimeout(() => {
          el.textContent = PHASE_TEXTS[idx];
          el.style.opacity = "1";
        }, 280);
      };

      type Molecule = {
        x: number;
        y: number;
        vx: number;
        vy: number;
        angle: number;
        spin: number;
        r: number;
        bond: number;
        opacity: number;
        fadeSpeed: number;
        colorT: number;
        targetNode: NodePoint | null;
        snapped: boolean;
        delay: number;
      };
      type NodePoint = {
        id: string;
        label: string;
        sub: string;
        x: number;
        y: number;
        r: number;
        status: "v" | "p" | "c";
        opacity: number;
      };
      type Connection = { f: string; t: string; progress: number; flowT: number };
      type Scale = {
        x: number;
        y: number;
        armLen: number;
        chainLen: number;
        angle: number;
        opacity: number;
        leftWT: number;
        rightWT: number;
      };

      const MOL_COUNT = 13;
      let molecules: Molecule[] = [];
      let nodes: NodePoint[] = [];
      let conns: Connection[] = [];
      let scale: Scale = {
        x: 0,
        y: 0,
        armLen: 0,
        chainLen: 0,
        angle: 0,
        opacity: 0,
        leftWT: 0,
        rightWT: 0,
      };

      const makeMolecule = (i: number): Molecule => ({
        x: w * 0.45 + Math.random() * w * 0.52,
        y: 60 + Math.random() * (h - 120),
        vx: -0.25 - Math.random() * 0.3,
        vy: (Math.random() - 0.5) * 0.28,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.013,
        r: 5 + Math.random() * 2,
        bond: 17 + Math.random() * 7,
        opacity: 0,
        fadeSpeed: 0.007 + Math.random() * 0.009,
        colorT: 0,
        targetNode: null,
        snapped: false,
        delay: i * 210,
      });

      const initMolecules = () => {
        molecules = [];
        for (let i = 0; i < MOL_COUNT; i += 1) molecules.push(makeMolecule(i));
      };

      const initNodes = () => {
        const cx = w * 0.63;
        const cy = h * 0.5;
        const sp = Math.min(w * 0.22, h * 0.3, 140);
        nodes = [
          {
            id: "jam",
            label: "Jamshedpur Steel",
            sub: "12,400 tCO2e",
            x: cx - sp * 0.25,
            y: cy - sp * 0.75,
            r: 8,
            status: "v",
            opacity: 0,
          },
          {
            id: "kal",
            label: "Kalinganagar Steel",
            sub: "8,200 tCO2e",
            x: cx + sp * 0.55,
            y: cy - sp * 0.35,
            r: 7,
            status: "v",
            opacity: 0,
          },
          {
            id: "mun",
            label: "Mundra Power",
            sub: "6,800 tCO2e",
            x: cx + sp * 0.6,
            y: cy + sp * 0.35,
            r: 7,
            status: "p",
            opacity: 0,
          },
          {
            id: "mit",
            label: "Mithapur Chemicals",
            sub: "4,100 tCO2e",
            x: cx - sp * 0.05,
            y: cy + sp * 0.7,
            r: 6,
            status: "v",
            opacity: 0,
          },
          {
            id: "pun",
            label: "Pune Auto",
            sub: "2,900 tCO2e",
            x: cx - sp * 0.7,
            y: cy + sp * 0.15,
            r: 6,
            status: "v",
            opacity: 0,
          },
          {
            id: "ccs1",
            label: "CCS Site: Gujarat",
            sub: "-3,200 tCO2e",
            x: cx + sp * 0.18,
            y: cy + sp * 0.05,
            r: 9,
            status: "c",
            opacity: 0,
          },
          {
            id: "ccs2",
            label: "CCS Site: Maharashtra",
            sub: "-1,800 tCO2e",
            x: cx - sp * 0.3,
            y: cy - sp * 0.15,
            r: 8,
            status: "c",
            opacity: 0,
          },
        ];

        conns = [
          { f: "jam", t: "ccs2", progress: 0, flowT: 0.1 },
          { f: "kal", t: "ccs1", progress: 0, flowT: 0.4 },
          { f: "mun", t: "ccs1", progress: 0, flowT: 0.7 },
          { f: "mit", t: "ccs1", progress: 0, flowT: 0.2 },
          { f: "pun", t: "ccs2", progress: 0, flowT: 0.6 },
          { f: "jam", t: "kal", progress: 0, flowT: 0.9 },
          { f: "mun", t: "mit", progress: 0, flowT: 0.05 },
        ];
      };

      const initScale = () => {
        scale = {
          x: w * 0.37,
          y: h * 0.44,
          armLen: Math.min(w * 0.17, 120),
          chainLen: Math.min(h * 0.17, 95),
          angle: -0.38,
          opacity: 0,
          leftWT: 0,
          rightWT: 0,
        };
      };

      const resize = () => {
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (!rect) return;
        w = rect.width;
        h = Math.max(rect.height, 480);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        initMolecules();
        initNodes();
        initScale();
      };

      const drawMolecule = (m: Molecule) => {
        if (m.opacity <= 0.01 || m.snapped) return;
        const c = lerpRGB(RED_C, CYAN_C, m.colorT);
        const co = lerpRGB([255, 90, 55], [0, 160, 255], m.colorT);
        const a = m.opacity;
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.angle);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = rgb(c, a * 0.45);
        ctx.beginPath();
        ctx.moveTo(-m.bond, 0);
        ctx.lineTo(m.bond, 0);
        ctx.stroke();
        ctx.strokeStyle = rgb(c, a * 0.2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-m.bond, -2.5);
        ctx.lineTo(m.bond, -2.5);
        ctx.stroke();
        ctx.fillStyle = rgb(co, a * 0.82);
        ctx.beginPath();
        ctx.arc(-m.bond, 0, m.r * 0.58, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(m.bond, 0, m.r * 0.58, 0, Math.PI * 2);
        ctx.fill();
        const cc = lerpRGB([130, 55, 38], [25, 175, 215], m.colorT);
        ctx.fillStyle = rgb(cc, a);
        ctx.beginPath();
        ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        ctx.fill();
        if (m.colorT > 0.55) {
          ctx.beginPath();
          ctx.arc(0, 0, m.r * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,212,255,${a * (m.colorT - 0.55) * 0.12})`;
          ctx.fill();
        }
        ctx.restore();
      };

      const drawNode = (n: NodePoint) => {
        if (n.opacity <= 0.01) return;
        const a = n.opacity;
        const col = n.status === "v" ? GRN_C : n.status === "p" ? [255, 149, 0] : CYAN_C;
        const grd = ctx.createRadialGradient(n.x, n.y, n.r, n.x, n.y, n.r * 3.2);
        grd.addColorStop(0, rgb(col, a * 0.18));
        grd.addColorStop(1, rgb(col, 0));
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = rgb(col, a);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`;
        ctx.fill();
        if (a > 0.35 && w > 560) {
          ctx.textAlign = "center";
          ctx.font = "500 9.5px 'DM Sans', sans-serif";
          ctx.fillStyle = `rgba(174,174,178,${a})`;
          ctx.fillText(n.label, n.x, n.y - n.r - 8);
          ctx.font = "500 8.5px 'JetBrains Mono', monospace";
          ctx.fillStyle = rgb(col, a * 0.85);
          ctx.fillText(n.sub, n.x, n.y - n.r - 19);
        }
      };

      const drawConn = (c: Connection) => {
        if (c.progress <= 0) return;
        const from = nodes.find((n) => n.id === c.f);
        const to = nodes.find((n) => n.id === c.t);
        if (!from || !to) return;
        const ex = from.x + (to.x - from.x) * c.progress;
        const ey = from.y + (to.y - from.y) * c.progress;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(0,212,255,0.16)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (c.progress >= 1) {
          const ft = c.flowT % 1;
          const fx = from.x + (to.x - from.x) * ft;
          const fy = from.y + (to.y - from.y) * ft;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,212,255,0.75)";
          ctx.fill();
        }
      };

      const drawScale = () => {
        if (scale.opacity <= 0.01) return;
        const { x, y, armLen, chainLen, angle } = scale;
        const a = scale.opacity;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = "rgba(0,212,255,0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 44);
        ctx.lineTo(x, y + 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.7)";
        ctx.fill();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = "rgba(0,212,255,0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-armLen, 0);
        ctx.lineTo(armLen, 0);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0,212,255,0.32)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-armLen, 0);
        ctx.lineTo(-armLen, chainLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(armLen, 0);
        ctx.lineTo(armLen, chainLen);
        ctx.stroke();
        const pw = 38;
        const ph = 8;
        ctx.save();
        ctx.translate(-armLen, chainLen);
        ctx.fillStyle = "rgba(28,44,70,0.85)";
        ctx.strokeStyle = "rgba(255,80,50,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-pw / 2, 0, pw, ph);
        ctx.fill();
        ctx.stroke();
        const leftItems = Math.floor(scale.leftWT * 5);
        for (let i = 0; i < leftItems; i += 1) {
          ctx.fillStyle = `rgba(255,${68 + i * 12},42,0.85)`;
          ctx.beginPath();
          ctx.rect(-15 + i * 6 - 2, -7 * (1 + (i % 2)), 5, 5.5);
          ctx.fill();
        }
        ctx.restore();
        ctx.save();
        ctx.translate(armLen, chainLen);
        ctx.fillStyle = "rgba(0,38,26,0.85)";
        ctx.strokeStyle = "rgba(0,255,136,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-pw / 2, 0, pw, ph);
        ctx.fill();
        ctx.stroke();
        const rightItems = Math.floor(scale.rightWT * 5);
        for (let i = 0; i < rightItems; i += 1) {
          ctx.beginPath();
          ctx.arc(-13 + i * 6, -8 * (1 + (i % 2)), 3.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,255,136,0.88)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(-13 + i * 6, -8 * (1 + (i % 2)), 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,255,136,0.12)";
          ctx.fill();
        }
        ctx.restore();
        ctx.restore();
        if (a > 0.5) {
          ctx.textAlign = "center";
          ctx.font = "700 8.5px 'DM Sans', sans-serif";
          ctx.fillStyle = `rgba(255,80,50,${a * 0.75})`;
          ctx.fillText("UNVERIFIED", x - armLen, y + chainLen + ph + 17);
          ctx.fillStyle = `rgba(0,255,136,${a * 0.75})`;
          ctx.fillText("CAPTURED", x + armLen, y + chainLen + ph + 17);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      };

      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const phaseInfo = (() => {
          for (let i = 0; i < PH_DUR.length; i += 1) {
            if (elapsed < PH_START[i] + PH_DUR[i]) {
              return { phase: i, t: (elapsed - PH_START[i]) / PH_DUR[i] };
            }
          }
          return { phase: LOOP_PH, t: (elapsed - TOTAL_DUR) / 5000 };
        })();

        updatePhaseText(phaseInfo.phase < LOOP_PH ? phaseInfo.phase : PHASE_TEXTS.length - 1);

        const px = (mouseX / (w || 1) - 0.5) * 10;
        const py = (mouseY / (h || 1) - 0.5) * 7;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(px * 0.28, py * 0.28);

        for (let i = 0; i < molecules.length; i += 1) {
          const m = molecules[i];
          const mElapsed = elapsed - m.delay;
          if (mElapsed < 0) continue;
          if (phaseInfo.phase === 0) {
            m.opacity = Math.min(1, m.opacity + m.fadeSpeed);
            m.x += m.vx;
            m.y += m.vy;
            m.angle += m.spin;
            if (m.x < w * 0.38 || m.x > w * 0.99) m.vx *= -1;
            if (m.y < 28 || m.y > h - 28) m.vy *= -1;
          } else if (phaseInfo.phase === 1) {
            m.colorT = Math.min(1, m.colorT + 0.007);
            if (!m.targetNode) m.targetNode = nodes[i % nodes.length];
            if (m.targetNode && !m.snapped) {
              const dx = m.targetNode.x - m.x;
              const dy = m.targetNode.y - m.y;
              m.x += dx * (0.028 + phaseInfo.t * 0.018);
              m.y += dy * (0.028 + phaseInfo.t * 0.018);
              if (Math.hypot(dx, dy) < 4) m.snapped = true;
            }
            m.angle += m.spin * 0.25;
            if (m.snapped) m.opacity = Math.max(0, m.opacity - 0.035);
          } else {
            m.opacity = 0;
          }
          drawMolecule(m);
        }

        if (phaseInfo.phase >= 2 || phaseInfo.phase === LOOP_PH) {
          const cp = phaseInfo.phase === LOOP_PH ? 1 : phaseInfo.t;
          for (let i = 0; i < nodes.length; i += 1) {
            const nodeDelay = (i / nodes.length) * 0.5;
            const nt = clamp((cp - nodeDelay) / 0.55, 0, 1);
            nodes[i].opacity = easeOutCubic(nt);
            drawNode(nodes[i]);
          }
          if (cp > 0.38) {
            const ct = (cp - 0.38) / 0.62;
            for (let i = 0; i < conns.length; i += 1) {
              const delay = (i / conns.length) * 0.65;
              conns[i].progress = clamp((ct - delay) / 0.45, 0, 1);
              conns[i].flowT = (conns[i].flowT + 0.003) % 1;
              drawConn(conns[i]);
            }
          }
        } else if (phaseInfo.phase === 1 && phaseInfo.t > 0.6) {
          const nt = (phaseInfo.t - 0.6) / 0.4;
          for (let i = 0; i < nodes.length; i += 1) {
            nodes[i].opacity = easeOutCubic(nt) * 0.5;
            drawNode(nodes[i]);
          }
        }

        if (phaseInfo.phase >= 3 || phaseInfo.phase === LOOP_PH) {
          const sp = phaseInfo.phase === LOOP_PH ? 1 : phaseInfo.t;
          scale.opacity = easeOutCubic(clamp(sp * 2.5, 0, 1));
          scale.leftWT = easeOutCubic(clamp(sp * 2.2, 0, 1));
          scale.rightWT = easeOutCubic(clamp((sp - 0.32) * 1.7, 0, 1));
          const tiltTarget =
            scale.rightWT >= 0.88 ? 0 : lerp(-0.38, 0, scale.rightWT / 0.88);
          scale.angle += (tiltTarget - scale.angle) * 0.045;
          drawScale();
        }

        ctx.restore();
        animId = requestAnimationFrame(animate);
      };

      const onVisibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(animId);
          animId = 0;
        } else if (!animId) {
          animId = requestAnimationFrame(animate);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

      resize();
      let resizeObs: ResizeObserver | null = null;
      if (window.ResizeObserver) {
        resizeObs = new ResizeObserver(() => resize());
        const parent = canvas.parentElement;
        if (parent) resizeObs.observe(parent);
      } else {
        const onResize = () => resize();
        window.addEventListener("resize", onResize, { passive: true });
        cleanups.push(() => window.removeEventListener("resize", onResize));
      }
      if (resizeObs) cleanups.push(() => resizeObs?.disconnect());

        animId = requestAnimationFrame(animate);
        cleanups.push(() => cancelAnimationFrame(animId));
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
