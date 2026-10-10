// Dashboard Promax · Motor de Vídeo — Vanilla JS, polling leve contra a API local.

const STAGES = [
  { key: "WHISPER", status: "WHISPER_DONE", label: "Whisper", desc: "Transcrição local (whisper.cpp)" },
  { key: "CLAUDE", status: "CLAUDE_DONE", label: "Claude", desc: "Diretor de Corte + validação do JSON" },
  { key: "RENDER", status: "RENDER_DONE", label: "Render", desc: "Clipes MP4 + projeto EDL" },
  { key: "ROUGH_CUT", status: "ROUGH_CUT_DONE", label: "Rough Cut", desc: "Remoção de silêncios" },
];
const STATUSES = ["RECEIVED", ...STAGES.map((s) => s.status)];
const STATE_LABEL = { queued: "Na fila", running: "Processando", failed: "Falhou", done: "Concluído" };
const WORKER_LABEL = { stopped: "Parado", idle: "Aguardando vídeos", busy: "Processando", stopping: "Parando…" };
const POLL_MS = 2000;

const $ = (sel, root = document) => root.querySelector(sel);
const ui = {
  conn: $("#conn"), worker: $("#worker"), workerState: $("#worker-state"), workerToggle: $("#worker-toggle"),
  rows: $("#video-rows"), empty: $("#empty"), tabs: $("#tabs"), search: $("#search"), feed: $("#feed"),
  stages: $("#stages"), drawer: $("#drawer"), scrim: $("#scrim"), dBody: $("#d-body"),
  player: $("#player"), video: $("#p-video"), toasts: $("#toasts"), retryAll: $("#retry-all"),
};

const state = {
  filter: "", query: "", videos: [], summary: null, lastEventId: 0,
  selectedId: null, detail: null, online: null, firstLoad: true, polling: null,
};

// ---------------------------------------------------------------- utilidades
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function fmtDuration(sec) {
  if (sec == null || Number.isNaN(sec)) return "—";
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}
function fmtRelative(ts) {
  if (!ts) return "—";
  const diff = Date.now() / 1000 - ts;
  if (diff < 10) return "agora";
  if (diff < 60) return `há ${Math.floor(diff)}s`;
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return new Date(ts * 1000).toLocaleDateString("pt-BR");
}
const fmtClock = (ts) => new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const fmtBytes = (n) => (n == null ? "" : n > 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.ceil(n / 1e3)} KB`);

async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: opts.body ? { "Content-Type": "application/json" } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function toast(message, tone = "info") {
  const el = document.createElement("div");
  el.className = "toast";
  el.dataset.tone = tone;
  el.textContent = message;
  ui.toasts.append(el);
  setTimeout(() => el.remove(), 4200);
}

function segmentStates(video) {
  const reached = STATUSES.indexOf(video.status);
  return STAGES.map((_, i) => {
    if (i < reached) return "done";
    if (i === reached && video.state === "running") return "running";
    if (i === reached && video.state === "failed") return "failed";
    return "pending";
  });
}

const ICONS = {
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
  spin: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  dot: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.5"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
  film: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
};

// ---------------------------------------------------------------- render: topo
function renderConnection(online) {
  if (state.online === online) return;
  state.online = online;
  ui.conn.dataset.state = online ? "live" : "offline";
  $(".conn-label", ui.conn).textContent = online ? "Ao vivo" : "Servidor offline — dados podem estar desatualizados";
}

function renderWorker(worker) {
  ui.worker.dataset.state = worker.state;
  ui.workerState.textContent = WORKER_LABEL[worker.state] || worker.state;
  const running = worker.state !== "stopped";
  ui.workerToggle.textContent = running ? "Parar" : "Iniciar";
  ui.workerToggle.className = `btn ${running ? "btn-ghost" : "btn-primary"}`;
  ui.workerToggle.disabled = worker.state === "stopping";
}

function renderKpis(s) {
  const b = s.by_state;
  $("#k-queued").textContent = b.queued;
  $("#k-running").textContent = b.running;
  $("#k-done").textContent = b.done;
  $("#k-failed").textContent = b.failed;
  $("#k-clips").textContent = s.clips;
  $("#k-done-sub").textContent = s.total ? `${Math.round((b.done / s.total) * 100)}% de ${s.total}` : "";
  ui.retryAll.hidden = !b.failed;
  for (const el of ui.tabs.querySelectorAll("[data-count]")) {
    const key = el.dataset.count;
    el.textContent = key === "all" ? s.total : b[key];
  }
}

function renderStages(s) {
  // Quantos vídeos JÁ passaram por cada marco (cumulativo), e o tempo médio da etapa.
  const reachedAtLeast = (status) => STATUSES.slice(STATUSES.indexOf(status)).reduce((acc, st) => acc + (s.by_status[st] || 0), 0);
  const cols = [{ key: "RECEIVED", status: "RECEIVED", label: "Recebidos" }, ...STAGES];
  ui.stages.innerHTML = cols.map((c, i) => {
    const n = reachedAtLeast(c.status);
    const pct = s.total ? (n / s.total) * 100 : 0;
    const avg = s.stage_avg[c.key];
    const meta = i === 0 ? "vídeos registrados" : avg ? `média ${fmtDuration(avg.avg_s)} · ${avg.runs} execuções` : "sem execuções ainda";
    return `<li class="stage">
      <div class="stage-top"><span class="stage-num">${i}</span><span class="stage-name">${esc(c.status)}</span></div>
      <div class="stage-count">${n}<small>/ ${s.total}</small></div>
      <div class="stage-bar" role="progressbar" aria-label="${esc(c.status)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><span style="width:${pct}%"></span></div>
      <div class="stage-meta">${esc(meta)}</div>
    </li>`;
  }).join("");
}

// ---------------------------------------------------------------- render: tabela
function renderRows() {
  const videos = state.videos;
  if (state.firstLoad) return;
  if (!videos.length) {
    ui.rows.innerHTML = "";
    ui.empty.hidden = false;
    const filtered = state.filter || state.query;
    ui.empty.innerHTML = `<div class="glyph">${ICONS.film}</div>${filtered
      ? "<strong>Nenhum vídeo neste filtro</strong>Tente outro filtro ou limpe a busca."
      : "<strong>Fila vazia</strong>Cole a pasta de um curso acima e clique em <b>Enfileirar</b>."}`;
    return;
  }
  ui.empty.hidden = true;
  ui.rows.innerHTML = videos.map((v) => {
    const segs = segmentStates(v);
    const stage = v.state === "running" && v.current_stage ? ` · ${v.current_stage}` : "";
    return `<tr tabindex="0" data-id="${v.id}" data-selected="${v.id === state.selectedId}" aria-label="Abrir ${esc(v.title)}">
      <td><div class="v-title" title="${esc(v.title)}">${esc(v.title)}</div><div class="v-course">${esc(v.course)}</div></td>
      <td class="col-progress">
        <div class="segments">${segs.map((s, i) => `<span class="seg" data-s="${s}" title="${STAGES[i].label}: ${s}"></span>`).join("")}</div>
        <div class="seg-labels">${STAGES.map((s) => `<span>${s.label.toUpperCase()}</span>`).join("")}</div>
      </td>
      <td><span class="badge" data-state="${v.state}">${STATE_LABEL[v.state]}${esc(stage)}</span><div class="v-course mono" style="margin-top:4px">${esc(v.status)}</div></td>
      <td class="num col-attempts">${v.attempts}</td>
      <td class="col-updated">${fmtRelative(v.updated_at)}</td>
      <td><div class="row-action">${v.state === "failed" ? `<button class="btn btn-danger btn-sm" data-retry="${v.id}" type="button">Reprocessar</button>` : ""}${ICONS.chev}</div></td>
    </tr>`;
  }).join("");
}

function renderSkeleton() {
  ui.rows.innerHTML = Array.from({ length: 5 }, () =>
    `<tr class="skeleton"><td><div style="width:70%"></div></td><td><div style="width:200px"></div></td><td><div style="width:90px"></div></td><td><div style="width:20px"></div></td><td><div style="width:60px"></div></td><td></td></tr>`).join("");
}

// ---------------------------------------------------------------- render: feed
function feedItem(e, showTitle = true) {
  return `<li class="feed-item" data-level="${esc(e.level)}">
    <span class="fi-dot"></span>
    <div><div class="fi-msg">${esc(e.message)}</div>
    <div class="fi-meta"><span>${fmtClock(e.ts)}</span>${e.stage ? `<span>· ${esc(e.stage)}</span>` : ""}${showTitle && e.title ? `<b>· ${esc(e.title)}</b>` : ""}</div></div>
  </li>`;
}

function appendFeed(events) {
  if (!events.length) {
    if (!ui.feed.children.length) ui.feed.innerHTML = '<li class="feed-empty">Nenhum evento ainda. Os passos do pipeline aparecem aqui em tempo real.</li>';
    return;
  }
  $(".feed-empty", ui.feed)?.remove();
  ui.feed.insertAdjacentHTML("afterbegin", events.slice().reverse().map((e) => feedItem(e)).join(""));
  while (ui.feed.children.length > 200) ui.feed.lastElementChild.remove();
}

// ---------------------------------------------------------------- drawer
function stageRunsByName(runs) {
  const map = {};
  for (const r of runs) map[r.stage] = r; // última execução de cada etapa
  return map;
}

function renderDetail(v) {
  $("#d-course").textContent = v.course || "Sem curso";
  $("#d-title").textContent = v.title;
  $("#d-path").textContent = v.path;
  $("#d-path").title = v.path;

  const segs = segmentStates(v);
  const runs = stageRunsByName(v.stage_runs);
  const clips = v.artifacts.filter((a) => a.kind === "clip");
  const byKind = (k) => v.artifacts.find((a) => a.kind === k);
  const totalStage = v.stage_runs.filter((r) => r.ok === 1).reduce((acc, r) => acc + (r.finished_at - r.started_at), 0);

  const timeline = STAGES.map((st, i) => {
    const r = runs[st.key];
    const s = segs[i];
    const icon = s === "done" ? ICONS.check : s === "running" ? ICONS.spin : s === "failed" ? ICONS.x : ICONS.dot;
    let time = "";
    if (s === "running" && r) time = fmtDuration(Date.now() / 1000 - r.started_at);
    else if (r && r.finished_at) time = fmtDuration(r.finished_at - r.started_at);
    return `<li class="tl" data-s="${s}"><span class="tl-icon">${icon}</span>
      <div><div class="tl-name">${st.status}</div><div class="tl-sub">${esc(st.desc)}</div></div>
      <span class="tl-time">${time}</span></li>`;
  }).join("");

  const cuts = v.cuts || [];
  const clipCards = (cuts.length ? cuts : clips).map((item, i) => {
    const cut = cuts.length ? item : null;
    const clip = clips.find((c) => c.name.match(new RegExp(`_corte_${i + 1}\\.[^.]+$`))) || (cuts.length ? null : item);
    const title = cut?.titulo || clip?.name || `Corte ${i + 1}`;
    return `<div class="clip">
      <button class="play" type="button" ${clip?.exists ? "" : "disabled"} data-play="${clip?.id ?? ""}" data-title="${esc(title)}"
        data-note="${esc(cut ? `${cut.start} → ${cut.end} no vídeo original. ${cut.motivo || ""}` : clip?.name || "")}"
        aria-label="Assistir ${esc(title)}">${ICONS.play}</button>
      <div><div class="clip-title">${esc(title)}</div>
        ${cut ? `<div class="clip-time">${esc(cut.start)} → ${esc(cut.end)}</div>` : ""}
        ${cut?.motivo ? `<div class="clip-why">${esc(cut.motivo)}</div>` : ""}</div>
      <span class="tl-time">${clip ? fmtBytes(clip.size) : "aguardando render"}</span>
    </div>`;
  }).join("");

  const fileLink = (kind, label) => {
    const a = byKind(kind);
    return a ? `<a class="file" href="${a.url}" target="_blank" rel="noopener" aria-disabled="${!a.exists}"><b>${label}</b>${esc(a.name)}</a>` : "";
  };
  const source = byKind("source");
  const rough = byKind("rough_cut");

  ui.dBody.innerHTML = `
    <section class="d-section"><div class="d-meta">
      <div><span>Estado</span><strong><span class="badge" data-state="${v.state}">${STATE_LABEL[v.state]}</span></strong></div>
      <div><span>Duração do vídeo</span><strong>${fmtDuration(v.duration_s)}</strong></div>
      <div><span>Tempo de pipeline</span><strong>${fmtDuration(totalStage)}</strong></div>
      <div><span>Tentativas</span><strong>${v.attempts}</strong></div>
    </div></section>
    ${v.last_error ? `<section class="error-box" role="alert"><pre>${esc(v.last_error)}</pre>
      <div><button class="btn btn-danger btn-sm" type="button" data-retry="${v.id}">Reprocessar a partir de ${esc(STAGES[STATUSES.indexOf(v.status)]?.status || v.status)}</button></div></section>` : ""}
    <section class="d-section"><h3>Etapas</h3><ol class="timeline">${timeline}</ol></section>
    <section class="d-section"><h3>Cortes gerados</h3>
      <div class="clips">${clipCards || '<div class="feed-empty">Os cortes aparecem aqui depois das etapas Claude e Render.</div>'}</div></section>
    <section class="d-section"><h3>Versões completas</h3><div class="clips">
      ${source ? `<div class="clip"><button class="play" type="button" data-play="${source.id}" data-title="Original · ${esc(v.title)}" data-note="Vídeo original, sem cortes." ${source.exists ? "" : "disabled"} aria-label="Assistir original">${ICONS.play}</button>
        <div><div class="clip-title">Original</div><div class="clip-why">${esc(source.name)}</div></div><span class="tl-time">${fmtBytes(source.size)}</span></div>` : ""}
      ${rough ? `<div class="clip"><button class="play" type="button" data-play="${rough.id}" data-title="Rough cut · ${esc(v.title)}" data-note="Versão com silêncios removidos." ${rough.exists ? "" : "disabled"} aria-label="Assistir rough cut">${ICONS.play}</button>
        <div><div class="clip-title">Rough cut (sem silêncios)</div><div class="clip-why">${esc(rough.name)}</div></div><span class="tl-time">${fmtBytes(rough.size)}</span></div>` : ""}
    </div></section>
    <section class="d-section"><h3>Arquivos</h3><div class="files">
      ${fileLink("srt", "srt")}${fileLink("cuts_json", "json")}${fileLink("edl", "edl")}
      ${!byKind("srt") && !byKind("cuts_json") ? '<span class="tl-sub">Nenhum arquivo gerado ainda.</span>' : ""}
    </div></section>
    <section class="d-section"><h3>Histórico</h3><ol class="d-events">${v.events.slice().reverse().map((e) => feedItem(e, false)).join("")}</ol></section>`;
}

async function openDetail(id, { focus = true } = {}) {
  state.selectedId = id;
  try {
    state.detail = await api(`/api/videos/${id}`);
  } catch (err) {
    toast(`Não foi possível abrir: ${err.message}`, "error");
    return;
  }
  renderDetail(state.detail);
  if (ui.drawer.getAttribute("aria-hidden") === "true") {
    ui.scrim.hidden = false;
    ui.drawer.setAttribute("aria-hidden", "false");
    if (focus) ui.drawer.focus();
  }
  renderRows();
}

function closeDetail() {
  ui.drawer.setAttribute("aria-hidden", "true");
  ui.scrim.hidden = true;
  const id = state.selectedId;
  state.selectedId = null;
  state.detail = null;
  renderRows();
  ui.rows.querySelector(`tr[data-id="${id}"]`)?.focus();
}

function openPlayer(btn) {
  ui.video.src = `/media/${btn.dataset.play}`;
  $("#p-title").textContent = btn.dataset.title;
  $("#p-eyebrow").textContent = state.detail?.title || "";
  $("#p-note").textContent = btn.dataset.note || "";
  ui.player.showModal();
  ui.video.play().catch(() => {});
}
function closePlayer() {
  ui.video.pause();
  ui.video.removeAttribute("src");
  ui.video.load();
  if (ui.player.open) ui.player.close();
}

// ---------------------------------------------------------------- dados
async function refresh() {
  try {
    const params = new URLSearchParams();
    if (state.filter) params.set("state", state.filter);
    if (state.query) params.set("q", state.query);
    const [summary, videos, events] = await Promise.all([
      api("/api/summary"),
      api(`/api/videos?${params}`),
      api(`/api/events?since=${state.lastEventId}&limit=100`),
    ]);
    renderConnection(true);
    state.summary = summary;
    state.videos = videos;
    state.firstLoad = false;
    renderWorker(summary.worker);
    renderKpis(summary);
    renderStages(summary);
    renderRows();
    if (events.length) state.lastEventId = events[events.length - 1].id;
    appendFeed(events);
    if (state.selectedId != null) {
      const sel = videos.find((v) => v.id === state.selectedId);
      if (!sel || sel.updated_at !== state.detail?.updated_at || sel.state === "running") {
        await openDetail(state.selectedId, { focus: false });
      }
    }
  } catch (err) {
    renderConnection(false);
  }
}

function schedule() {
  clearTimeout(state.polling);
  state.polling = setTimeout(async () => {
    if (!document.hidden) await refresh();
    schedule();
  }, POLL_MS);
}

// ---------------------------------------------------------------- eventos de UI
$("#ingest-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const input = $("#ingest-path");
  const btn = $("#ingest-btn");
  btn.disabled = true;
  try {
    const r = await api("/api/ingest", { method: "POST", body: { path: input.value } });
    toast(`${r.found} vídeo(s) encontrado(s) · ${r.created} novo(s) na fila`, "success");
    if (r.created && ui.worker.dataset.state === "stopped") toast("Clique em Iniciar para o worker começar a processar.");
    input.value = "";
    await refresh();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
  }
});

ui.workerToggle.addEventListener("click", async () => {
  const stopping = ui.worker.dataset.state !== "stopped";
  ui.workerToggle.disabled = true;
  try {
    const r = await api(`/api/worker/${stopping ? "stop" : "start"}`, { method: "POST", body: {} });
    renderWorker(r.worker);
    toast(stopping ? "Worker vai parar ao fim da etapa atual." : "Worker iniciado.", "success");
  } catch (err) {
    toast(err.message, "error");
  } finally {
    ui.workerToggle.disabled = false;
  }
});

ui.retryAll.addEventListener("click", async () => {
  const r = await api("/api/retry-failed", { method: "POST", body: {} }).catch((e) => toast(e.message, "error"));
  if (r) { toast(`${r.requeued} vídeo(s) de volta à fila`, "success"); refresh(); }
});

async function retry(id) {
  try {
    const r = await api(`/api/videos/${id}/retry`, { method: "POST", body: {} });
    toast(r.ok ? "Vídeo de volta à fila — retoma da etapa que falhou." : "Este vídeo não está em falha.", r.ok ? "success" : "info");
    await refresh();
  } catch (err) {
    toast(err.message, "error");
  }
}

ui.rows.addEventListener("click", (ev) => {
  const retryBtn = ev.target.closest("[data-retry]");
  if (retryBtn) { ev.stopPropagation(); return retry(Number(retryBtn.dataset.retry)); }
  const tr = ev.target.closest("tr[data-id]");
  if (tr) openDetail(Number(tr.dataset.id));
});
ui.rows.addEventListener("keydown", (ev) => {
  const tr = ev.target.closest("tr[data-id]");
  if (!tr) return;
  if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openDetail(Number(tr.dataset.id)); }
  if (ev.key === "ArrowDown") { ev.preventDefault(); tr.nextElementSibling?.focus(); }
  if (ev.key === "ArrowUp") { ev.preventDefault(); tr.previousElementSibling?.focus(); }
});
ui.dBody.addEventListener("click", (ev) => {
  const play = ev.target.closest("[data-play]");
  if (play && !play.disabled) return openPlayer(play);
  const retryBtn = ev.target.closest("[data-retry]");
  if (retryBtn) retry(Number(retryBtn.dataset.retry));
});

ui.tabs.addEventListener("click", (ev) => {
  const tab = ev.target.closest("[role=tab]");
  if (!tab) return;
  for (const t of ui.tabs.querySelectorAll("[role=tab]")) t.setAttribute("aria-selected", String(t === tab));
  state.filter = tab.dataset.state;
  refresh();
});

let searchTimer;
ui.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.query = ui.search.value.trim(); refresh(); }, 200);
});

$("#d-close").addEventListener("click", closeDetail);
ui.scrim.addEventListener("click", closeDetail);
$("#p-close").addEventListener("click", closePlayer);
ui.player.addEventListener("close", closePlayer);
ui.player.addEventListener("click", (ev) => { if (ev.target === ui.player) closePlayer(); });

document.addEventListener("keydown", (ev) => {
  const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (ev.key === "/" && !typing) { ev.preventDefault(); ui.search.focus(); }
  if (ev.key === "Escape" && !ui.player.open && state.selectedId != null) closeDetail();
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });

// ---------------------------------------------------------------- boot
renderSkeleton();
refresh().then(schedule);
