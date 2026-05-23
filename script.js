const STORAGE_KEY = "gaokao-score-dashboard";
const SETTINGS_KEY = "gaokao-score-settings";

const CORE_SUBJECTS = ["璇枃", "鏁板", "鑻辫"];
const ELECTIVE_SUBJECTS = ["鐗╃悊", "鍖栧", "鐢熺墿", "鏀挎不", "鍘嗗彶", "鍦扮悊"];
const ALL_SUBJECTS = [...CORE_SUBJECTS, ...ELECTIVE_SUBJECTS];
const NON_ASSIGNED_DEFAULTS = new Set(["鐗╃悊", "鍘嗗彶"]);
const RANK_DISPLAY_MODES = new Set(["summary", "subject", "none"]);
const CHART_RANGE_MODES = new Set(["all", "latest-3", "latest-5", "custom"]);

const refs = {
  chartMetric: document.querySelector("#chart-metric"),
  chartRankToggleButton: document.querySelector("#chart-rank-toggle-btn"),
  chartExportButton: document.querySelector("#chart-export-btn"),
  chartRangeMode: document.querySelector("#chart-range-mode"),
  chartRangeStart: document.querySelector("#chart-range-start"),
  chartRangeEnd: document.querySelector("#chart-range-end"),
  chartRangePickers: document.querySelector("#chart-range-pickers"),
  chartRangeSummary: document.querySelector("#chart-range-summary"),
  chartLegend: document.querySelector("#chart-legend"),
  breakdownChart: document.querySelector("#breakdown-chart"),
  breakdownSummary: document.querySelector("#breakdown-summary"),
  breakdownCurrentExam: document.querySelector("#breakdown-current-exam"),
  chartBreakdownFilter: document.querySelector("#chart-breakdown-filter"),
  openBreakdownPickerButton: document.querySelector("#open-breakdown-picker-btn"),
  breakdownPicker: document.querySelector("#chart-breakdown-picker"),
  breakdownSearchInput: document.querySelector("#breakdown-search-input"),
  breakdownExamList: document.querySelector("#breakdown-exam-list"),
  comparisonCurrent: document.querySelector("#comparison-current"),
  comparisonExam: document.querySelector("#comparison-exam"),
  comparisonSearchInput: document.querySelector("#comparison-search"),
  comparisonBaseLabel: document.querySelector("#comparison-base-label"),
  comparisonBody: document.querySelector("#comparison-body"),
  historyHead: document.querySelector("#history-head"),
  historyList: document.querySelector("#history-list"),
  historyToggleButton: document.querySelector("#history-toggle-btn"),
  historyModal: document.querySelector("#history-modal"),
  historyModalSort: document.querySelector("#history-modal-sort"),
  historySearchInput: document.querySelector("#history-search-input"),
  historyRangeFilter: document.querySelector("#history-range-filter"),
  historyModalHead: document.querySelector("#history-modal-head"),
  historyModalCols: document.querySelector("#history-modal-cols"),
  historyModalList: document.querySelector("#history-modal-list"),
  historyModalTable: document.querySelector(".history-table-compact"),
  historyModalCard: document.querySelector("#history-modal .history-modal-card"),
  historyLandscapeButton: document.querySelector("#history-landscape-btn"),
  closeHistoryModalButton: document.querySelector("#close-history-modal-btn"),
  chartExportPreviewModal: document.querySelector("#chart-export-preview-modal"),
  closeChartExportPreviewButton: document.querySelector("#close-chart-export-preview-btn"),
  chartExportPreviewImage: document.querySelector("#chart-export-preview-image"),
  chartExportPreviewStatus: document.querySelector("#chart-export-preview-status"),
  chartExportDownloadButton: document.querySelector("#chart-export-download-btn"),
  chartExportOpenButton: document.querySelector("#chart-export-open-btn"),
  trendChart: document.querySelector("#trend-chart"),
  subjectBadges: document.querySelector("#subject-badges"),
  templatePreview: document.querySelector("#template-preview"),
  textImportInput: document.querySelector("#text-import"),
  openImportModalButton: document.querySelector("#open-import-modal-btn"),
  closeImportModalButton: document.querySelector("#close-import-modal-btn"),
  copyTemplateButton: document.querySelector("#copy-template-btn"),
  importTextButton: document.querySelector("#import-text-btn"),
  fillDemoButton: document.querySelector("#fill-demo"),
  exportButton: document.querySelector("#export-data"),
  importInput: document.querySelector("#import-data"),
  clearButton: document.querySelector("#clear-data"),
  inlineExportButton: document.querySelector("#inline-export-data"),
  inlineImportInput: document.querySelector("#inline-import-data"),
  inlineClearButton: document.querySelector("#inline-clear-data"),
  bottomDock: document.querySelector("#bottom-dock"),
  settingsToggleButton: document.querySelector("#settings-toggle-btn"),
  dockMenu: document.querySelector("#dock-menu"),
  personalToggleButton: document.querySelector("#personal-toggle-btn"),
  personalModal: document.querySelector("#personal-modal"),
  closePersonalModalButton: document.querySelector("#close-personal-modal-btn"),
  openRankSettingsButton: document.querySelector("#open-rank-settings-btn"),
  rankSettingsModal: document.querySelector("#rank-settings-modal"),
  closeRankSettingsButton: document.querySelector("#close-rank-settings-btn"),
  rankModeInputs: document.querySelectorAll('input[name="rank-display-mode"]'),
  openSubjectModalTopButton: document.querySelector("#open-subject-modal-btn-top"),
  subjectModal: document.querySelector("#subject-modal"),
  subjectPicker: document.querySelector("#subject-picker"),
  assignmentOptions: document.querySelector("#assignment-options"),
  saveSubjectsButton: document.querySelector("#save-subjects-btn"),
  importModal: document.querySelector("#import-modal"),
};

let memoryStorage = Object.create(null);
let exams = loadExams();
let settings = loadSettings();
let draftElectives = [...settings.electives];
let draftAssignedSubjects = [...settings.assignedSubjects];
let selectedCurrentId = null;
let selectedComparisonId = null;
let selectedHistorySort = "date-desc";
let historySearchKeyword = "";
let selectedHistoryRangeFilter = "all";
let comparisonSearchKeyword = "";
let selectedChartMetricType = "score";
let selectedScoreMetric = "score:total";
let selectedRankMetric = "rank:total";
let selectedChartRangeMode = "all";
let selectedChartStartId = null;
let selectedChartEndId = null;
let selectedBreakdownExamId = null;
let breakdownSearchKeyword = "";
let isHistoryLandscapeMode = false;
let chartExportPreviewUrl = "";
let chartExportPreviewFilename = "";

init();

function init() {
  seedDemoDataIfNeeded();
  bindEvents();
  buildSubjectPicker();
  buildMetricOptions();
  buildHistorySortOptions();
  renderTemplatePreview();
  renderSubjectBadges();
  render();
  ensureSubjectSetup();
}

function seedDemoDataIfNeeded() {
  if (exams.length > 0) return;

  settings = {
    electives: ["鐗╃悊", "鍖栧", "鐢熺墿"],
    assignedSubjects: ["鍖栧", "鐢熺墿"],
    rankDisplayMode: "subject",
  };
  draftElectives = [...settings.electives];
  draftAssignedSubjects = [...settings.assignedSubjects];

  const demoRows = [
    [1, "楂樿€冨啿鍒轰簩妯?, "2026-05-18", 142, 148, 154, 138, 142, 150, 886, 874, 5, 1],
    [2, "楂樿€冨啿鍒轰竴妯?, "2026-05-06", 140, 146, 152, 136, 141, 149, 876, 864, 7, 1],
    [3, "楂樹笁涓嬬鍥涙妯¤€?, "2026-04-24", 138, 144, 150, 135, 140, 147, 866, 854, 9, 1],
    [4, "楂樹笁涓嬬涓夋妯¤€?, "2026-04-08", 136, 142, 148, 133, 139, 146, 856, 844, 11, 2],
    [5, "楂樹笁涓嬬浜屾妯¤€?, "2026-03-21", 134, 140, 146, 131, 137, 144, 844, 832, 14, 2],
    [6, "楂樹笁涓嬬涓€娆℃ā鑰?, "2026-03-02", 132, 138, 144, 126, 132, 140, 824, 812, 21, 4],
    [7, "瀵掑亣杩旀牎鑰?, "2026-02-18", 130, 136, 142, 130, 136, 143, 829, 817, 16, 3],
    [8, "楂樹笁涓婃湡鏈?, "2026-01-24", 128, 134, 140, 128, 134, 141, 817, 805, 19, 3],
  ];

  exams = demoRows.map(([i, name, date, chinese, math, english, physics, chemistryRaw, biologyRaw, totalAssigned, totalRaw, totalRank, classRank]) => ({
    id: buildId(),
    name,
    date,
    totalRank,
    classRank,
    targetScore: totalAssigned,
    note: "绀轰緥鏁版嵁",
    scores: {
      璇枃: chinese,
      鏁板: math,
      鑻辫: english,
      鐗╃悊: physics,
      鍖栧: chemistryRaw,
      鐢熺墿: biologyRaw,
    },
    assignedScores: {
      鍖栧: chemistryRaw + 6,
      鐢熺墿: biologyRaw + 6,
    },
    subjectRanks: {
      璇枃: 30 + (i - 1) * 2,
      鏁板: 26 + (i - 1) * 2,
      鑻辫: 22 + (i - 1) * 2,
      鐗╃悊: 18 + (i - 1) * 2,
    },
    assignedSubjectRanks: {
      鍖栧: 14 + (i - 1) * 2,
      鐢熺墿: 10 + (i - 1) * 2,
    },
    rawTotal: totalRaw,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  saveSettings();
  saveExams();
}

function bindEvents() {
  refs.chartMetric?.addEventListener("change", () => {
    const value = refs.chartMetric.value;
    const parsedMetric = parseChartMetricValue(value);
    selectedChartMetricType = parsedMetric.type;
    if (parsedMetric.type === "rank") selectedRankMetric = value;
    else selectedScoreMetric = value;
    syncChartRankToggleButton();
    renderChart();
  });
  refs.chartRankToggleButton?.addEventListener("click", () => {
    selectedChartMetricType = selectedChartMetricType === "rank" ? "score" : "rank";
    buildMetricOptions();
    syncChartRankToggleButton();
    renderChart();
  });
  refs.chartExportButton?.addEventListener("click", exportTrendChartImage);
  refs.chartRangeMode?.addEventListener("change", () => {
    selectedChartRangeMode = normalizeChartRangeMode(refs.chartRangeMode.value);
    renderChartRangeSelectors();
    renderChart();
  });
  refs.chartRangeStart?.addEventListener("change", () => {
    selectedChartStartId = refs.chartRangeStart.value || null;
    renderChart();
  });
  refs.chartRangeEnd?.addEventListener("change", () => {
    selectedChartEndId = refs.chartRangeEnd.value || null;
    renderChart();
  });
  refs.openBreakdownPickerButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    refs.breakdownPicker?.classList.toggle("hidden");
    if (!refs.breakdownPicker?.classList.contains("hidden")) {
      renderBreakdownPicker();
      refs.breakdownSearchInput?.focus();
    }
  });
  refs.breakdownSearchInput?.addEventListener("input", () => {
    breakdownSearchKeyword = refs.breakdownSearchInput.value || "";
    renderBreakdownPicker();
  });
  refs.historyModalSort?.addEventListener("change", () => {
    selectedHistorySort = refs.historyModalSort.value || "date-desc";
    renderHistory();
  });
  refs.historySearchInput?.addEventListener("input", () => {
    historySearchKeyword = (refs.historySearchInput.value || "").trim().toLowerCase();
    renderHistory();
  });
  refs.historyRangeFilter?.addEventListener("change", () => {
    selectedHistoryRangeFilter = refs.historyRangeFilter.value || "all";
    renderHistory();
  });
  refs.comparisonCurrent?.addEventListener("change", () => {
    selectedCurrentId = refs.comparisonCurrent.value || null;
    if (selectedCurrentId === selectedComparisonId) {
      selectedComparisonId = getPreferredComparisonId();
    }
    render();
  });
  refs.comparisonExam?.addEventListener("change", () => {
    selectedComparisonId = refs.comparisonExam.value || null;
    renderComparison();
  });
  refs.comparisonSearchInput?.addEventListener("input", () => {
    comparisonSearchKeyword = (refs.comparisonSearchInput.value || "").trim().toLowerCase();
    renderComparisonSelectors();
    renderComparison();
  });

  refs.historyToggleButton?.addEventListener("click", openHistoryModal);
  refs.historyLandscapeButton?.addEventListener("click", requestHistoryLandscapeView);
  refs.closeHistoryModalButton?.addEventListener("click", closeHistoryModal);
  refs.closeChartExportPreviewButton?.addEventListener("click", closeChartExportPreviewModal);
  refs.openImportModalButton?.addEventListener("click", openImportModal);
  refs.closeImportModalButton?.addEventListener("click", closeImportModal);
  refs.personalToggleButton?.addEventListener("click", openPersonalModal);
  refs.closePersonalModalButton?.addEventListener("click", closePersonalModal);
  refs.openRankSettingsButton?.addEventListener("click", openRankSettingsModal);
  refs.closeRankSettingsButton?.addEventListener("click", closeRankSettingsModal);
  refs.openSubjectModalTopButton?.addEventListener("click", openSubjectModalFromButton);
  refs.settingsToggleButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    refs.dockMenu?.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    if (refs.dockMenu && !refs.bottomDock?.contains(event.target)) {
      refs.dockMenu.classList.add("hidden");
    }
    if (refs.breakdownPicker && refs.chartBreakdownFilter && !refs.chartBreakdownFilter.contains(event.target)) {
      refs.breakdownPicker.classList.add("hidden");
    }
  });

  refs.rankModeInputs?.forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      settings.rankDisplayMode = normalizeRankDisplayMode(input.value);
      saveSettings();
      buildMetricOptions();
      syncChartRankToggleButton();
      renderTemplatePreview();
      renderHistory();
      renderChart();
    });
  });

  refs.copyTemplateButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(refs.templatePreview.value);
    } catch {
      refs.templatePreview.select();
      document.execCommand("copy");
    }
    window.alert("妯℃澘宸插鍒躲€?);
  });

  refs.fillDemoButton?.addEventListener("click", () => {
    refs.textImportInput.value = buildDemoText();
  });

  refs.importTextButton?.addEventListener("click", () => {
    const rawText = refs.textImportInput.value.trim();
    if (!rawText) {
      window.alert("璇峰厛绮樿创鎴愮哗鏂囨湰銆?);
      return;
    }
    try {
      const exam = parseExamText(rawText);
      exams.push(exam);
      exams.sort((a, b) => new Date(a.date) - new Date(b.date));
      saveExams();
      refs.textImportInput.value = "";
      closeImportModal();
      render();
      window.alert("杩欐鎴愮哗宸茬粡瀵煎叆鎴愬姛銆?);
    } catch (error) {
      window.alert(error.message || "鏂囨湰瀵煎叆澶辫触锛岃妫€鏌ユ牸寮忋€?);
    }
  });

  refs.exportButton?.addEventListener("click", exportData);
  refs.inlineExportButton?.addEventListener("click", exportData);
  refs.chartExportDownloadButton?.addEventListener("click", () => {
    if (!chartExportPreviewUrl || !chartExportPreviewFilename) return;
    downloadChartExportPreview();
  });
  refs.chartExportOpenButton?.addEventListener("click", () => {
    if (!chartExportPreviewUrl) return;
    window.open(chartExportPreviewUrl, "_blank", "noopener,noreferrer");
  });
  refs.importInput?.addEventListener("change", handleJsonImport);
  refs.inlineImportInput?.addEventListener("change", handleJsonImport);
  refs.clearButton?.addEventListener("click", clearAllData);
  refs.inlineClearButton?.addEventListener("click", clearAllData);

  refs.saveSubjectsButton?.addEventListener("click", () => {
    if (draftElectives.length !== 3) {
      window.alert("璇锋濂介€夋嫨 3 绉戝皬绉戙€?);
      return;
    }
    settings.electives = [...draftElectives];
    settings.assignedSubjects = draftAssignedSubjects.filter((subject) => draftElectives.includes(subject));
    saveSettings();
    closeSubjectModal();
    buildMetricOptions();
    buildHistorySortOptions();
    renderTemplatePreview();
    renderSubjectBadges();
    render();
  });

  [refs.subjectModal, refs.personalModal, refs.rankSettingsModal, refs.importModal, refs.historyModal, refs.chartExportPreviewModal].forEach((modal) => {
    modal?.addEventListener("click", (event) => {
      if (event.target !== modal) return;
      closeModalById(modal.id);
    });
  });

  window.addEventListener("resize", syncHistoryModalTableLayout);
}

function loadExams() {
  const raw = safeStorageGet(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeExamRecord).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function normalizeExamRecord(exam) {
  if (!exam || typeof exam !== "object") return null;
  return {
    id: typeof exam.id === "string" && exam.id ? exam.id : buildId(),
    name: String(exam.name || "鏈懡鍚嶈€冭瘯"),
    date: normalizeImportDate(String(exam.date || "")) || getTodayString(),
    totalRank: normalizeNullableNumber(exam.totalRank),
    classRank: normalizeNullableNumber(exam.classRank ?? exam.rank),
    targetScore: normalizeNullableNumber(exam.targetScore),
    note: String(exam.note || ""),
    scores: normalizeScoreMap(exam.scores),
    assignedScores: normalizeScoreMap(exam.assignedScores),
    subjectRanks: normalizeScoreMap(exam.subjectRanks),
    assignedSubjectRanks: normalizeScoreMap(exam.assignedSubjectRanks),
  };
}

function normalizeScoreMap(value) {
  const result = {};
  if (!value || typeof value !== "object") return result;
  for (const subject of ALL_SUBJECTS) {
    const numeric = normalizeNullableNumber(value[subject]);
    if (numeric !== null) result[subject] = numeric;
  }
  return result;
}

function normalizeNullableNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function loadSettings() {
  const raw = safeStorageGet(SETTINGS_KEY);
  if (!raw) return { electives: [], assignedSubjects: [], rankDisplayMode: "summary" };
  try {
    const parsed = JSON.parse(raw);
    const electives = Array.isArray(parsed.electives)
      ? parsed.electives.filter((subject) => ELECTIVE_SUBJECTS.includes(subject)).slice(0, 3)
      : [];
    const assignedSubjects = Array.isArray(parsed.assignedSubjects)
      ? parsed.assignedSubjects.filter((subject) => electives.includes(subject))
      : getDefaultAssignedSubjects(electives);
    return {
      electives,
      assignedSubjects,
      rankDisplayMode: normalizeRankDisplayMode(parsed.rankDisplayMode),
    };
  } catch {
    return { electives: [], assignedSubjects: [], rankDisplayMode: "summary" };
  }
}

function saveExams() {
  safeStorageSet(STORAGE_KEY, JSON.stringify(exams));
}

function saveSettings() {
  safeStorageSet(SETTINGS_KEY, JSON.stringify(settings));
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStorage[key] ?? null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryStorage[key] = value;
  }
}

function getActiveSubjects() {
  return settings.electives.length === 3
    ? [...CORE_SUBJECTS, ...settings.electives]
    : [...CORE_SUBJECTS, ...ELECTIVE_SUBJECTS.slice(0, 3)];
}

function getAssignedSubjects() {
  return settings.assignedSubjects.filter((subject) => getActiveSubjects().includes(subject));
}

function getDefaultAssignedSubjects(electives) {
  return electives.filter((subject) => !NON_ASSIGNED_DEFAULTS.has(subject));
}

function shouldDefaultAssigned(subject) {
  return !NON_ASSIGNED_DEFAULTS.has(subject);
}

function normalizeRankDisplayMode(value) {
  return RANK_DISPLAY_MODES.has(value) ? value : "summary";
}

function normalizeChartRangeMode(value) {
  return CHART_RANGE_MODES.has(value) ? value : "all";
}

function getRankDisplayMode() {
  return normalizeRankDisplayMode(settings.rankDisplayMode);
}

function buildSubjectPicker() {
  if (!refs.subjectPicker) return;
  refs.subjectPicker.innerHTML = ELECTIVE_SUBJECTS.map((subject) => `<button type="button" class="subject-choice" data-choice="${subject}">${subject}</button>`).join("");
  refs.subjectPicker.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const subject = button.dataset.choice;
      if (!subject) return;
      if (draftElectives.includes(subject)) {
        draftElectives = draftElectives.filter((item) => item !== subject);
        draftAssignedSubjects = draftAssignedSubjects.filter((item) => item !== subject);
      } else if (draftElectives.length < 3) {
        draftElectives = [...draftElectives, subject];
        if (shouldDefaultAssigned(subject)) {
          draftAssignedSubjects = [...draftAssignedSubjects, subject];
        }
      }
      syncSubjectPicker();
      renderAssignmentOptions();
    });
  });
  syncSubjectPicker();
  renderAssignmentOptions();
}

function syncSubjectPicker() {
  refs.subjectPicker?.querySelectorAll("[data-choice]").forEach((button) => {
    button.classList.toggle("active", draftElectives.includes(button.dataset.choice));
  });
}

function renderAssignmentOptions() {
  if (!refs.assignmentOptions) return;
  if (draftElectives.length === 0) {
    refs.assignmentOptions.innerHTML = `<div class="empty-state">鍏堜粠涓婇潰閫夊嚭 3 绉戝皬绉戯紝杩欓噷鎵嶄細鍑虹幇璧嬪垎璁剧疆銆?/div>`;
    return;
  }
  refs.assignmentOptions.innerHTML = draftElectives.map((subject) => {
    const checked = draftAssignedSubjects.includes(subject) ? "checked" : "";
    const note = shouldDefaultAssigned(subject) ? "榛樿鎸夎祴鍒嗚鍏ユ€诲垎" : "榛樿鎸夊師濮嬪垎璁″叆鎬诲垎";
    return `
      <label class="assignment-row">
        <div>
          <strong>${subject}</strong>
          <small>${note}</small>
        </div>
        <span class="assignment-toggle">
          <input type="checkbox" data-assigned-toggle="${subject}" ${checked}>
          鍚敤璧嬪垎
        </span>
      </label>
    `;
  }).join("");

  refs.assignmentOptions.querySelectorAll("[data-assigned-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      const subject = input.dataset.assignedToggle;
      if (!subject) return;
      if (input.checked) {
        if (!draftAssignedSubjects.includes(subject)) {
          draftAssignedSubjects = [...draftAssignedSubjects, subject];
        }
      } else {
        draftAssignedSubjects = draftAssignedSubjects.filter((item) => item !== subject);
      }
    });
  });
}

function buildMetricOptions() {
  if (!refs.chartMetric) return;
  if (getRankDisplayMode() === "none" && selectedChartMetricType === "rank") {
    selectedChartMetricType = "score";
  }
  const options = getChartMetricOptions(selectedChartMetricType);
  const legacyValue = refs.chartMetric.value;
  const fallback = selectedChartMetricType === "rank"
    ? selectedRankMetric
    : selectedScoreMetric;
  const current = options.some((option) => option.value === legacyValue)
    ? legacyValue
    : legacyValue === "鎬诲垎"
      ? "score:total"
      : getActiveSubjects().includes(legacyValue)
        ? `score:${legacyValue}`
        : options.some((option) => option.value === fallback)
          ? fallback
          : options[0]?.value;
  refs.chartMetric.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
  refs.chartMetric.value = current;
  const parsedMetric = parseChartMetricValue(current);
  if (parsedMetric.type === "rank") selectedRankMetric = current;
  else selectedScoreMetric = current;
}

function getChartMetricOptions(type = "score") {
  if (type === "rank") {
    if (getRankDisplayMode() === "none") return [];
    const options = [
      { value: "rank:total", label: "鎬绘帓鍚? },
      { value: "rank:class", label: "鐝帓鍚? },
    ];
    if (getRankDisplayMode() === "subject") {
      options.push(...getActiveSubjects().map((subject) => ({ value: `rank:${subject}`, label: `${subject}鎺掑悕` })));
    }
    return options;
  }
  return [
    { value: "score:total", label: "鎬诲垎" },
    ...getActiveSubjects().map((subject) => ({ value: `score:${subject}`, label: subject })),
  ];
}

function parseChartMetricValue(value) {
  if (typeof value !== "string") return { type: "score", target: "total" };
  const [type, ...parts] = value.split(":");
  const target = parts.join(":");
  if ((type === "score" || type === "rank") && target) return { type, target };
  return { type: "score", target: "total" };
}

function syncChartRankToggleButton() {
  if (!refs.chartRankToggleButton) return;
  const rankEnabled = getRankDisplayMode() !== "none";
  if (!rankEnabled && selectedChartMetricType === "rank") {
    selectedChartMetricType = "score";
  }
  const isActive = rankEnabled && selectedChartMetricType === "rank";
  refs.chartRankToggleButton.classList.toggle("is-active", isActive);
  refs.chartRankToggleButton.setAttribute("aria-pressed", isActive ? "true" : "false");
  refs.chartRankToggleButton.disabled = !rankEnabled;
  refs.chartRankToggleButton.title = rankEnabled ? "鍒囨崲鍒版帓鍚嶈蛋鍔? : "褰撳墠鎺掑悕璁剧疆鏈紑鍚浘琛ㄦ帓鍚?;
}

function buildHistorySortOptions() {
  if (!refs.historyModalSort) return;
  const options = [
    { value: "date-desc", label: "鎸夋椂闂翠粠杩戝埌杩? },
    { value: "total-desc", label: "鎸夎祴鍚庢€诲垎浠庨珮鍒颁綆" },
    ...getActiveSubjects().map((subject) => ({ value: `subject:${subject}`, label: `鎸?{subject}浠庨珮鍒颁綆` })),
  ];
  refs.historyModalSort.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
  refs.historyModalSort.value = selectedHistorySort;
}

function renderTemplatePreview() {
  if (!refs.templatePreview) return;
  refs.templatePreview.value = buildTemplateText();
}

function buildTemplateText() {
  const lines = ["鑰冭瘯鍚嶇О锛?, "鑰冭瘯鏃ユ湡锛歒YYY-MM-DD", ...buildTemplateRankLines(), "鐩爣鎬诲垎锛?];
  for (const subject of getActiveSubjects()) {
    if (getAssignedSubjects().includes(subject)) {
      lines.push(`${subject}鍘熷锛歚, `${subject}璧嬪垎锛歚);
    } else {
      lines.push(`${subject}锛歚);
    }
  }
  lines.push("澶囨敞锛?);
  return lines.join("\n");
}

function buildDemoText() {
  const current = exams.at(-1);
  const lines = [
    `鑰冭瘯鍚嶇О锛?{current?.name || "浜旀湀鑱旇€?}`,
    `鑰冭瘯鏃ユ湡锛?{current?.date || getTodayString()}`,
    ...buildDemoRankLines(current),
    "鐩爣鎬诲垎锛?86",
  ];
  for (const subject of getActiveSubjects()) {
    const raw = current?.scores?.[subject] ?? "";
    const assigned = current?.assignedScores?.[subject] ?? "";
    if (getAssignedSubjects().includes(subject)) {
      lines.push(`${subject}鍘熷锛?{raw}`, `${subject}璧嬪垎锛?{assigned}`);
    } else {
      lines.push(`${subject}锛?{raw}`);
    }
  }
  lines.push("澶囨敞锛氳繖鏄竴娈电ず渚嬪鍏ユ枃鏈€?);
  return lines.join("\n");
}

function render() {
  const currentMetric = refs.chartMetric?.value;
  const parsedMetric = parseChartMetricValue(currentMetric);
  selectedChartMetricType = parsedMetric.type;
  if (parsedMetric.type === "rank" && currentMetric) selectedRankMetric = currentMetric;
  if (parsedMetric.type === "score" && currentMetric) selectedScoreMetric = currentMetric;
  syncRankModeOptions();
  syncChartRankToggleButton();
  renderSubjectBadges();
  renderComparisonSelectors();
  renderComparison();
  renderHistory();
  renderChartRangeSelectors();
  renderChart();
  renderBreakdownPicker();
  renderBreakdownChart();
}

function syncRankModeOptions() {
  refs.rankModeInputs?.forEach((input) => {
    input.checked = input.value === getRankDisplayMode();
  });
}

function renderSubjectBadges() {
  if (!refs.subjectBadges) return;
  refs.subjectBadges.innerHTML = getActiveSubjects().map((subject) => `<span class="subject-badge">${subject}</span>`).join("");
}

function renderComparisonSelectors() {
  if (!refs.comparisonCurrent || !refs.comparisonExam) return;

  const availableCurrentExams = getComparisonFilteredExams();

  if (!availableCurrentExams.length) {
    selectedCurrentId = null;
    selectedComparisonId = null;
    refs.comparisonCurrent.innerHTML = `<option value="">鏆傛棤绗﹀悎鏉′欢鐨勮€冭瘯</option>`;
    refs.comparisonExam.innerHTML = `<option value="">鏆傛棤鍙姣旇€冭瘯</option>`;
    return;
  }

  if (!selectedCurrentId || !availableCurrentExams.some((exam) => exam.id === selectedCurrentId)) {
    selectedCurrentId = availableCurrentExams.at(-1)?.id ?? exams.at(-1)?.id ?? null;
  }

  const currentExam = getCurrentExam();
  const comparisonOptions = availableCurrentExams.filter((exam) => exam.id !== currentExam?.id);
  if (!selectedComparisonId || !comparisonOptions.some((exam) => exam.id === selectedComparisonId)) {
    selectedComparisonId = getPreferredComparisonId(comparisonOptions);
  }

  refs.comparisonCurrent.innerHTML = availableCurrentExams.length
    ? availableCurrentExams.map((exam) => `<option value="${exam.id}" ${exam.id === selectedCurrentId ? "selected" : ""}>${escapeHtml(exam.name)} 路 ${formatDate(exam.date)}</option>`).join("")
    : `<option value="">鏆傛棤绗﹀悎鏉′欢鐨勮€冭瘯</option>`;

  refs.comparisonExam.innerHTML = comparisonOptions.length
    ? comparisonOptions.map((exam) => `<option value="${exam.id}" ${exam.id === selectedComparisonId ? "selected" : ""}>${escapeHtml(exam.name)} 路 ${formatDate(exam.date)}</option>`).join("")
    : `<option value="">鏆傛棤鍙姣旇€冭瘯</option>`;
}

function renderComparison() {
  if (!refs.comparisonBody) return;
  const currentExam = getCurrentExam();
  const comparisonExam = getComparisonExam();
  refs.comparisonBaseLabel.textContent = comparisonExam ? comparisonExam.name : "瀵规瘮鑰冭瘯";
  if (!currentExam || !comparisonExam) {
    refs.comparisonBody.innerHTML = `<tr><td colspan="4"><div class="empty-state">鑷冲皯闇€瑕佷袱娆¤€冭瘯鍚庢墠鑳藉姣斻€?/div></td></tr>`;
    return;
  }
  const totalRow = `
    <tr class="comparison-total-row">
      <td>鎬诲垎</td>
      <td>${renderTotalScoreCell(currentExam)}</td>
      <td>${renderTotalScoreCell(comparisonExam)}</td>
      <td>${renderTotalDeltaCell(currentExam, comparisonExam)}</td>
    </tr>
  `;
  const subjectRows = getActiveSubjects().map((subject) => {
    return `
      <tr>
        <td>${subject}</td>
        <td>${renderScoreCell(currentExam, subject)}</td>
        <td>${renderScoreCell(comparisonExam, subject)}</td>
        <td>${renderComparisonDeltaCell(currentExam, comparisonExam, subject)}</td>
      </tr>
    `;
  }).join("");
  refs.comparisonBody.innerHTML = `${totalRow}${subjectRows}`;
}

function renderHistory() {
  renderHistoryHead();
  renderHistoryModalHead();
  renderHistoryModalCols();
  syncHistoryModalTableLayout();

  if (!refs.historyList) return;

  if (exams.length === 0) {
    refs.historyList.innerHTML = `<tr><td colspan="${getPreviewHistoryColumnCount()}"><div class="empty-state">鏆傛棤鍘嗗彶璁板綍銆?/div></td></tr>`;
    refs.historyModalList.innerHTML = `<tr><td colspan="${getHistoryModalColumnCount()}"><div class="empty-state">鏆傛棤鍘嗗彶璁板綍銆?/div></td></tr>`;
    return;
  }

  refs.historyList.innerHTML = getPreviewHistoryExams().slice(0, 3).map((exam) => {
    const chips = getActiveSubjects().map((subject) => renderScoreChip(exam, subject)).join("");
    return `
      <tr>
        <td>
          <div class="history-name-cell">
            <strong>${escapeHtml(exam.name)}</strong>
            <small>${escapeHtml(exam.note || " ")}</small>
          </div>
        </td>
        <td>${formatDate(exam.date)}</td>
        <td class="history-total-cell">${getTotal(exam)}</td>
        ${renderPreviewRankCells(exam)}
        <td><div class="history-scores">${chips}</div></td>
      </tr>
    `;
  }).join("");

  if (refs.historyModalList) {
    const historyExams = getSortedHistoryExams();
    refs.historyModalList.innerHTML = historyExams.length
      ? historyExams.map((exam) => `
      <tr>
        <td class="history-col-name" title="${escapeHtml(exam.name)}">${escapeHtml(exam.name)}</td>
        <td class="history-col-date">${formatDate(exam.date)}</td>
        <td class="history-total-cell history-col-total-raw">${getRawTotal(exam)}</td>
        <td class="history-total-cell history-col-total-assigned">${getTotal(exam)}</td>
        ${renderHistoryModalRankCells(exam)}
        ${getHistoryModalSubjectCells(exam)}
      </tr>
    `).join("")
      : `<tr><td colspan="${getHistoryModalColumnCount()}"><div class="empty-state">娌℃湁绗﹀悎绛涢€夋潯浠剁殑鑰冭瘯銆?/div></td></tr>`;
  }

  renderHistoryExpansion();
}

function renderHistoryHead() {
  refs.historyHead.innerHTML = `
    <tr>
      <th>鑰冭瘯鍚嶇О</th>
      <th>鏃堕棿</th>
      <th>鎬诲垎</th>
      ${getPreviewRankHeadCells()}
      <th>鍚勭鎴愮哗</th>
    </tr>
  `;
}

function renderHistoryModalHead() {
  refs.historyModalHead.innerHTML = [
    `<th class="history-col-name">鑰冭瘯</th>`,
    `<th class="history-col-date">鏃ユ湡</th>`,
    `<th class="history-col-total-raw">璧嬪墠</th>`,
    `<th class="history-col-total-assigned">璧嬪悗</th>`,
    ...getHistoryModalRankHeadCells(),
    ...getHistoryModalSubjectHeadCells(),
  ].join("");
}

function renderHistoryModalCols() {
  refs.historyModalCols.innerHTML = [
    `<col class="history-col-name">`,
    `<col class="history-col-date">`,
    `<col class="history-col-total-raw">`,
    `<col class="history-col-total-assigned">`,
    ...getHistoryModalRankColDefs(),
    ...getHistoryModalSubjectColDefs(),
  ].join("");
}

function syncHistoryModalTableLayout() {
  if (!refs.historyModalTable) return;

  const mode = getRankDisplayMode();
  const subjectCount = getActiveSubjects().length;
  const isMobileViewport = window.matchMedia("(max-width: 640px)").matches;

  if (isMobileViewport) {
    const nameWidth = 140;
    const dateWidth = 96;
    const totalWidth = 66;
    const rankWidth = 58;
    const subjectWidth = 78;
    const subjectRankWidth = 58;
    const rankColumnCount = mode === "none" ? 0 : 2;
    const subjectColumnWidth = mode === "subject" ? subjectWidth + subjectRankWidth : subjectWidth;
    const minWidth = nameWidth + dateWidth + (totalWidth * 2) + (rankColumnCount * rankWidth) + (Math.max(subjectCount, 1) * subjectColumnWidth) + 36;

    refs.historyModalTable.style.setProperty("--history-name-col-width", `${nameWidth}px`);
    refs.historyModalTable.style.setProperty("--history-date-col-width", `${dateWidth}px`);
    refs.historyModalTable.style.setProperty("--history-total-col-width", `${totalWidth}px`);
    refs.historyModalTable.style.setProperty("--history-rank-col-width", mode === "none" ? "0px" : `${rankWidth}px`);
    refs.historyModalTable.style.setProperty("--history-subject-col-width", `${subjectWidth}px`);
    refs.historyModalTable.style.setProperty("--history-subject-rank-col-width", mode === "subject" ? `${subjectRankWidth}px` : "0px");
    refs.historyModalTable.style.setProperty("--history-modal-min-width", `${minWidth}px`);
    return;
  }

  refs.historyModalTable.style.setProperty("--history-modal-min-width", "100%");

  if (mode === "none") {
    refs.historyModalTable.style.setProperty("--history-name-col-width", "22%");
    refs.historyModalTable.style.setProperty("--history-date-col-width", "12%");
    refs.historyModalTable.style.setProperty("--history-total-col-width", "8%");
    refs.historyModalTable.style.setProperty("--history-rank-col-width", "0%");
    refs.historyModalTable.style.setProperty("--history-subject-col-width", `${50 / Math.max(subjectCount, 1)}%`);
    refs.historyModalTable.style.setProperty("--history-subject-rank-col-width", "0%");
    return;
  }

  if (mode === "summary") {
    refs.historyModalTable.style.setProperty("--history-name-col-width", "20%");
    refs.historyModalTable.style.setProperty("--history-date-col-width", "11%");
    refs.historyModalTable.style.setProperty("--history-total-col-width", "7%");
    refs.historyModalTable.style.setProperty("--history-rank-col-width", "6%");
    refs.historyModalTable.style.setProperty("--history-subject-col-width", `${43 / Math.max(subjectCount, 1)}%`);
    refs.historyModalTable.style.setProperty("--history-subject-rank-col-width", "0%");
    return;
  }

  refs.historyModalTable.style.setProperty("--history-name-col-width", "16%");
  refs.historyModalTable.style.setProperty("--history-date-col-width", "9%");
  refs.historyModalTable.style.setProperty("--history-total-col-width", "5%");
  refs.historyModalTable.style.setProperty("--history-rank-col-width", "4%");
  refs.historyModalTable.style.setProperty("--history-subject-col-width", `${37.8 / Math.max(subjectCount, 1)}%`);
  refs.historyModalTable.style.setProperty("--history-subject-rank-col-width", `${19.2 / Math.max(subjectCount, 1)}%`);
}

function renderHistoryExpansion() {
  const canExpand = exams.length > 3;
  refs.historyToggleButton?.classList.toggle("hidden", !canExpand);
  if (refs.historyToggleButton) refs.historyToggleButton.textContent = "鍏ㄥ睆鏌ョ湅";
}

function renderChartRangeSelectors() {
  if (!refs.chartRangeMode || !refs.chartRangeStart || !refs.chartRangeEnd) return;

  selectedChartRangeMode = normalizeChartRangeMode(selectedChartRangeMode);
  refs.chartRangeMode.value = selectedChartRangeMode;

  const orderedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  const defaultStartId = orderedExams[0]?.id ?? "";
  const defaultEndId = orderedExams.at(-1)?.id ?? "";

  if (!selectedChartStartId || !orderedExams.some((exam) => exam.id === selectedChartStartId)) {
    selectedChartStartId = defaultStartId;
  }
  if (!selectedChartEndId || !orderedExams.some((exam) => exam.id === selectedChartEndId)) {
    selectedChartEndId = defaultEndId;
  }

  const optionMarkup = orderedExams.length
    ? orderedExams.map((exam) => `<option value="${exam.id}">${escapeHtml(exam.name)} 路 ${formatDate(exam.date)}</option>`).join("")
    : `<option value="">鏆傛棤鑰冭瘯</option>`;

  refs.chartRangeStart.innerHTML = optionMarkup;
  refs.chartRangeEnd.innerHTML = optionMarkup;
  refs.chartRangeStart.value = selectedChartStartId || "";
  refs.chartRangeEnd.value = selectedChartEndId || "";

  const showCustom = selectedChartRangeMode === "custom";
  refs.chartRangePickers?.classList.toggle("hidden", !showCustom);
  refs.chartRangeStart.disabled = !showCustom;
  refs.chartRangeEnd.disabled = !showCustom;
}

function getChartExams() {
  const orderedExams = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (selectedChartRangeMode === "latest-3") return orderedExams.slice(-3);
  if (selectedChartRangeMode === "latest-5") return orderedExams.slice(-5);
  if (selectedChartRangeMode !== "custom") return orderedExams;

  const startIndex = orderedExams.findIndex((exam) => exam.id === selectedChartStartId);
  const endIndex = orderedExams.findIndex((exam) => exam.id === selectedChartEndId);
  if (startIndex < 0 || endIndex < 0) return orderedExams;

  const from = Math.min(startIndex, endIndex);
  const to = Math.max(startIndex, endIndex);
  return orderedExams.slice(from, to + 1);
}

function getAssignedChartScore(exam, subject) {
  if (typeof exam?.assignedScores?.[subject] === "number") return exam.assignedScores[subject];
  return typeof exam?.scores?.[subject] === "number" ? exam.scores[subject] : null;
}

function buildChartSeries(metric, chartExams) {
  const parsedMetric = parseChartMetricValue(metric);

  if (parsedMetric.type === "score" && parsedMetric.target === "total") {
    return [{
      key: "total",
      label: "鎬诲垎",
      stroke: "#1f7a7a",
      fill: "#1f7a7a",
      dash: "",
      metricType: "score",
      values: chartExams.map((exam) => getTotal(exam)),
    }];
  }

  if (parsedMetric.type === "score" && getAssignedSubjects().includes(parsedMetric.target)) {
    return [
      {
        key: `${parsedMetric.target}-raw-score`,
        label: `${parsedMetric.target}鍘熷鍒哷,
        stroke: "#c36b43",
        fill: "#c36b43",
        dash: "7 6",
        metricType: "score",
        values: chartExams.map((exam) => normalizeNullableNumber(exam?.scores?.[parsedMetric.target])),
      },
      {
        key: `${parsedMetric.target}-assigned-score`,
        label: `${parsedMetric.target}璧嬪垎`,
        stroke: "#1f7a7a",
        fill: "#1f7a7a",
        dash: "",
        metricType: "score",
        values: chartExams.map((exam) => getAssignedChartScore(exam, parsedMetric.target)),
      },
    ];
  }

  if (parsedMetric.type === "score") {
    return [{
      key: parsedMetric.target,
      label: parsedMetric.target,
      stroke: "#2e6f9b",
      fill: "#2e6f9b",
      dash: "",
      metricType: "score",
      values: chartExams.map((exam) => getEffectiveSubjectScore(exam, parsedMetric.target)),
    }];
  }

  if (parsedMetric.target === "total") {
    return [{
      key: "total-rank",
      label: "鎬绘帓鍚?,
      stroke: "#7a4a2b",
      fill: "#7a4a2b",
      dash: "",
      metricType: "rank",
      values: chartExams.map((exam) => normalizeNullableNumber(exam?.totalRank)),
    }];
  }

  if (parsedMetric.target === "class") {
    return [{
      key: "class-rank",
      label: "鐝帓鍚?,
      stroke: "#5c6ac4",
      fill: "#5c6ac4",
      dash: "",
      metricType: "rank",
      values: chartExams.map((exam) => normalizeNullableNumber(exam?.classRank)),
    }];
  }

  if (getAssignedSubjects().includes(parsedMetric.target)) {
    return [{
      key: `${parsedMetric.target}-assigned-rank`,
      label: `${parsedMetric.target}璧嬪垎鎺掑悕`,
      stroke: "#1f7a7a",
      fill: "#1f7a7a",
      dash: "",
      metricType: "rank",
      values: chartExams.map((exam) => getDisplayedSubjectRank(exam, parsedMetric.target)),
    }];
  }

  return [{
    key: `${parsedMetric.target}-rank`,
    label: `${parsedMetric.target}鎺掑悕`,
    stroke: "#346f99",
    fill: "#346f99",
    dash: "",
    metricType: "rank",
    values: chartExams.map((exam) => getDisplayedSubjectRank(exam, parsedMetric.target)),
  }];
}

function renderChartMeta(metric, chartExams, series) {
  const parsedMetric = parseChartMetricValue(metric);
  if (refs.chartRangeSummary) {
    if (!chartExams.length) {
      refs.chartRangeSummary.textContent = "瀵煎叆鑰冭瘯鍚庡嵆鍙煡鐪嬭蛋鍔裤€?;
    } else {
      const first = chartExams[0];
      const last = chartExams.at(-1);
      const isAssignedSubject = getAssignedSubjects().includes(parsedMetric.target);
      const pairNote = parsedMetric.type === "rank"
        ? (isAssignedSubject ? " 路 璧嬪垎绉戠洰灞曠ず璧嬪垎鎺掑悕" : " 路 鎺掑悕鏁板€艰秺灏忚秺闈犲墠")
        : (isAssignedSubject ? " 路 璧嬪垎绉戠洰鍚屾灞曠ず鍘熷鍒嗕笌璧嬪垎" : "");
      refs.chartRangeSummary.textContent = `鑼冨洿锛?{first.name} 鑷?${last.name} 路 鍏?${chartExams.length} 娆¤€冭瘯${pairNote}`;
    }
  }

  if (refs.chartLegend) {
    refs.chartLegend.innerHTML = series.map((item) => `
      <span class="chart-legend-item">
        <i class="chart-legend-line${item.dash ? " is-dashed" : ""}" style="--legend-color:${item.stroke}"></i>
        <span>${item.label}</span>
      </span>
    `).join("");
  }
}

function buildChartEmptyState(message) {
  if (refs.chartLegend) refs.chartLegend.innerHTML = "";
  if (refs.chartRangeSummary) refs.chartRangeSummary.textContent = "";
  return `<text x="50%" y="50%" text-anchor="middle" fill="#6a7280" font-size="18">${message}</text>`;
}

function buildChartExamLabelLines(name, charsPerLine, maxLines) {
  const text = String(name || "鏈懡鍚嶈€冭瘯").trim() || "鏈懡鍚嶈€冭瘯";
  const safeCharsPerLine = Math.max(2, charsPerLine);
  const safeMaxLines = Math.max(1, maxLines);
  const lines = [];
  let cursor = 0;

  while (cursor < text.length && lines.length < safeMaxLines) {
    const slice = text.slice(cursor, cursor + safeCharsPerLine);
    cursor += slice.length;
    if (lines.length === safeMaxLines - 1 && cursor < text.length) {
      lines.push(`${slice.slice(0, Math.max(safeCharsPerLine - 3, 1))}...`);
      return lines;
    }
    lines.push(slice);
  }

  return lines;
}

function renderChart() {
  if (!refs.trendChart) return;

  const metric = refs.chartMetric?.value || "score:total";
  const parsedMetric = parseChartMetricValue(metric);
  const chartExams = getChartExams();
  if (chartExams.length === 0) {
    refs.trendChart.innerHTML = buildChartEmptyState("瀵煎叆鑰冭瘯鍚庯紝杩欓噷浼氱敓鎴愯秼鍔垮浘");
    return;
  }

  const series = buildChartSeries(metric, chartExams);
  const isRankChart = parsedMetric.type === "rank";
  const validValues = series.flatMap((item) => item.values.filter((value) => typeof value === "number"));
  if (!validValues.length) {
    refs.trendChart.innerHTML = buildChartEmptyState("褰撳墠鑼冨洿鍐呮殏鏃犲彲缁樺埗鐨勬暟鎹?);
    return;
  }

  renderChartMeta(metric, chartExams, series);

  const width = 720;
  const estimatedStepX = (width - 54 - 20) / Math.max(chartExams.length - 1, 1);
  const useCompactAxisLabels = estimatedStepX < 96 || chartExams.some((exam) => String(exam.name || "").length > 8);
  const nameCharsPerLine = estimatedStepX < 68 ? 3 : useCompactAxisLabels ? 4 : 8;
  const nameLineLimit = useCompactAxisLabels ? 2 : 1;
  const axisLabelFontSize = estimatedStepX < 68 ? 10 : 11;
  const dateLabelFontSize = estimatedStepX < 68 ? 9 : 10;
  const height = useCompactAxisLabels ? 344 : 320;
  const padding = { top: 24, right: 20, bottom: useCompactAxisLabels ? 96 : 72, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const span = Math.max(max - min, 10);
  const stepX = chartWidth / Math.max(chartExams.length - 1, 1);
  const getChartX = (index) => (chartExams.length === 1 ? padding.left + chartWidth / 2 : padding.left + stepX * index);
  refs.trendChart.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const guideLines = chartExams.map((exam, index) => {
    const x = getChartX(index);
    return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + chartHeight}" stroke="rgba(31,42,55,0.06)"></line>`;
  }).join("");

  const grid = Array.from({ length: 5 }, (_, index) => {
    const y = padding.top + (chartHeight / 4) * index;
    const value = isRankChart
      ? Math.round(min + (span / 4) * index)
      : Math.round(max - (span / 4) * index);
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(31,42,55,0.1)"></line><text x="${padding.left - 12}" y="${y + 4}" text-anchor="end" fill="#6a7280" font-size="12">${value}</text>`;
  }).join("");

  let labels = chartExams.map((exam, index) => {
    const x = getChartX(index);
    const shortName = escapeHtml(exam.name.length > 8 ? `${exam.name.slice(0, 8)}鈥 : exam.name);
    return `
      <text x="${x}" y="${height - 28}" text-anchor="middle" fill="#536072" font-size="12">
        <tspan x="${x}" dy="0">${shortName}</tspan>
        <tspan x="${x}" dy="16" fill="#8b96a6" font-size="11">${formatShortDate(exam.date)}</tspan>
      </text>
    `;
  }).join("");

  labels = chartExams.map((exam, index) => {
    const x = getChartX(index);
    const labelLines = buildChartExamLabelLines(exam.name, nameCharsPerLine, nameLineLimit);
    const labelStartY = useCompactAxisLabels ? height - 50 : height - 28;
    const nameMarkup = labelLines.map((line, lineIndex) => `<tspan x="${x}" dy="${lineIndex === 0 ? 0 : 14}">${escapeHtml(line)}</tspan>`).join("");
    return `
      <g>
        <title>${escapeHtml(exam.name)} ${formatDate(exam.date)}</title>
        <text x="${x}" y="${labelStartY}" text-anchor="middle" fill="#536072" font-size="${axisLabelFontSize}">
          ${nameMarkup}
          <tspan x="${x}" dy="16" fill="#8b96a6" font-size="${dateLabelFontSize}">${formatShortDate(exam.date)}</tspan>
        </text>
      </g>
    `;
  }).join("");

  const seriesMarkup = series.map((item, seriesIndex) => {
    const points = item.values.map((value, index) => {
      if (typeof value !== "number") return null;
      const x = getChartX(index);
      const y = isRankChart
        ? padding.top + ((value - min) / span) * chartHeight
        : padding.top + chartHeight - ((value - min) / span) * chartHeight;
      return { x, y, value, exam: chartExams[index] };
    }).filter(Boolean);

    if (!points.length) return "";

    const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
    const labelsMarkup = points.map((point, pointIndex) => {
      const dy = series.length > 1 ? (seriesIndex === 0 ? -12 : 18) : -12;
      const fontSize = series.length > 1 ? 10 : 11;
      const weight = pointIndex === points.length - 1 ? 700 : 600;
      return `<text x="${point.x}" y="${point.y + dy}" text-anchor="middle" fill="${item.fill}" font-size="${fontSize}" font-weight="${weight}">${point.value}</text>`;
    }).join("");

    const circles = points.map((point) => `
      <g>
        <circle cx="${point.x}" cy="${point.y}" r="4.5" fill="${item.fill}" stroke="#ffffff" stroke-width="2"></circle>
        <title>${escapeHtml(point.exam.name)} ${item.label} ${point.value}</title>
      </g>
    `).join("");

    return `
      <path d="${path}" fill="none" stroke="${item.stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${item.dash}"></path>
      ${circles}
      ${labelsMarkup}
    `;
  }).join("");

  refs.trendChart.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="transparent"></rect>
    ${grid}
    ${guideLines}
    ${seriesMarkup}
    ${labels}
  `;
}

function getBreakdownExam() {
  if (!selectedBreakdownExamId || !exams.some((exam) => exam.id === selectedBreakdownExamId)) {
    selectedBreakdownExamId = exams.at(-1)?.id ?? null;
  }
  return exams.find((exam) => exam.id === selectedBreakdownExamId) ?? null;
}

function renderBreakdownPicker() {
  if (!refs.breakdownCurrentExam || !refs.breakdownExamList) return;

  const currentExam = getBreakdownExam();
  refs.breakdownCurrentExam.textContent = currentExam
    ? `${currentExam.name} 路 ${formatDate(currentExam.date)}`
    : "鏆傛棤鍙€夎€冭瘯";

  if (refs.breakdownSearchInput && refs.breakdownSearchInput.value !== breakdownSearchKeyword) {
    refs.breakdownSearchInput.value = breakdownSearchKeyword;
  }

  const keyword = breakdownSearchKeyword.trim().toLowerCase();
  const items = [...exams]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((exam) => {
      if (!keyword) return true;
      const haystack = `${exam.name} ${formatDate(exam.date)}`.toLowerCase();
      return haystack.includes(keyword);
    });

  if (!items.length) {
    refs.breakdownExamList.innerHTML = `<div class="chart-breakdown-empty">娌℃湁鎵惧埌鍖归厤鐨勮€冭瘯</div>`;
    return;
  }

  refs.breakdownExamList.innerHTML = items.map((exam) => `
    <button type="button" class="chart-breakdown-option${exam.id === selectedBreakdownExamId ? " is-active" : ""}" data-breakdown-exam-id="${exam.id}">
      <strong>${escapeHtml(exam.name)}</strong>
      <small>${formatDate(exam.date)} 路 鎬诲垎 ${getTotal(exam)}</small>
    </button>
  `).join("");

  refs.breakdownExamList.querySelectorAll("[data-breakdown-exam-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedBreakdownExamId = button.dataset.breakdownExamId || null;
      breakdownSearchKeyword = "";
      if (refs.breakdownSearchInput) refs.breakdownSearchInput.value = "";
      refs.breakdownPicker?.classList.add("hidden");
      renderBreakdownPicker();
      renderBreakdownChart();
    });
  });
}

function renderBreakdownChart() {
  if (!refs.breakdownChart) return;

  const exam = getBreakdownExam();
  if (!exam) {
    if (refs.breakdownSummary) refs.breakdownSummary.textContent = "瀵煎叆鑰冭瘯鍚庡嵆鍙煡鐪嬫€诲垎鏋勬垚鍗犳瘮銆?;
    refs.breakdownChart.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="#6a7280" font-size="18">鏆傛棤鑰冭瘯鏁版嵁</text>`;
    return;
  }

  const total = getTotal(exam);
  const palette = ["#2a7f7f", "#5a8fd6", "#35a274", "#8a74d6", "#d27a43", "#5b7c99"];
  const rows = getActiveSubjects().map((subject, index) => {
    const score = Number(getEffectiveSubjectScore(exam, subject) ?? 0);
    const share = total > 0 ? score / total : 0;
    return { subject, score, share, color: palette[index % palette.length] };
  });

  if (refs.breakdownSummary) {
    refs.breakdownSummary.textContent = `${exam.name} 路 ${formatDate(exam.date)} 路 鎬诲垎 ${total}`;
  }

  const width = 720;
  const rowHeight = 34;
  const gap = 12;
  const top = 20;
  const bottom = 20;
  const left = 112;
  const barWidth = 430;
  const right = 140;
  const height = top + bottom + rows.length * rowHeight + Math.max(rows.length - 1, 0) * gap;

  refs.breakdownChart.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const scaleMarks = [0, 25, 50, 75, 100];
  const defs = rows.map((row, index) => `
    <linearGradient id="breakdown-fill-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${row.color}" stop-opacity="0.94"></stop>
      <stop offset="100%" stop-color="${row.color}" stop-opacity="0.72"></stop>
    </linearGradient>
  `).join("");

  const scaleMarkup = scaleMarks.map((mark) => {
    const x = left + (barWidth * mark) / 100;
    return `
      <line x1="${x}" y1="${top - 4}" x2="${x}" y2="${height - bottom + 2}" stroke="rgba(31,42,55,0.08)" stroke-dasharray="4 6"></line>
      <text x="${x}" y="${top - 10}" text-anchor="middle" fill="#8b96a6" font-size="11" font-weight="700">${mark}%</text>
    `;
  }).join("");

  const rowMarkup = rows.map((row, index) => {
    const y = top + index * (rowHeight + gap);
    const filled = row.share > 0 ? Math.max(10, row.share * barWidth) : 0;
    const shareText = `${(row.share * 100).toFixed(1)}%`;
    const valueText = `${row.score}鍒哷;
    const percentBadgeWidth = 68;
    const percentBadgeX = left + barWidth + 12;
    const fillId = `breakdown-fill-${index}`;
    return `
      <text x="${left - 18}" y="${y + 22}" text-anchor="end" fill="#1f2a37" font-size="14" font-weight="700">${row.subject}</text>
      <rect x="${left}" y="${y}" width="${barWidth}" height="${rowHeight}" rx="12" fill="rgba(31,42,55,0.045)" stroke="rgba(31,42,55,0.06)"></rect>
      <rect x="${left + 6}" y="${y + 9}" width="${Math.max(barWidth - 12, 0)}" height="5" rx="999" fill="rgba(255,255,255,0.32)"></rect>
      <rect x="${left}" y="${y}" width="${filled}" height="${rowHeight}" rx="12" fill="url(#${fillId})"></rect>
      <rect x="${left}" y="${y}" width="${filled}" height="${rowHeight}" rx="12" fill="url(#breakdown-shine)" opacity="${filled > 0 ? 1 : 0}"></rect>
      <circle cx="${left + filled}" cy="${y + rowHeight / 2}" r="${filled > 0 ? 4 : 0}" fill="${row.color}" opacity="0.92"></circle>
      <text x="${left + 14}" y="${y + 22}" fill="#ffffff" font-size="13" font-weight="700">${valueText}</text>
      <rect x="${percentBadgeX}" y="${y + 4}" width="${percentBadgeWidth}" height="26" rx="999" fill="rgba(31,42,55,0.06)"></rect>
      <text x="${percentBadgeX + percentBadgeWidth / 2}" y="${y + 21}" text-anchor="middle" fill="#536072" font-size="13" font-weight="800">${shareText}</text>
    `;
  }).join("");

  refs.breakdownChart.innerHTML = `
    <defs>
      ${defs}
      <linearGradient id="breakdown-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.86)"></stop>
        <stop offset="100%" stop-color="rgba(246,240,232,0.92)"></stop>
      </linearGradient>
      <linearGradient id="breakdown-shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.22)"></stop>
        <stop offset="100%" stop-color="rgba(255,255,255,0)"></stop>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="url(#breakdown-bg)"></rect>
    ${scaleMarkup}
    ${rowMarkup}
  `;
}

function parseExamText(rawText) {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const result = { scores: {}, assignedScores: {}, subjectRanks: {}, assignedSubjectRanks: {} };
  for (const line of lines) {
    const normalized = line.replace(/[锛歖/g, ":");
    const separatorIndex = normalized.indexOf(":");
    if (separatorIndex < 0) continue;
    const key = normalized.slice(0, separatorIndex).trim();
    const value = normalized.slice(separatorIndex + 1).trim();
    if (!value) continue;
    if (key === "鑰冭瘯鍚嶇О" || key === "鍚嶇О") result.name = value;
    else if (key === "鑰冭瘯鏃ユ湡" || key === "鏃ユ湡" || key === "鏃堕棿") result.date = normalizeImportDate(value);
    else if (key === "鎬绘帓鍚? || key === "骞寸骇鎺掑悕") result.totalRank = extractNumber(value);
    else if (key === "鐝骇鎺掑悕" || key === "鎺掑悕") result.classRank = extractNumber(value);
    else if (key === "鐩爣鎬诲垎") result.targetScore = extractNumber(value);
    else if (key === "澶囨敞" || key === "鑰冭瘯澶囨敞") result.note = value;
    else if (key.endsWith("鍘熷鎺掑悕")) result.subjectRanks[key.replace("鍘熷鎺掑悕", "").trim()] = extractNumber(value);
    else if (key.endsWith("璧嬪垎鎺掑悕")) result.assignedSubjectRanks[key.replace("璧嬪垎鎺掑悕", "").trim()] = extractNumber(value);
    else if (key.endsWith("鎺掑悕")) {
      const subject = key.replace("鎺掑悕", "").trim();
      if (getAssignedSubjects().includes(subject)) result.assignedSubjectRanks[subject] = extractNumber(value);
      else result.subjectRanks[subject] = extractNumber(value);
    } else if (key.endsWith("鍘熷")) result.scores[key.replace("鍘熷", "").trim()] = extractNumber(value);
    else if (key.endsWith("璧嬪垎")) result.assignedScores[key.replace("璧嬪垎", "").trim()] = extractNumber(value);
    else if (ALL_SUBJECTS.includes(key)) result.scores[key] = extractNumber(value);
  }
  if (!result.name) throw new Error("鏂囨湰瀵煎叆澶辫触锛氱己灏戣€冭瘯鍚嶇О銆?);
  if (!result.date) throw new Error("鏂囨湰瀵煎叆澶辫触锛氱己灏戣€冭瘯鏃ユ湡銆?);
  return normalizeExamRecord({ id: buildId(), ...result });
}

function exportData() {
  const blob = new Blob([JSON.stringify(exams, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `鎴愮哗璁板綍-${getTodayString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function handleJsonImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    exams = Array.isArray(parsed) ? parsed.map(normalizeExamRecord).filter(Boolean) : [];
    exams.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveExams();
    render();
    window.alert("JSON 鏁版嵁瀵煎叆鎴愬姛銆?);
  } catch {
    window.alert("JSON 瀵煎叆澶辫触锛岃纭鏂囦欢姝ｇ‘銆?);
  }
  if (event.target) event.target.value = "";
}

function clearAllData() {
  if (!window.confirm("纭畾娓呯┖鎵€鏈夋垚缁╄褰曞悧锛熸鎿嶄綔涓嶄細鎭㈠銆?)) return;
  exams = [];
  saveExams();
  render();
}

function getCurrentExam() {
  return exams.find((exam) => exam.id === selectedCurrentId) ?? exams.at(-1) ?? null;
}

function getComparisonExam() {
  return exams.find((exam) => exam.id === selectedComparisonId) ?? null;
}

function getPreferredComparisonId(candidates = null) {
  const currentExam = getCurrentExam();
  const items = Array.isArray(candidates) ? candidates : exams;
  return items.slice().reverse().find((exam) => exam.id !== currentExam?.id)?.id ?? null;
}

function getPreviewHistoryExams() {
  return [...exams].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function matchesExamKeyword(exam, keyword) {
  if (!keyword) return true;
  const haystack = `${exam?.name ?? ""} ${exam?.note ?? ""} ${formatDate(exam?.date ?? "")}`.toLowerCase();
  return haystack.includes(keyword);
}

function getComparisonFilteredExams() {
  if (!comparisonSearchKeyword) return [...exams];
  return exams.filter((exam) => matchesExamKeyword(exam, comparisonSearchKeyword));
}

function getHistoryFilteredExams() {
  let items = [...exams];

  if (historySearchKeyword) {
    items = items.filter((exam) => matchesExamKeyword(exam, historySearchKeyword));
  }

  if (selectedHistoryRangeFilter === "latest-3") {
    const ids = new Set([...exams].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-3).map((exam) => exam.id));
    items = items.filter((exam) => ids.has(exam.id));
  } else if (selectedHistoryRangeFilter === "latest-5") {
    const ids = new Set([...exams].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-5).map((exam) => exam.id));
    items = items.filter((exam) => ids.has(exam.id));
  } else if (selectedHistoryRangeFilter === "latest-10") {
    const ids = new Set([...exams].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10).map((exam) => exam.id));
    items = items.filter((exam) => ids.has(exam.id));
  } else if (selectedHistoryRangeFilter === "latest-90d") {
    const latest = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date)).at(-1);
    if (latest?.date) {
      const latestTime = new Date(latest.date).getTime();
      const threshold = latestTime - (90 * 24 * 60 * 60 * 1000);
      items = items.filter((exam) => new Date(exam.date).getTime() >= threshold);
    }
  }

  return items;
}

function getSortedHistoryExams() {
  const items = getHistoryFilteredExams();
  if (selectedHistorySort === "date-desc") return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (selectedHistorySort === "total-desc") return items.sort((a, b) => getTotal(b) - getTotal(a));
  if (selectedHistorySort.startsWith("subject:")) {
    const subject = selectedHistorySort.replace("subject:", "");
    return items.sort((a, b) => (getEffectiveSubjectScore(b, subject) ?? -1) - (getEffectiveSubjectScore(a, subject) ?? -1));
  }
  return items;
}

function getEffectiveSubjectScore(exam, subject) {
  if (!exam) return null;
  if (getAssignedSubjects().includes(subject) && typeof exam.assignedScores?.[subject] === "number") return exam.assignedScores[subject];
  return typeof exam.scores?.[subject] === "number" ? exam.scores[subject] : null;
}

function getTotal(exam) {
  return getActiveSubjects().reduce((sum, subject) => sum + Number(getEffectiveSubjectScore(exam, subject) ?? 0), 0);
}

function getRawTotal(exam) {
  return getActiveSubjects().reduce((sum, subject) => sum + Number(exam?.scores?.[subject] ?? 0), 0);
}

function renderTotalScoreCell(exam) {
  const rawTotal = getRawTotal(exam);
  const assignedTotal = getTotal(exam);
  if (getAssignedSubjects().length > 0 && rawTotal !== assignedTotal) {
    return `
      <div class="comparison-score-paired comparison-score-paired-total">
        <span class="comparison-score-line comparison-score-raw"><strong>${rawTotal}</strong></span>
        <span class="comparison-score-line comparison-score-assigned"><strong>${assignedTotal}</strong></span>
      </div>
    `;
  }
  return `<span class="score-main comparison-total-main">${assignedTotal}</span>`;
}

function renderTotalDeltaCell(currentExam, comparisonExam) {
  const currentRaw = getRawTotal(currentExam);
  const previousRaw = getRawTotal(comparisonExam);
  const currentAssigned = getTotal(currentExam);
  const previousAssigned = getTotal(comparisonExam);

  if (getAssignedSubjects().length > 0 && (currentRaw !== currentAssigned || previousRaw !== previousAssigned)) {
    return `
      <div class="comparison-delta-stack comparison-delta-total">
        <div class="comparison-delta-line comparison-delta-raw">${renderDeltaChip(currentRaw - previousRaw)}</div>
        <div class="comparison-delta-line comparison-delta-assigned">${renderDeltaChip(currentAssigned - previousAssigned)}</div>
      </div>
    `;
  }

  return renderDeltaChip(currentAssigned - previousAssigned);
}

function formatTotalRank(exam) {
  return Number.isFinite(exam?.totalRank) ? exam.totalRank : "--";
}

function formatClassRank(exam) {
  return Number.isFinite(exam?.classRank) ? exam.classRank : "--";
}

function formatSubjectRank(exam, subject) {
  const value = getDisplayedSubjectRank(exam, subject);
  return Number.isFinite(value) ? value : "--";
}

function getDisplayedSubjectRank(exam, subject) {
  if (!exam) return null;
  if (getAssignedSubjects().includes(subject) && Number.isFinite(exam.assignedSubjectRanks?.[subject])) return exam.assignedSubjectRanks[subject];
  if (Number.isFinite(exam.subjectRanks?.[subject])) return exam.subjectRanks[subject];
  return null;
}

function renderScoreChip(exam, subject) {
  const raw = exam.scores?.[subject];
  const assigned = exam.assignedScores?.[subject];
  const rankText = renderInlineSubjectRank(exam, subject);
  if (getAssignedSubjects().includes(subject) && typeof assigned === "number") {
    return `<span class="score-chip score-chip-assigned">${subject}<small>${raw ?? "--"}/${assigned}${rankText}</small></span>`;
  }
  return `<span class="score-chip">${subject}<small>${raw ?? "--"}${rankText}</small></span>`;
}

function renderScoreCell(exam, subject) {
  const raw = exam?.scores?.[subject];
  const assigned = exam?.assignedScores?.[subject];
  const effective = getEffectiveSubjectScore(exam, subject);
  if (effective == null) return "--";
  if (getAssignedSubjects().includes(subject) && typeof assigned === "number") {
    return `
      <div class="comparison-score-paired">
        <span class="comparison-score-line comparison-score-raw"><strong>${raw ?? "--"}</strong></span>
        <span class="comparison-score-line comparison-score-assigned"><strong>${assigned}</strong></span>
      </div>
    `;
  }
  return `<span class="score-main">${effective}</span>`;
}

function renderCompactScoreValue(exam, subject) {
  const raw = exam?.scores?.[subject];
  const assigned = exam?.assignedScores?.[subject];
  if (raw == null && assigned == null) return "--";
  if (getAssignedSubjects().includes(subject) && typeof assigned === "number") {
    return `<span class="score-dual"><span class="score-raw">${raw ?? "--"}</span><span class="score-assigned">${assigned}</span></span>`;
  }
  return `<span class="score-raw">${raw ?? "--"}</span>`;
}

function renderDeltaChip(delta) {
  if (delta === null) return `<span class="delta-chip delta-flat">--</span>`;
  if (delta > 0) return `<span class="delta-chip delta-up">+${delta}</span>`;
  if (delta < 0) return `<span class="delta-chip delta-down">${delta}</span>`;
  return `<span class="delta-chip delta-flat">0</span>`;
}

function renderComparisonDeltaCell(currentExam, comparisonExam, subject) {
  if (getAssignedSubjects().includes(subject) && typeof currentExam?.assignedScores?.[subject] === "number") {
    const rawCurrent = normalizeNullableNumber(currentExam?.scores?.[subject]);
    const rawPrevious = normalizeNullableNumber(comparisonExam?.scores?.[subject]);
    const assignedCurrent = normalizeNullableNumber(currentExam?.assignedScores?.[subject]);
    const assignedPrevious = normalizeNullableNumber(comparisonExam?.assignedScores?.[subject]);
    const rawDelta = typeof rawCurrent === "number" && typeof rawPrevious === "number" ? rawCurrent - rawPrevious : null;
    const assignedDelta = typeof assignedCurrent === "number" && typeof assignedPrevious === "number" ? assignedCurrent - assignedPrevious : null;
    return `
      <div class="comparison-delta-stack">
        <div class="comparison-delta-line comparison-delta-raw">${renderDeltaChip(rawDelta)}</div>
        <div class="comparison-delta-line comparison-delta-assigned">${renderDeltaChip(assignedDelta)}</div>
      </div>
    `;
  }

  const current = getEffectiveSubjectScore(currentExam, subject);
  const previous = getEffectiveSubjectScore(comparisonExam, subject);
  const delta = typeof current === "number" && typeof previous === "number" ? current - previous : null;
  return renderDeltaChip(delta);
}

function getPreviewRankHeadCells() {
  if (getRankDisplayMode() === "none") return "";
  return `<th>鎬绘帓鍚?/th><th>鐝帓鍚?/th>`;
}

function renderPreviewRankCells(exam) {
  if (getRankDisplayMode() === "none") return "";
  return `<td>${formatTotalRank(exam)}</td><td>${formatClassRank(exam)}</td>`;
}

function getHistoryModalRankHeadCells() {
  if (getRankDisplayMode() === "none") return [];
  return [
    `<th class="history-col-rank-total">鎬绘帓</th>`,
    `<th class="history-col-rank-class">鐝帓</th>`,
  ];
}

function getHistoryModalRankColDefs() {
  if (getRankDisplayMode() === "none") return [];
  return [`<col class="history-col-rank-total">`, `<col class="history-col-rank-class">`];
}

function renderHistoryModalRankCells(exam) {
  if (getRankDisplayMode() === "none") return "";
  return `<td class="history-col-rank-total">${formatTotalRank(exam)}</td><td class="history-col-rank-class">${formatClassRank(exam)}</td>`;
}

function getPreviewHistoryColumnCount() {
  return getRankDisplayMode() === "none" ? 4 : 6;
}

function getHistoryModalColumnCount() {
  const base = getRankDisplayMode() === "none" ? 4 : 6;
  return base + getHistoryModalSubjectColDefs().length;
}

function getHistoryModalSubjectHeadCells() {
  if (getRankDisplayMode() !== "subject") {
    return getActiveSubjects().map((subject) => `<th class="history-col-subject">${subject}</th>`);
  }
  return getActiveSubjects().flatMap((subject) => [
    `<th class="history-col-subject">${subject}</th>`,
    `<th class="history-col-rank-subject">鎺掑悕</th>`,
  ]);
}

function getHistoryModalSubjectColDefs() {
  if (getRankDisplayMode() !== "subject") {
    return getActiveSubjects().map(() => `<col class="history-col-subject">`);
  }
  return getActiveSubjects().flatMap(() => [
    `<col class="history-col-subject">`,
    `<col class="history-col-rank-subject">`,
  ]);
}

function getHistoryModalSubjectCells(exam) {
  if (getRankDisplayMode() !== "subject") {
    return getActiveSubjects().map((subject) => `<td class="history-col-subject">${renderCompactScoreValue(exam, subject)}</td>`).join("");
  }
  return getActiveSubjects().flatMap((subject) => [
    `<td class="history-col-subject">${renderCompactScoreValue(exam, subject)}</td>`,
    `<td class="history-col-rank-subject">${formatSubjectRank(exam, subject)}</td>`,
  ]).join("");
}

function buildTemplateRankLines() {
  if (getRankDisplayMode() === "none") return [];
  const lines = ["鎬绘帓鍚嶏細", "鐝骇鎺掑悕锛?];
  if (getRankDisplayMode() === "subject") {
    lines.push(...getActiveSubjects().map((subject) => getAssignedSubjects().includes(subject) ? `${subject}璧嬪垎鎺掑悕锛歚 : `${subject}鎺掑悕锛歚));
  }
  return lines;
}

function buildDemoRankLines(current) {
  if (getRankDisplayMode() === "none") return [];
  const lines = [`鎬绘帓鍚嶏細${current?.totalRank ?? 68}`, `鐝骇鎺掑悕锛?{current?.classRank ?? 8}`];
  if (getRankDisplayMode() === "subject") {
    lines.push(...getActiveSubjects().map((subject) => {
      const rank = formatSubjectRank(current, subject);
      return getAssignedSubjects().includes(subject) ? `${subject}璧嬪垎鎺掑悕锛?{rank}` : `${subject}鎺掑悕锛?{rank}`;
    }));
  }
  return lines;
}

function renderInlineSubjectRank(exam, subject) {
  if (getRankDisplayMode() !== "subject") return "";
  const label = getAssignedSubjects().includes(subject) ? " 路 璧嬫帓" : " 路 鎺?;
  return `${label}${formatSubjectRank(exam, subject)}`;
}

function openSubjectModal() {
  refs.subjectModal?.classList.remove("hidden");
}

function closeSubjectModal() {
  refs.subjectModal?.classList.add("hidden");
}

function openImportModal() {
  refs.importModal?.classList.remove("hidden");
}

function closeImportModal() {
  refs.importModal?.classList.add("hidden");
}

function openHistoryModal() {
  refs.historyModal?.classList.remove("hidden");
  syncHistoryLandscapeButton();
}

function closeHistoryModal() {
  setHistoryLandscapeMode(false);
  refs.historyModal?.classList.add("hidden");
  if (document.fullscreenElement && refs.historyModal?.contains(document.fullscreenElement)) {
    document.exitFullscreen?.().catch(() => {});
  }
  try {
    screen.orientation?.unlock?.();
  } catch {}
}

async function requestHistoryLandscapeView() {
  const nextMode = !isHistoryLandscapeMode;
  setHistoryLandscapeMode(nextMode);
  if (!nextMode) {
    if (document.fullscreenElement && refs.historyModal?.contains(document.fullscreenElement)) {
      document.exitFullscreen?.().catch(() => {});
    }
    try {
      screen.orientation?.unlock?.();
    } catch {}
    return;
  }

  const target = refs.historyModalCard || refs.historyModalTable || refs.historyModal || document.documentElement;
  let enteredFullscreen = false;

  try {
    if (!document.fullscreenElement && target?.requestFullscreen) {
      await target.requestFullscreen();
      enteredFullscreen = true;
    }
  } catch {}

  try {
    if (screen.orientation?.lock) {
      await screen.orientation.lock("landscape");
      return;
    }
  } catch {}

  if (!window.matchMedia("(orientation: landscape)").matches && !enteredFullscreen) {
    window.alert("褰撳墠鐜涓嶆敮鎸佽嚜鍔ㄦí灞忥紝宸插垏鎹负瀹借〃鏌ョ湅妯″紡銆傚啀娆＄偣鍑诲彲閫€鍑恒€?);
  }
}

function setHistoryLandscapeMode(enabled) {
  isHistoryLandscapeMode = Boolean(enabled);
  refs.historyModal?.classList.toggle("history-landscape-mode", isHistoryLandscapeMode);
  refs.historyModalCard?.classList.toggle("history-landscape-mode", isHistoryLandscapeMode);
  syncHistoryLandscapeButton();
}

function syncHistoryLandscapeButton() {
  if (!refs.historyLandscapeButton) return;
  refs.historyLandscapeButton.textContent = isHistoryLandscapeMode ? "閫€鍑烘í灞? : "妯睆鏌ョ湅";
  refs.historyLandscapeButton.setAttribute("aria-pressed", isHistoryLandscapeMode ? "true" : "false");
  refs.historyLandscapeButton.classList.toggle("is-active", isHistoryLandscapeMode);
}

function openPersonalModal() {
  refs.personalModal?.classList.remove("hidden");
}

function closePersonalModal() {
  refs.personalModal?.classList.add("hidden");
}

function openRankSettingsModal() {
  refs.rankSettingsModal?.classList.remove("hidden");
}

function closeRankSettingsModal() {
  refs.rankSettingsModal?.classList.add("hidden");
}

function openSubjectModalFromButton() {
  closePersonalModal();
  draftElectives = [...settings.electives];
  draftAssignedSubjects = [...settings.assignedSubjects];
  syncSubjectPicker();
  renderAssignmentOptions();
  openSubjectModal();
}

function ensureSubjectSetup() {
  if (settings.electives.length === 3) return;
  draftElectives = [...settings.electives];
  draftAssignedSubjects = [...settings.assignedSubjects];
  syncSubjectPicker();
  renderAssignmentOptions();
  openSubjectModal();
}

function closeModalById(id) {
  if (id === "subject-modal") closeSubjectModal();
  if (id === "personal-modal") closePersonalModal();
  if (id === "rank-settings-modal") closeRankSettingsModal();
  if (id === "import-modal") closeImportModal();
  if (id === "history-modal") closeHistoryModal();
  if (id === "chart-export-preview-modal") closeChartExportPreviewModal();
}

function buildTrendChartExportMarkup() {
  const snapshot = buildTrendChartExportSnapshot();
  const metricLabel = getSelectedChartMetricLabel();
  const rangeLabel = refs.chartRangeSummary?.textContent?.trim() || "鍏ㄩ儴鑰冭瘯";
  const legendItems = getChartLegendItems();
  const chartViewBox = refs.trendChart?.viewBox?.baseVal;
  const sourceWidth = chartViewBox?.width || 720;
  const sourceHeight = chartViewBox?.height || 320;
  const exportWidth = 1280;
  const exportHeight = 880;
  const chartAreaWidth = 1050;
  const chartAreaHeight = 400;
  const chartScale = Math.min(chartAreaWidth / sourceWidth, chartAreaHeight / sourceHeight);
  const chartOffsetX = 116;
  const chartOffsetY = 314;
  const chipMarkup = snapshot.chips.map((chip, index) => {
    const x = 74 + index * 164;
    return `
      <g transform="translate(${x} 148)">
        <rect x="0" y="0" rx="18" ry="18" width="148" height="42" fill="${chip.fill}" stroke="${chip.stroke}"></rect>
        <text x="74" y="27" text-anchor="middle" fill="${chip.textColor}" font-size="18" font-weight="700">${escapeHtml(chip.label)}</text>
      </g>
    `;
  }).join("");
  const legendMarkup = legendItems.map((item, index) => {
    const x = 74 + index * 248;
    return `
      <g transform="translate(${x} 254)">
        <line x1="0" y1="0" x2="40" y2="0" stroke="${item.color}" stroke-width="5" stroke-linecap="round" ${item.dash ? `stroke-dasharray="${item.dash}"` : ""}></line>
        <text x="52" y="5" fill="#31404d" font-size="18" font-weight="600">${escapeHtml(item.label)}</text>
      </g>
    `;
  }).join("");
  const subjectTagMarkup = snapshot.tags.map((tag, index) => {
    const x = 74 + (index % 6) * 96;
    const y = 778 + Math.floor(index / 6) * 40;
    return `
      <g transform="translate(${x} ${y})">
        <rect x="0" y="0" rx="15" ry="15" width="82" height="30" fill="rgba(31,122,122,0.08)"></rect>
        <text x="41" y="20" text-anchor="middle" fill="#1f7a7a" font-size="15" font-weight="700">${escapeHtml(tag)}</text>
      </g>
    `;
  }).join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
      <defs>
        <linearGradient id="exportCardBgV2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fffaf4"></stop>
          <stop offset="100%" stop-color="#efe4d3"></stop>
        </linearGradient>
        <linearGradient id="exportAccentBand" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e46c3d"></stop>
          <stop offset="100%" stop-color="#1f7a7a"></stop>
        </linearGradient>
      </defs>
      <rect width="${exportWidth}" height="${exportHeight}" rx="36" fill="url(#exportCardBgV2)"></rect>
      <circle cx="1128" cy="112" r="118" fill="rgba(31,122,122,0.08)"></circle>
      <circle cx="112" cy="92" r="78" fill="rgba(228,108,61,0.08)"></circle>
      <rect x="28" y="28" width="${exportWidth - 56}" height="${exportHeight - 56}" rx="30" fill="rgba(255,255,255,0.82)" stroke="rgba(31,42,55,0.08)"></rect>
      <rect x="58" y="66" width="140" height="10" rx="999" fill="url(#exportAccentBand)"></rect>
      <text x="72" y="118" fill="#1f2a37" font-size="42" font-weight="800">鎴愮哗鏇茬嚎鍒嗕韩</text>
      <text x="72" y="186" fill="#53606d" font-size="22">${escapeHtml(metricLabel)}</text>
      <text x="72" y="218" fill="#6b7280" font-size="18">${escapeHtml(rangeLabel)}</text>
      ${chipMarkup}
      ${legendMarkup}
      <g transform="translate(56 286)">
        <rect x="0" y="0" width="1168" height="454" rx="28" fill="rgba(255,255,255,0.92)" stroke="rgba(31,42,55,0.08)"></rect>
      </g>
      <g transform="translate(${chartOffsetX} ${chartOffsetY}) scale(${chartScale})">
        ${refs.trendChart.innerHTML}
      </g>
      <text x="74" y="778" fill="#6b7280" font-size="16">褰撳墠绉戠洰</text>
      ${subjectTagMarkup}
      <text x="1206" y="816" text-anchor="end" fill="#7b8793" font-size="15">鐢熸垚浜?${escapeHtml(getTodayString())}</text>
    </svg>
  `;
}

function buildTrendChartExportSnapshot() {
  const metric = refs.chartMetric?.value || "score:total";
  const chartExams = getChartExams();
  const series = buildChartSeries(metric, chartExams);
  const primarySeries = series.find((item) => item.values.some((value) => typeof value === "number")) || series[0];
  const firstValue = primarySeries ? getFirstNumericValue(primarySeries.values) : null;
  const latestValue = primarySeries ? getLastNumericValue(primarySeries.values) : null;
  const latestExam = chartExams.at(-1);
  const delta = typeof latestValue === "number" && typeof firstValue === "number" ? latestValue - firstValue : null;
  const parsedMetric = parseChartMetricValue(metric);

  return {
    chips: [
      { label: `鍏?${chartExams.length} 娆, fill: "rgba(31,122,122,0.1)", stroke: "rgba(31,122,122,0.16)", textColor: "#1f7a7a" },
      { label: parsedMetric.type === "rank" ? "鎺掑悕璧板娍" : "鎴愮哗璧板娍", fill: "rgba(228,108,61,0.12)", stroke: "rgba(228,108,61,0.16)", textColor: "#b44b25" },
      { label: latestExam ? formatDate(latestExam.date) : "--", fill: "rgba(31,42,55,0.06)", stroke: "rgba(31,42,55,0.08)", textColor: "#31404d" },
    ],
    latestExamName: latestExam?.name || "鏆傛棤鑰冭瘯",
    latestValueText: formatTrendExportValue(latestValue, primarySeries?.metricType || parsedMetric.type),
    deltaText: formatTrendExportDelta(delta, primarySeries?.metricType || parsedMetric.type),
    deltaColor: getTrendExportDeltaColor(delta, primarySeries?.metricType || parsedMetric.type),
    tags: getTrendExportTags(parsedMetric),
  };
}

function getTrendExportTags(parsedMetric) {
  if (parsedMetric.target === "total") return getActiveSubjects();
  if (parsedMetric.target === "class") return ["鐝骇鎺掑悕", ...getActiveSubjects().slice(0, 5)];
  if (parsedMetric.target && parsedMetric.target !== "total") {
    const tags = [parsedMetric.target];
    if (getAssignedSubjects().includes(parsedMetric.target)) tags.push("璧嬪垎绉戠洰");
    if (parsedMetric.type === "rank") tags.push("鎺掑悕璧板娍");
    return tags;
  }
  return getActiveSubjects();
}

function getFirstNumericValue(values) {
  return values.find((value) => typeof value === "number") ?? null;
}

function getLastNumericValue(values) {
  const copied = [...values].reverse();
  return copied.find((value) => typeof value === "number") ?? null;
}

function formatTrendExportValue(value, metricType) {
  if (typeof value !== "number") return "--";
  return metricType === "rank" ? `绗?${value} 鍚峘 : `${value} 鍒哷;
}

function formatTrendExportDelta(delta, metricType) {
  if (typeof delta !== "number") return "鏆傛棤鍙樺寲鏁版嵁";
  if (metricType === "rank") {
    if (delta < 0) return `杈冭捣鐐规彁鍗?${Math.abs(delta)} 鍚峘;
    if (delta > 0) return `杈冭捣鐐逛笅闄?${delta} 鍚峘;
    return "杈冭捣鐐规寔骞?;
  }
  if (delta > 0) return `杈冭捣鐐规彁鍗?${delta} 鍒哷;
  if (delta < 0) return `杈冭捣鐐逛笅闄?${Math.abs(delta)} 鍒哷;
  return "杈冭捣鐐规寔骞?;
}

function getTrendExportDeltaColor(delta, metricType) {
  if (typeof delta !== "number") return "#7b8793";
  if (metricType === "rank") return delta <= 0 ? "#188a61" : "#cf5348";
  return delta >= 0 ? "#188a61" : "#cf5348";
}

function buildTrendChartExportName() {
  const metricLabel = getSelectedChartMetricLabel().replace(/[\\/:*?"<>|]/g, "-");
  return `鎴愮哗鏇茬嚎鍒嗕韩-${metricLabel}-${getTodayString()}`;
}

async function exportTrendChartImage() {
  if (!refs.trendChart) return;
  if (exams.length === 0) {
    window.alert("褰撳墠杩樻病鏈夊彲瀵煎嚭鐨勬垚缁╂洸绾裤€?);
    return;
  }

  const originalLabel = refs.chartExportButton?.textContent || "瀵煎嚭鍥剧墖";
  if (refs.chartExportButton) {
    refs.chartExportButton.disabled = true;
    refs.chartExportButton.textContent = "鐢熸垚棰勮涓?..";
  }
  if (refs.chartExportPreviewImage) {
    refs.chartExportPreviewImage.removeAttribute("src");
  }
  if (refs.chartExportPreviewStatus) {
    refs.chartExportPreviewStatus.textContent = "姝ｅ湪鐢熸垚棰勮...";
    refs.chartExportPreviewStatus.classList.remove("hidden");
  }
  refs.chartExportPreviewModal?.classList.remove("hidden");

  try {
    const exportMarkup = buildTrendChartExportMarkup();
    const fileBase = buildTrendChartExportName();
    try {
      const pngBlob = await convertSvgMarkupToPng(exportMarkup, 1200, 760);
      showChartExportPreview(pngBlob, `${fileBase}.png`, "image/png");
    } catch (error) {
      const svgBlob = new Blob([exportMarkup], { type: "image/svg+xml;charset=utf-8" });
      showChartExportPreview(svgBlob, `${fileBase}.svg`, "image/svg+xml");
      console.warn("PNG export failed, fell back to SVG.", error);
    }
  } finally {
    if (refs.chartExportButton) {
      refs.chartExportButton.disabled = false;
      refs.chartExportButton.textContent = originalLabel;
    }
  }
}

function showChartExportPreview(blob, filename, mimeType) {
  cleanupChartExportPreviewUrl();
  chartExportPreviewUrl = URL.createObjectURL(blob);
  chartExportPreviewFilename = filename;

  if (refs.chartExportPreviewStatus) {
    refs.chartExportPreviewStatus.classList.add("hidden");
  }
  if (refs.chartExportPreviewImage) {
    refs.chartExportPreviewImage.src = chartExportPreviewUrl;
  }
  refs.chartExportPreviewModal?.classList.remove("hidden");

  if (refs.chartExportOpenButton) {
    refs.chartExportOpenButton.textContent = mimeType === "image/svg+xml" ? "鏂扮獥鍙ｆ墦寮€ SVG" : "鏂扮獥鍙ｆ墦寮€";
  }
  if (refs.chartExportDownloadButton) {
    refs.chartExportDownloadButton.textContent = mimeType === "image/svg+xml" ? "涓嬭浇 SVG" : "涓嬭浇鍥剧墖";
  }
}

function closeChartExportPreviewModal() {
  refs.chartExportPreviewModal?.classList.add("hidden");
  if (refs.chartExportPreviewImage) {
    refs.chartExportPreviewImage.removeAttribute("src");
  }
  if (refs.chartExportPreviewStatus) {
    refs.chartExportPreviewStatus.classList.add("hidden");
    refs.chartExportPreviewStatus.textContent = "姝ｅ湪鐢熸垚棰勮...";
  }
  cleanupChartExportPreviewUrl();
  chartExportPreviewFilename = "";
}

function cleanupChartExportPreviewUrl() {
  if (!chartExportPreviewUrl) return;
  URL.revokeObjectURL(chartExportPreviewUrl);
  chartExportPreviewUrl = "";
}

function downloadChartExportPreview() {
  if (!chartExportPreviewUrl || !chartExportPreviewFilename) return;
  const link = document.createElement("a");
  link.href = chartExportPreviewUrl;
  link.download = chartExportPreviewFilename;
  link.click();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractNumber(value) {
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : NaN;
}

function normalizeImportDate(value) {
  const normalized = String(value)
    .trim()
    .replace(/[./]/g, "-")
    .replace(/骞?g, "-")
    .replace(/鏈?g, "-")
    .replace(/鏃?g, "")
    .replace(/\s+/g, "");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatShortDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getSelectedChartMetricLabel() {
  const option = refs.chartMetric?.selectedOptions?.[0];
  return option?.textContent?.trim() || "鎬诲垎";
}

function getChartLegendItems() {
  const items = Array.from(refs.chartLegend?.querySelectorAll(".chart-legend-item") || []);
  return items.map((item) => {
    const line = item.querySelector(".chart-legend-line");
    const style = line ? window.getComputedStyle(line) : null;
    return {
      label: item.textContent?.trim() || "",
      color: style?.borderTopColor || "#1f7a7a",
      dash: line?.classList.contains("is-dashed") ? "8 6" : "",
    };
  });
}

async function convertSvgMarkupToPng(svgMarkup, width, height) {
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    const scale = Math.max(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);
    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed"));
      }, "image/png");
    });
    return pngBlob;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image load failed"));
    image.src = url;
  });
}

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function buildId() {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

