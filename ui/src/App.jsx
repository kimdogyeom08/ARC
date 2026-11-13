import React, { useMemo, useRef, useState } from "react";
import championRoster from "./data/champions.json";

const BUILDS_PAGE_SIZE = 10;

const featuredChampions = [
  { id: "Jinx", name: "징크스", title: "난폭한 말괄량이", accent: "#fc7190", role: "ADC" },
  { id: "Ahri", name: "아리", title: "구미호", accent: "#c58cff", role: "MID" },
  { id: "Morgana", name: "모르가나", title: "타락한 자", accent: "#9b8cff", role: "SUP" },
  { id: "Yasuo", name: "야스오", title: "용서받지 못한 자", accent: "#4ca9ca", role: "MID" },
  { id: "Lux", name: "럭스", title: "광명의 소녀", accent: "#f0c868", role: "MID" },
  { id: "KaiSa", name: "카이사", title: "공허의 딸", accent: "#a17cf4", role: "ADC" },
  { id: "LeeSin", name: "리 신", title: "눈먼 수도승", accent: "#e49a5e", role: "JUNGLE" },
  { id: "Garen", name: "가렌", title: "데마시아의 힘", accent: "#77a7e8", role: "TOP" },
];

const featuredChampionsById = new Map(featuredChampions.map((champion) => [champion.id, champion]));
const champions = championRoster.map(([gameId, alias, name]) => {
  const id = alias === "Kaisa" ? "KaiSa" : alias;
  const featured = featuredChampionsById.get(id);
  return {
    id,
    gameId,
    name,
    title: featured?.title ?? "",
    accent: featured?.accent ?? "#7d92c8",
  };
});

const runes = {
  precision: { name: "정밀", mark: "✦", color: "#e9c34e", keystone: ["집중 공격", "치명적 속도", "기민한 발놀림", "정복자"], primaryRows: [["생명 흡수", "승전보", "침착"], ["전설: 민첩함", "전설: 가속", "전설: 핏빛 길"], ["최후의 일격", "체력차 극복", "최후의 저항"]] },
  domination: { name: "지배", mark: "◈", color: "#d84b4b", keystone: ["감전", "어둠의 수확", "칼날비"], primaryRows: [["비열한 한 방", "피의 맛", "돌발 일격"], ["육감", "섬뜩한 기념품", "깊은 와드"], ["보물 사냥꾼", "끈질긴 사냥꾼", "궁극의 사냥꾼"]] },
  sorcery: { name: "마법", mark: "✧", color: "#44a9d8", keystone: ["콩콩이 소환", "신비로운 유성", "폭풍전사의 포효", "죽음불꽃 손길"], primaryRows: [["액시옴 비전 마법사", "마나순환 팔찌", "빛의 망토"], ["깨달음", "기민함", "절대 집중"], ["주문 작열", "물 위를 걷는 자", "폭풍의 결집"]] },
  resolve: { name: "결의", mark: "⬟", color: "#4cbb91", keystone: ["착취의 손아귀", "여진", "수호자"], primaryRows: [["철거", "생명의 샘", "보호막 강타"], ["사전 준비", "재생의 바람", "뼈 방패"], ["과잉성장", "소생", "불굴의 의지"]] },
  inspiration: { name: "영감", mark: "❋", color: "#69c6bc", keystone: ["빙결 강화", "봉인 풀린 주문서", "선제공격"], primaryRows: [["마법공학 점멸기", "마법의 신발", "환급"], ["삼중 물약", "시간 왜곡 물약", "비스킷 배달"], ["우주적 통찰력", "쾌속 접근", "다재다능"]] },
};

const shardOptions = [
  ["적응형 능력치", "공격 속도", "스킬 가속"],
  ["적응형 능력치", "이동 속도", "체력 증가"],
  ["체력", "강인함 및 둔화 저항", "체력 증가"],
];

const seedBuilds = [
  { id: "demo-1", champion: "Morgana", path: "sorcery", secondary: "inspiration", keystone: "콩콩이 소환", primaryRunes: ["마나순환 팔찌", "깨달음", "주문 작열"], secondaryRunes: ["마법의 신발", "우주적 통찰력"], shards: ["공격 속도", "적응형 능력치", "체력"], skillOrder: ["W", "Q", "E", "W", "W", "R", "W", "Q"], items: [], lane: "SUP", date: "방금 전" },
  { id: "demo-2", champion: "Ahri", path: "domination", secondary: "sorcery", keystone: "감전", primaryRunes: ["돌발 일격", "육감", "궁극의 사냥꾼"], secondaryRunes: ["마나순환 팔찌", "깨달음"], shards: ["공격 속도", "적응형 능력치", "체력"], skillOrder: ["Q", "W", "E", "Q", "Q", "R", "Q", "W"], items: [], lane: "MID", date: "오늘 09:42" },
  { id: "demo-3", champion: "Jinx", path: "precision", secondary: "inspiration", keystone: "기민한 발놀림", primaryRunes: ["승전보", "전설: 민첩함", "체력차 극복"], secondaryRunes: ["마법의 신발", "비스킷 배달"], shards: ["공격 속도", "적응형 능력치", "체력"], skillOrder: ["Q", "W", "E", "Q", "Q", "R", "Q", "W"], items: [], lane: "ADC", date: "어제 21:18" },
  { id: "demo-4", champion: "Yasuo", path: "precision", secondary: "resolve", keystone: "정복자", primaryRunes: ["승전보", "최후의 일격", "체력차 극복"], secondaryRunes: ["재생의 바람", "과잉성장"], shards: ["공격 속도", "적응형 능력치", "체력"], skillOrder: ["Q", "E", "Q", "W", "Q", "R", "Q", "E"], items: [], lane: "MID", date: "어제 15:06" },
];

const laneNames = { TOP: "탑", JUNGLE: "정글", MID: "미드", ADC: "바텀", SUP: "서포터" };
const championDataUrl = (champion) => `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/ko_kr/v1/champion-icons/${champion.gameId}.png`;

function pickRandom(values, count) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function championInfo(id) {
  return champions.find((champion) => champion.id === id) || champions[0];
}

function ChampionImage({ champion, className = "" }) {
  return (
    <span className={`champion-image ${className}`} role="img" aria-label={`${champion.name} 챔피언 초상화`} style={{ "--champ-accent": champion.accent }}>
      <img src={championDataUrl(champion)} alt="" onError={(event) => event.currentTarget.remove()} />
      <span aria-hidden="true">{champion.name.slice(0, 1)}</span>
    </span>
  );
}

function loadBuilds() {
  try {
    const saved = window.localStorage.getItem("arc-builds");
    if (!saved) return seedBuilds;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : seedBuilds;
  } catch (error) {
    console.error("Could not read saved ARC builds", error);
    return seedBuilds;
  }
}

function persistBuilds(builds) {
  try {
    window.localStorage.setItem("arc-builds", JSON.stringify(builds));
    return true;
  } catch (error) {
    console.error("Could not save ARC builds", error);
    return false;
  }
}

function App() {
  const [builds, setBuilds] = useState(loadBuilds);
  const [visibleBuildCount, setVisibleBuildCount] = useState(BUILDS_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState(builds[0]?.id ?? null);
  const [page, setPage] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");

  const selectedBuild = builds.find((build) => build.id === selectedId) ?? builds[0] ?? null;

  function updateBuilds(nextBuilds, message) {
    setBuilds(nextBuilds);
    if (persistBuilds(nextBuilds)) {
      if (message) notify(message);
      return true;
    }
    notify("브라우저 저장 공간에 기록하지 못했습니다.");
    return false;
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function deleteBuild(id) {
    if (!window.confirm("이 빌드를 삭제할까요? 삭제한 빌드는 복구할 수 없습니다.")) return;
    const next = builds.filter((build) => build.id !== id);
    const saved = updateBuilds(next, "빌드를 삭제했습니다.");
    if (saved) {
      setSelectedId(next[0]?.id ?? null);
      if (!next.length) setVisibleBuildCount(BUILDS_PAGE_SIZE);
    }
  }

  function addBuild(build) {
    const next = [build, ...builds];
    if (updateBuilds(next, "새 빌드를 보관함에 저장했습니다.")) {
      setVisibleBuildCount(BUILDS_PAGE_SIZE);
      setSelectedId(build.id);
      setPage("home");
    }
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <Header page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="shell">
        {page === "home" && (
          <div className="workspace-heading">
            <div>
              <div className="eyebrow"><span className="live-dot" /> YOUR RANDOM CHALLENGE</div>
              <h1>빌드</h1>
              <p>당신의 오늘의 행운은?</p>
            </div>
          </div>
        )}
        {page === "home" ? (
          <HomePage
            builds={builds}
            visibleBuildCount={visibleBuildCount}
            selectedBuild={selectedBuild}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onDelete={deleteBuild}
            onCreate={() => setPage("roulette")}
            onShowMore={() => setVisibleBuildCount((count) => count + BUILDS_PAGE_SIZE)}
            onNotify={notify}
          />
        ) : (
          <RoulettePage onSave={addBuild} onCancel={() => setPage("home")} onNotify={notify} />
        )}
      </main>
      <footer className="footer">
        <span>ARC <span className="footer-separator">/</span> ALL RANDOM CHALLENGE</span>
        <span>게임 데이터 및 빌드 저장 API는 다음 단계에서 연결됩니다.</span>
      </footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function Header({ page, setPage, darkMode, setDarkMode }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setPage("home")} aria-label="All Random Challenge 메인 화면">
        <img className="brand-icon" src={`${import.meta.env.BASE_URL}arc-icon.png`} alt="" />
        <span className="brand-copy"><strong>All Random Challenge</strong></span>
      </button>
      {page === "roulette" && <button className="nav-link active back-link" onClick={() => setPage("home")}>← 빌드</button>}
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}>
        <span>{darkMode ? "☼" : "☾"}</span><span className="theme-label">{darkMode ? "라이트 모드" : "다크 모드"}</span>
      </button>
    </header>
  );
}

function HomePage({ builds, visibleBuildCount, selectedBuild, selectedId, setSelectedId, onDelete, onCreate, onShowMore, onNotify }) {
  const visibleBuilds = builds.slice(0, visibleBuildCount);
  const remainingCount = builds.length - visibleBuilds.length;

  return (
    <>
      {!builds.length && (
        <section className="empty-detail">
          <div className="empty-icon">✦</div>
          <h2>아직 저장한 빌드가 없어요</h2>
          <p>룰렛에서 챔피언과 룬을 조합해 첫 번째 빌드를 만들어 보세요.</p>
          <button className="button primary" onClick={onCreate}>첫 빌드 만들기 <span>↗</span></button>
        </section>
      )}
      <section className="saved-section">
        {builds.length ? (
          <div className="build-list">
            <div className="list-head"><span>챔피언 / 룬</span><span>스킬 마스터리</span><span>라인</span><span /></div>
            {visibleBuilds.map((build, index) => (
              <BuildRow
                key={build.id}
                build={build}
                index={index}
                selected={build.id === (selectedBuild?.id ?? selectedId)}
                onClick={() => setSelectedId(build.id)}
                onDelete={onDelete}
                onNotify={onNotify}
              />
            ))}
          </div>
        ) : <div className="list-empty">저장된 빌드가 없습니다.</div>}
        {remainingCount > 0 && (
          <button className="button load-more" onClick={onShowMore}>
            더보기 <span>{Math.min(BUILDS_PAGE_SIZE, remainingCount)}개 더</span>
          </button>
        )}
      </section>
      <button className="floating-add" onClick={onCreate} aria-label="새 룰렛 빌드 추가" title="새 빌드 만들기"><span>+</span><small>새 빌드</small></button>
    </>
  );
}

function BuildDetail({ build, onDelete, onNotify }) {
  const champ = championInfo(build.champion);

  async function downloadCard() {
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(document.getElementById("build-export-card"), { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `ARC-${champ.name}-build.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      onNotify("빌드 이미지를 다운로드했습니다.");
    } catch (error) {
      console.error("Could not export build image", error);
      onNotify("이미지 다운로드에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <section className="detail-card expanded-detail" id="build-export-card">
      <div className="detail-main">
        <div className="champion-showcase" style={{ "--champ-accent": champ.accent }}>
          <div className="champion-orbit" />
          <ChampionImage champion={champ} className="champion-portrait" />
          <div className="champion-caption"><span>CHAMPION</span><strong>{champ.name}</strong>{champ.title && <small>{champ.title}</small>}</div>
          <span className="champion-index">0{(champions.findIndex((item) => item.id === champ.id) + 1).toString()}</span>
        </div>
        <div className="rune-display">
          <div className="detail-label"><span>01</span> RUNE SETUP</div>
          <div className="rune-paths">
            <RunePath path={build.path} keystone={build.keystone} choices={build.primaryRunes} />
            <div className="rune-divider" />
            <RunePath path={build.secondary} choices={build.secondaryRunes} secondaryPath />
          </div>
          <div className="shard-row"><span className="shard-caption">파편</span>{(build.shards || []).map((shard, index) => <span className="shard-chip" key={`${shard}-${index}`}>{shard}</span>)}</div>
        </div>
        <div className="detail-side">
          <div className="skill-box">
            <div className="skill-box-heading"><div className="detail-label"><span>02</span> 추천 스킬 마스터리</div><button className="download-button" onClick={downloadCard} aria-label="선택 빌드를 PNG 이미지로 다운로드" title="빌드 이미지 다운로드">↓</button></div>
            {build.skillOrder?.length ? <div className="skill-sequence">{build.skillOrder.map((skill, index) => <span className={index === 0 ? "skill-step first" : "skill-step"} key={`${skill}-${index}`}>{skill}</span>)}</div> : null}
          </div>
          <div className="item-box">
            <div className="detail-label"><span>03</span> 추천 아이템 빌드</div>
            {build.items?.length ? <div className="item-sequence">{build.items.map((item, index) => <span className="item-step" key={item}>{item}<i>{index + 1}</i></span>)}</div> : null}
          </div>
          <div className="detail-bottom">
            <div><div className="detail-label"><span>04</span> 추천 라인</div><span className="lane-subtitle">{laneNames[build.lane] || "라인 미지정"}</span></div>
            {build.lane ? <LaneMap lane={build.lane} /> : <span className="lane-unknown">—</span>}
            <button className="delete-button" onClick={() => onDelete(build.id)} aria-label="선택 빌드 삭제" title="빌드 삭제">⌫</button>
          </div>
        </div>
      </div>
      <div className="detail-meta"><span><span className="save-dot" /> 빌드 <span className="meta-divider">·</span> {build.date || "방금 전"}</span><span>빌드 상세 정보 <b>↗</b></span></div>
    </section>
  );
}

function RunePath({ path, keystone, choices = [], secondaryPath = false }) {
  const info = runes[path];
  return (
    <div className={secondaryPath ? "rune-path secondary-path" : "rune-path"}>
      <div className="path-heading"><span className="rune-emblem" style={{ "--rune-color": info.color }}>{info.mark}</span><strong>{info.name}</strong><small>{secondaryPath ? "보조 룬" : "주 룬"}</small></div>
      {!secondaryPath && <div className="keystone-rune" style={{ "--rune-color": info.color }}><span>{info.mark}</span><strong>{keystone}</strong></div>}
      <div className="rune-choice-grid">{choices.map((rune, index) => <span className="rune-choice" key={`${rune}-${index}`} title={rune}><i style={{ "--rune-color": info.color }}>{index === 0 && !secondaryPath ? "✦" : "·"}</i><span>{rune}</span></span>)}</div>
    </div>
  );
}

function BuildRow({ build, index, selected, onClick, onDelete, onNotify }) {
  const champ = championInfo(build.champion);
  const path = runes[build.path] || runes.precision;
  const secondary = runes[build.secondary] || runes.inspiration;
  return (
    <div className={selected ? "build-entry expanded" : "build-entry"}>
    <button className={selected ? "build-row selected" : "build-row"} onClick={onClick} aria-pressed={selected}>
      <span className="row-champion">
        <ChampionImage champion={champ} className="row-avatar" />
        <span className="row-champ-name"><strong>{champ.name}</strong><small><span className="mini-rune" style={{ "--rune-color": path.color }}>{path.mark}</span>{build.keystone}<i>·</i><span className="mini-rune" style={{ "--rune-color": secondary.color }}>{secondary.mark}</span>{secondary.name}</small></span>
      </span>
      <span className="row-skills">{build.skillOrder?.length ? build.skillOrder.slice(0, 7).map((skill, order) => <i className={order === 0 ? "row-skill active" : "row-skill"} key={`${skill}-${order}`}>{skill}</i>) : <span className="row-placeholder">—</span>}</span>
      <span className="row-lane">{build.lane ? <LaneMap lane={build.lane} small /> : <span className="row-placeholder">—</span>}</span>
      <span className="row-trailing"><span className="row-date">{build.date || `시연 ${index + 1}`}</span><span className="row-chevron">↗</span></span>
    </button>
    {selected && <div className="build-expansion"><BuildDetail build={build} onDelete={onDelete} onNotify={onNotify} /></div>}
    </div>
  );
}

function LaneMap({ lane, small = false }) {
  const points = { TOP: [10, 10], JUNGLE: [23, 24], MID: [24, 24], ADC: [37, 38], SUP: [37, 38] };
  const [x, y] = points[lane] || [24, 24];
  return (
    <span className={small ? "lane-map small" : "lane-map"} title={laneNames[lane] || "라인"}>
      <svg viewBox="0 0 48 48" role="img" aria-label={`${laneNames[lane] || "미지정"} 라인 아이콘`}>
        <path className="map-path" d="M8 40 40 8M9 10h8v8M31 30h8v8M8 8h32v32H8z" />
        <circle className="map-marker" cx={x} cy={y} r={small ? "4.5" : "5.5"} />
      </svg>
    </span>
  );
}

function RoulettePage({ onSave, onCancel, onNotify }) {
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [currentRoll, setCurrentRoll] = useState(null);
  const [champion, setChampion] = useState(null);
  const [spinIndex, setSpinIndex] = useState(0);
  const [path, setPath] = useState("");
  const [secondary, setSecondary] = useState("");
  const [keystone, setKeystone] = useState("");
  const [primaryRunes, setPrimaryRunes] = useState([]);
  const [secondaryRunes, setSecondaryRunes] = useState([]);
  const [shards, setShards] = useState([]);
  const [lane, setLane] = useState("");
  const [saving, setSaving] = useState(false);
  const skipRequested = useRef(false);
  const previewChamp = champion ? championInfo(champion) : champions[spinIndex % champions.length];
  const primaryPath = path ? runes[path] : null;
  const secondaryPath = secondary ? runes[secondary] : null;
  const complete = !spinning && champion && path && keystone && primaryRunes.length === 3 && secondary && secondaryRunes.length === 2 && shards.filter(Boolean).length === 3 && lane;

  function makeRuneSteps() {
    const primaryKey = pickRandom(Object.keys(runes), 1)[0];
    const secondaryKeys = Object.keys(runes).filter((key) => key !== primaryKey);
    const secondaryKey = pickRandom(secondaryKeys, 1)[0];
    const primary = runes[primaryKey];
    const secondaryPathInfo = runes[secondaryKey];
    const primaryChoices = primary.primaryRows.map((row) => pickRandom(row, 1)[0]);
    const secondaryRowIndexes = pickRandom([0, 1, 2], 2);
    const secondaryChoices = secondaryRowIndexes.map((rowIndex) => pickRandom(secondaryPathInfo.primaryRows[rowIndex], 1)[0]);
    const chosenShards = shardOptions.map((options) => pickRandom(options, 1)[0]);
    const chosenLane = pickRandom(Object.keys(laneNames), 1)[0];
    return [
      { field: "path", label: "주 룬 경로", pool: Object.keys(runes).map((key) => runes[key].name), value: primary.name, apply: () => setPath(primaryKey) },
      { field: "keystone", label: "핵심 룬", pool: primary.keystone, value: pickRandom(primary.keystone, 1)[0], apply: (value) => setKeystone(value) },
      ...primaryChoices.map((value, rowIndex) => ({ field: `primaryRune${rowIndex}`, label: `주 룬 ${rowIndex + 1}행`, pool: primary.primaryRows[rowIndex], value, apply: (picked) => setPrimaryRunes((current) => [...current, picked]) })),
      { field: "secondaryPath", label: "보조 룬 경로", pool: secondaryKeys.map((key) => runes[key].name), value: secondaryPathInfo.name, apply: () => setSecondary(secondaryKey) },
      ...secondaryChoices.map((value, index) => {
        const rowIndex = secondaryRowIndexes[index];
        return { field: `secondaryRune${rowIndex}`, label: `보조 룬 ${rowIndex + 1}행`, pool: secondaryPathInfo.primaryRows[rowIndex], value, apply: (picked) => setSecondaryRunes((current) => [...current, picked]) };
      }),
      ...chosenShards.map((value, index) => ({ field: `shard${index}`, label: `${["공격", "유연", "방어"][index]} 파편`, pool: shardOptions[index], value, apply: (picked) => setShards((current) => { const next = [...current]; next[index] = picked; return next; }) })),
      { field: "lane", label: "추천 라인", pool: Object.keys(laneNames), value: chosenLane, apply: (picked) => setLane(picked) },
    ];
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function rollRunes() {
    setPhase("runes");
    setPath("");
    setSecondary("");
    setKeystone("");
    setPrimaryRunes([]);
    setSecondaryRunes([]);
    setShards(["", "", ""]);
    setLane("");
    const steps = makeRuneSteps();

    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index];
      setCurrentRoll({ field: step.field, label: step.label, value: step.pool[0], progress: `${index + 1}/${steps.length}` });
      if (!skipRequested.current) {
        for (let frame = 0; frame < 5; frame += 1) {
          if (skipRequested.current) break;
          setCurrentRoll({ field: step.field, label: step.label, value: step.pool[frame % step.pool.length], progress: `${index + 1}/${steps.length}` });
          await wait(85);
        }
      }
      step.apply(step.value);
      setCurrentRoll({ field: step.field, label: step.label, value: step.value, progress: `${index + 1}/${steps.length}`, settled: true });
      if (skipRequested.current) {
        for (const remaining of steps.slice(index + 1)) remaining.apply(remaining.value);
        break;
      }
      await wait(100);
    }

    setCurrentRoll(null);
    setPhase("complete");
    skipRequested.current = false;
    setSpinning(false);
  }

  async function spinChampion() {
    if (spinning) return;
    setSpinning(true);
    setPhase("champion");
    setCurrentRoll(null);
    setChampion(null);
    setPath("");
    setSecondary("");
    setKeystone("");
    setPrimaryRunes([]);
    setSecondaryRunes([]);
    setShards(["", "", ""]);
    setLane("");
    skipRequested.current = false;
    const target = Math.floor(Math.random() * champions.length);
    for (let turn = 0; turn < 18; turn += 1) {
      if (skipRequested.current) break;
      setSpinIndex((index) => (index + 1) % champions.length);
      await wait(75 + turn * 6);
    }
    const selected = champions[target];
    setSpinIndex(target);
    setChampion(selected.id);
    await rollRunes();
  }

  async function rerollRunes() {
    if (!champion || spinning) return;
    skipRequested.current = false;
    setSpinning(true);
    await rollRunes();
  }

  function skipRoll() {
    skipRequested.current = true;
  }

  function save() {
    if (!complete || saving) return;
    setSaving(true);
    try {
      onSave({
        id: `build-${Date.now()}`,
        champion,
        path,
        secondary,
        keystone,
        primaryRunes,
        secondaryRunes,
        shards,
        skillOrder: [],
        items: [],
        lane,
        date: "방금 전",
      });
    } catch (error) {
      console.error("Could not save roulette build", error);
      onNotify("빌드 저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="roulette-page">
      <div className="roulette-main">
        <section className="spinner-panel">
          <div className="panel-title"><span><i className="step-number">01</i><span>CHAMPION ROULETTE</span></span><span className="panel-hint">{phase === "runes" && currentRoll ? `${currentRoll.label} 추첨 중 · ${currentRoll.progress}` : "챔피언을 먼저 뽑고 룬은 순서대로 자동 추첨해요"}</span></div>
          <div className={spinning ? "spinner-track spinning" : "spinner-track"}>
            <span className="spinner-pointer">▼</span>
            <div className="spinner-items">
              {Array.from({ length: 9 }, (_, index) => {
                const item = champions[(spinIndex + index + champions.length - 4) % champions.length];
                const center = index === 4;
                return <div className={center ? "spinner-champion center" : "spinner-champion"} key={`${item.id}-${index}`}><ChampionImage champion={item} /><span>{item.name}</span></div>;
              })}
            </div>
            <button className="button spin-button" onClick={spinChampion} disabled={spinning}>{spinning ? phase === "champion" ? "챔피언 추첨 중…" : "룬·라인 추첨 중…" : champion ? "다시 뽑기" : "START!"}<span>↗</span></button>
          </div>
        </section>
        <div className="rune-editor">
          <div className="picker-section keystone-panel">
            <div className="rune-result-heading"><span className="section-kicker">RUNE RESULT</span><strong>룬 결과</strong></div>
            <div className="rune-core-picker">
              <div className="picker-title"><span className="step-number">02</span><div><strong>핵심 룬</strong><small>KEYSTONE</small></div></div>
              <div className="option-grid keystone-grid">{primaryPath ? primaryPath.keystone.map((rune) => <OptionChip key={rune} label={rune} selected={rune === keystone} rolling={currentRoll?.field === "keystone" && currentRoll.value === rune && !currentRoll.settled} color={primaryPath.color} />) : <div className="picker-empty">챔피언 추첨 후 자동으로 선택됩니다</div>}</div>
            </div>
          </div>
          <div className="rune-editor-columns">
            <section className="picker-section primary-runes-panel">
              <RunePicker title="주 룬 경로" subtitle="PRIMARY PATH" paths={Object.keys(runes)} selected={path} currentRoll={currentRoll} rollField="path" />
              <div className="rune-list-section">
                <div className="picker-title"><span className="step-number">03</span><div><strong>주 룬 선택</strong><small>PRIMARY RUNES <em>{primaryRunes.length}/3</em></small></div></div>
                <RuneOptions rows={primaryPath?.primaryRows} selections={primaryRunes} currentRoll={currentRoll} fieldPrefix="primaryRune" color={primaryPath?.color} />
              </div>
            </section>
            <section className="picker-section secondary-runes-panel">
              <RunePicker title="보조 룬 경로" subtitle="SECONDARY PATH" paths={Object.keys(runes)} selected={secondary} currentRoll={currentRoll} rollField="secondaryPath" excluded={path} />
              <div className="rune-list-section">
                <div className="picker-title"><span className="step-number">04</span><div><strong>보조 룬 선택</strong><small>SECONDARY RUNES <em>{secondaryRunes.length}/2</em></small></div></div>
                <RuneOptions rows={secondaryPath?.primaryRows} selections={secondaryRunes} currentRoll={currentRoll} fieldPrefix="secondaryRune" color={secondaryPath?.color} />
              </div>
              <div className="shards-section">
                <div className="picker-title"><span className="step-number">05</span><div><strong>룬 파편</strong><small>SHARDS <em>{shards.filter(Boolean).length}/3</em></small></div></div>
                <div className="shard-slots">{["공격", "유연", "방어"].map((slot, index) => <div className="shard-slot" key={slot}><span>{slot}</span><div>{shardOptions[index].map((shard) => <span key={shard} className={`shard-option ${shards[index] === shard ? "chosen" : ""} ${currentRoll?.field === `shard${index}` && currentRoll.value === shard && !currentRoll.settled ? "rolling" : ""}`} title={shard}>{shard.slice(0, 1)}</span>)}</div>{shards[index] && <small>{shards[index]}</small>}</div>)}</div>
              </div>
            </section>
          </div>
        </div>
        <FinalBuild champion={champion} previewChamp={previewChamp} path={path} secondary={secondary} keystone={keystone} primaryRunes={primaryRunes} secondaryRunes={secondaryRunes} shards={shards} lane={lane} currentRoll={currentRoll} onLaneChange={setLane} />
      </div>
      <div className="roulette-footer">
        {(spinning || champion) && <button className={`button quiet-button ${spinning ? "skip-button" : ""}`} onClick={spinning ? skipRoll : rerollRunes} disabled={!spinning && !champion}>{spinning ? "Ⅱ" : "✦"} <span>{spinning ? "스킵" : "룬·라인 다시 돌리기"}</span></button>}
        <div className="footer-actions"><button className="button text-button" onClick={onCancel}>취소</button><button className="button primary complete-button" disabled={!complete || saving} onClick={save}>{saving ? "저장 중…" : "완성!"}<span>↗</span></button></div>
      </div>
    </section>
  );
}

function RunePicker({ title, subtitle, paths, selected, currentRoll, rollField, excluded }) {
  return (
    <div className="path-picker">
      <div className="picker-title"><span className="step-number">✦</span><div><strong>{title}</strong><small>{subtitle}</small></div></div>
      <div className="path-options">{paths.map((path) => {
        const info = runes[path];
        const disabled = path === excluded;
        const isSelected = selected === path;
        const rolling = currentRoll?.field === rollField && currentRoll.value === info.name && !currentRoll.settled;
        return <span key={path} className={`path-option ${isSelected ? "chosen" : ""} ${disabled || (selected && !isSelected) ? "dimmed" : ""} ${rolling ? "rolling" : ""}`} style={{ "--rune-color": info.color }}><span>{info.mark}</span><small>{info.name}</small></span>;
      })}</div>
    </div>
  );
}

function OptionChip({ label, selected, rolling = false, color, dimmed = false }) {
  return <span className={`option-chip ${selected ? "chosen" : ""} ${rolling ? "rolling" : ""} ${dimmed ? "dimmed" : ""}`} style={{ "--rune-color": color }}><i>{selected ? "✓" : "✦"}</i>{label}</span>;
}

function RuneOptions({ rows, selections, currentRoll, fieldPrefix, color }) {
  if (!rows) return <div className="picker-empty">챔피언 추첨 후 자동으로 선택됩니다</div>;
  return (
    <div className="rune-option-rows">
      {rows.map((row, rowIndex) => {
        const selectedRow = row.some((rune) => selections.includes(rune));
        return (
          <div className="rune-option-row" key={`${fieldPrefix}-${rowIndex}`}>
            <span className="rune-row-number">{rowIndex + 1}</span>
            <div className="option-grid">
              {row.map((rune) => (
                <OptionChip
                  key={rune}
                  label={rune}
                  selected={selections.includes(rune)}
                  rolling={currentRoll?.field === `${fieldPrefix}${rowIndex}` && currentRoll.value === rune && !currentRoll.settled}
                  color={color}
                  dimmed={selectedRow && !selections.includes(rune)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FinalBuild({ champion, previewChamp, path, secondary, keystone, primaryRunes, secondaryRunes, shards, lane, currentRoll, onLaneChange }) {
  const selections = useMemo(() => [
    { title: "주 룬", path, values: [keystone, ...primaryRunes] },
    { title: "보조 룬", path: secondary, values: secondaryRunes },
    { title: "룬 파편", values: shards },
  ], [path, secondary, keystone, primaryRunes, secondaryRunes, shards]);
  return (
    <aside className="final-panel">
      <div className="final-heading"><div><span className="section-kicker">YOUR BUILD</span><h2>최종 빌드</h2></div><span className="final-status"><i /> 미리보기</span></div>
      <div className={champion ? "final-champion chosen" : "final-champion"}>
        <ChampionImage champion={previewChamp} />
        <div><small>CHAMPION</small><strong>{champion ? previewChamp.name : "챔피언 대기 중"}</strong></div>
        <span>{champion ? "✓" : "·"}</span>
      </div>
      {selections.map((section) => (
        <div className="final-rune-section" key={section.title}>
          <div className="final-rune-heading"><span>{section.title}</span>{section.path && <b style={{ "--rune-color": runes[section.path].color }}>{runes[section.path].mark} {runes[section.path].name}</b>}</div>
          <div className={`final-rune-slots ${section.title === "주 룬" ? "primary-slots" : ""}`}>{section.values.map((value, index) => <div className={value ? "final-rune-slot filled" : "final-rune-slot"} key={`${section.title}-${index}`}>{value ? <><i style={{ "--rune-color": section.path ? runes[section.path].color : "#9ba6b7" }}>{index === 0 && section.title === "주 룬" ? "✦" : "·"}</i><span>{value}</span></> : <span className="slot-empty" />}</div>)}
            {section.title === "주 룬" && Array.from({ length: Math.max(0, 4 - section.values.length) }, (_, index) => <div className="final-rune-slot" key={`empty-${index}`}><span className="slot-empty" /></div>)}
          </div>
        </div>
      ))}
      <div className="final-lane-section"><div className="final-rune-heading"><span>추천 라인</span><b>랜덤 추첨</b></div><div className="lane-selectors">{Object.keys(laneNames).map((role) => {
        const selected = lane === role;
        const rolling = currentRoll?.field === "lane" && currentRoll.value === role && !currentRoll.settled;
        return <button className={`lane-pill ${selected ? "chosen" : ""} ${rolling ? "rolling" : ""}`} key={role} title={laneNames[role]} aria-label={`${laneNames[role]} 라인 선택`} aria-pressed={selected} onClick={() => onLaneChange(role)}><LaneMap lane={role} small /></button>;
      })}</div></div>
      <p className="final-note">추첨된 룬과 라인은 오른쪽에 바로 반영됩니다.</p>
    </aside>
  );
}

export default App;
