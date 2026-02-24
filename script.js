/* ════════════════════════════════════
   날짜 · 시간 · 날씨 위젯
════════════════════════════════════ */

/* ─── 날씨 코드 → 아이콘 / 설명 ─── */
const WEATHER_MAP = {
  0:  { icon: '☀️',  desc: '맑음' },
  1:  { icon: '🌤️', desc: '대체로 맑음' },
  2:  { icon: '⛅',  desc: '구름 조금' },
  3:  { icon: '☁️',  desc: '흐림' },
  45: { icon: '🌫️', desc: '안개' },
  48: { icon: '🌫️', desc: '안개' },
  51: { icon: '🌦️', desc: '이슬비' },
  53: { icon: '🌦️', desc: '이슬비' },
  55: { icon: '🌧️', desc: '강한 이슬비' },
  61: { icon: '🌧️', desc: '비' },
  63: { icon: '🌧️', desc: '비' },
  65: { icon: '🌧️', desc: '강한 비' },
  71: { icon: '❄️',  desc: '눈' },
  73: { icon: '❄️',  desc: '눈' },
  75: { icon: '❄️',  desc: '강한 눈' },
  80: { icon: '🌦️', desc: '소나기' },
  81: { icon: '🌧️', desc: '소나기' },
  82: { icon: '⛈️',  desc: '강한 소나기' },
  95: { icon: '⛈️',  desc: '천둥번개' },
  96: { icon: '⛈️',  desc: '천둥번개' },
  99: { icon: '⛈️',  desc: '천둥번개' },
};

/* ─── 날짜 · 시간 ─── */
const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

function updateClock() {
  const now = new Date();
  const y   = now.getFullYear();
  const mo  = now.getMonth() + 1;
  const d   = now.getDate();
  const day = DAY_KR[now.getDay()];
  const h   = String(now.getHours()).padStart(2, '0');
  const mi  = String(now.getMinutes()).padStart(2, '0');
  const s   = String(now.getSeconds()).padStart(2, '0');

  const dateEl = document.getElementById('wDate');
  const timeEl = document.getElementById('wTime');
  if (dateEl) dateEl.textContent = `${y}년 ${mo}월 ${d}일 (${day})`;
  if (timeEl) timeEl.textContent = `${h}:${mi}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ─── 날씨 ─── */
async function loadWeather() {
  const iconEl = document.getElementById('wWeatherIcon');
  const tempEl = document.getElementById('wTemp');
  const descEl = document.getElementById('wDesc');
  const cityEl = document.getElementById('wCity');

  if (!navigator.geolocation) {
    if (descEl) descEl.textContent = '위치 미지원';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      try {
        /* 날씨 */
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weather_code&timezone=auto`
        );
        const wData = await wRes.json();
        const temp  = Math.round(wData.current.temperature_2m);
        const code  = wData.current.weather_code;
        const info  = WEATHER_MAP[code] || { icon: '🌡️', desc: '날씨 정보' };

        if (iconEl) iconEl.textContent = info.icon;
        if (tempEl) tempEl.textContent = `${temp}°C`;
        if (descEl) descEl.textContent = info.desc;

        /* 도시명 (Nominatim 역지오코딩) */
        const gRes  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { headers: { 'Accept-Language': 'ko' } }
        );
        const gData = await gRes.json();
        const city  = gData.address?.city
                   || gData.address?.county
                   || gData.address?.state
                   || '';
        if (cityEl) cityEl.textContent = city;
      } catch {
        if (descEl) descEl.textContent = '날씨 오류';
      }
    },
    () => {
      if (descEl) descEl.textContent = '위치 권한 필요';
    },
    { timeout: 8000 }
  );
}
loadWeather();

/* ─── 상수 ─── */
const PW_KEY = 'hi1234';
const DB_KEY = 'hi_members_v1';
let pendingDelId = null;
let lastRecord   = null;

/* ─── 데이터 ─── */
const db = {
  load: () => JSON.parse(localStorage.getItem(DB_KEY) || '[]'),
  save: d  => localStorage.setItem(DB_KEY, JSON.stringify(d)),
};

/* ─── 통계 바 ─── */
function refreshStatsBar() {
  document.getElementById('statTotal').textContent = db.load().length;
}
refreshStatsBar();

/* ─── 라디오 하이라이트 ─── */
document.querySelectorAll('.r-option input[type="radio"]').forEach(r => {
  r.addEventListener('change', function () {
    document.querySelectorAll(`.r-option input[name="${this.name}"]`).forEach(x => {
      x.closest('.r-option').classList.remove('on');
    });
    this.closest('.r-option').classList.add('on');
  });
});

/* ─── 체크박스 하이라이트 ─── */
document.querySelectorAll('.c-option input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', function () {
    this.closest('.c-option').classList.toggle('on', this.checked);
  });
});

/* ─── 전화번호 자동 하이픈 ─── */
document.getElementById('f-phone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if      (v.length <= 3) this.value = v;
  else if (v.length <= 7) this.value = v.slice(0, 3) + '-' + v.slice(3);
  else                    this.value = v.slice(0, 3) + '-' + v.slice(3, 7) + '-' + v.slice(7);
});

/* ─── 폼 제출 ─── */
document.getElementById('memberForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name  = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const cVal  = document.getElementById('f-consent');
  const date  = document.getElementById('f-date').value;
  const med   = document.querySelector('input[name="medical"]:checked');

  setErr('g-name',    'e-name',    !name);
  setErr('g-phone',   'e-phone',   phone.replace(/\D/g, '').length < 9);
  setErr('g-consent', 'e-consent', !cVal.checked);
  setErr('g-date',    'e-date',    !date);
  setErr('g-medical', 'e-medical', !med);

  if (!name || phone.replace(/\D/g, '').length < 9 || !cVal.checked || !date || !med) return;

  const record = {
    id:        Date.now(),
    name,
    phone,
    consent:   cVal.checked ? '네, 동의합니다' : '',
    gradDate:  date,
    benefit1:  document.getElementById('f-benefit1').checked ? '확인했습니다' : '-',
    benefit2:  document.getElementById('f-benefit2').checked ? '확인했습니다' : '-',
    benefit3:  document.getElementById('f-benefit3').checked ? '확인했습니다' : '-',
    news:      document.getElementById('f-news').checked     ? '확인했습니다' : '-',
    inquiry:   document.getElementById('f-inquiry').value.trim() || '-',
    medical:   med.value,
    createdAt: new Date().toLocaleString('ko-KR'),
  };

  lastRecord = record;

  const data = db.load();
  data.push(record);
  db.save(data);
  refreshStatsBar();

  const summaryEl = document.getElementById('successSummary');
  if (summaryEl) {
    const rows = [
      { label: '이름',                    value: record.name },
      { label: '전화번호',                 value: record.phone },
      { label: '멤버스 가입 동의',          value: record.consent },
      { label: '에이치아이 졸업 날짜',      value: record.gradDate },
      ...(record.benefit1 !== '-' ? [{ label: '[혜택 1] 이벤트 선물 안내 확인', value: record.benefit1 }] : []),
      ...(record.benefit2 !== '-' ? [{ label: '[혜택 2] 추천 선물 안내 확인',   value: record.benefit2 }] : []),
      ...(record.benefit3 !== '-' ? [{ label: '[혜택 3] 가족 사진 안내 확인',   value: record.benefit3 }] : []),
      ...(record.news    !== '-' ? [{ label: '임신·출산 소식 안내 확인',         value: record.news    }] : []),
      ...(record.inquiry !== '-' ? [{ label: '추가 문의사항',                   value: record.inquiry }] : []),
      { label: '비식별 의료정보 활용 동의', value: record.medical },
    ];
    summaryEl.innerHTML = rows.map(r => `
      <div class="sum-row">
        <div class="sum-label">${esc(r.label)}</div>
        <div class="sum-value">${esc(r.value)}</div>
      </div>
    `).join('');
  }

  document.getElementById('memberForm').style.display = 'none';
  document.getElementById('successBox').classList.add('show');
  document.getElementById('successBox').scrollIntoView({ behavior: 'smooth' });
});

function setErr(gId, eId, hasErr) {
  document.getElementById(gId).classList.toggle('has-error', hasErr);
  document.getElementById(eId).classList.toggle('show', hasErr);
}

/* ─── 관리자 로그인 ─── */
function openLogin() {
  document.getElementById('adminPw').value = '';
  document.getElementById('loginErr').classList.remove('show');
  document.getElementById('loginOverlay').classList.add('show');
  setTimeout(() => document.getElementById('adminPw').focus(), 120);
}

function doLogin() {
  if (document.getElementById('adminPw').value === PW_KEY) {
    closeOverlay('loginOverlay');
    openAdmin();
  } else {
    document.getElementById('loginErr').classList.add('show');
  }
}

function openAdmin() {
  document.getElementById('adminPanel').classList.add('show');
  renderAdmin();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('show');
}

/* ─── 관리자 렌더 ─── */
function renderAdmin() {
  const data  = db.load();
  const today = new Date().toLocaleDateString('ko-KR');

  document.getElementById('aTotal').textContent  = data.length;
  document.getElementById('aToday').textContent  = data.filter(d => d.createdAt.startsWith(today)).length;
  document.getElementById('aMedYes').textContent = data.filter(d => d.medical === '네, 동의합니다').length;
  document.getElementById('aMedNo').textContent  = data.filter(d => d.medical !== '네, 동의합니다').length;

  renderTable();
}

function renderTable() {
  const data  = db.load();
  const q     = (document.getElementById('searchBox')?.value || '').toLowerCase();
  const rows  = data.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.phone.toLowerCase().includes(q)
  );

  const tbody = document.getElementById('tblBody');
  const empty = document.getElementById('emptyTbl');

  if (rows.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = rows.map((d, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${esc(d.name)}</strong></td>
      <td>${esc(d.phone)}</td>
      <td><span class="badge b-yes">동의</span></td>
      <td>${esc(d.gradDate)}</td>
      <td>${chk(d.benefit1)}</td>
      <td>${chk(d.benefit2)}</td>
      <td>${chk(d.benefit3)}</td>
      <td>${chk(d.news)}</td>
      <td>${d.medical === '네, 동의합니다'
        ? '<span class="badge b-yes">동의</span>'
        : '<span class="badge b-no">비동의</span>'}</td>
      <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;"
          title="${esc(d.inquiry)}">${esc(d.inquiry)}</td>
      <td>${esc(d.createdAt)}</td>
      <td><button class="btn-row-del" onclick="openDel(${d.id})">삭제</button></td>
    </tr>
  `).join('');
}

function chk(v) {
  return v === '확인했습니다'
    ? '<span class="badge b-yes">확인</span>'
    : '<span class="badge b-na">-</span>';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ─── 단건 삭제 ─── */
function openDel(id) {
  pendingDelId = id;
  document.getElementById('delOverlay').classList.add('show');
}

function confirmDel() {
  db.save(db.load().filter(d => d.id !== pendingDelId));
  closeOverlay('delOverlay');
  renderAdmin();
  refreshStatsBar();
}

/* ─── 전체 삭제 ─── */
function openClearAll() {
  document.getElementById('clearOverlay').classList.add('show');
}

function confirmClearAll() {
  db.save([]);
  closeOverlay('clearOverlay');
  renderAdmin();
  refreshStatsBar();
}

/* ─── CSV 내보내기 ─── */
function exportCSV() {
  const data = db.load();
  if (!data.length) { alert('내보낼 데이터가 없습니다.'); return; }

  const cols = ['번호', '이름', '전화번호', '가입동의', '졸업날짜',
                '혜택1확인', '혜택2확인', '혜택3확인', '소식안내확인',
                '의료정보동의', '문의사항', '가입일시'];
  const rows = data.map((d, i) => [
    i + 1, d.name, d.phone, d.consent, d.gradDate,
    d.benefit1, d.benefit2, d.benefit3, d.news,
    d.medical, d.inquiry, d.createdAt,
  ]);

  const csv = [cols, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `HI멤버스_${new Date().toLocaleDateString('ko-KR').replace(/\.\s*/g, '-').replace(/-$/, '')}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── 오버레이 닫기 ─── */
function closeOverlay(id) {
  document.getElementById(id).classList.remove('show');
}

document.querySelectorAll('.overlay').forEach(ov => {
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); });
});

/* ─── 가입증 다운로드 ─── */
async function downloadCertificate() {
  if (!lastRecord) return;
  const r = lastRecord;

  await document.fonts.ready;

  const W = 900, H = 580, S = 2;
  const canvas = document.createElement('canvas');
  canvas.width  = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext('2d');
  ctx.scale(S, S);

  const C = {
    primary:      '#D4637A',
    primaryDark:  '#A84960',
    primaryLight: '#F2AFBA',
    secondary:    '#FDE8EC',
    text:         '#2C2424',
    muted:        '#7A6B6E',
  };

  /* BG */
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0,   '#fff0f3');
  bgGrad.addColorStop(0.5, '#fde8ec');
  bgGrad.addColorStop(1,   '#fff5f7');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  /* Outer border */
  ctx.strokeStyle = C.primary; ctx.lineWidth = 3;
  rrPath(ctx, 22, 22, W - 44, H - 44, 18); ctx.stroke();

  /* Inner border */
  ctx.strokeStyle = C.primaryLight; ctx.lineWidth = 1;
  rrPath(ctx, 34, 34, W - 68, H - 68, 12); ctx.stroke();

  /* Header band */
  const hGrad = ctx.createLinearGradient(22, 22, W - 22, 130);
  hGrad.addColorStop(0, C.primary); hGrad.addColorStop(1, C.primaryDark);
  ctx.save();
  rrPath(ctx, 22, 22, W - 44, 108, 18); ctx.clip();
  ctx.fillStyle = hGrad; ctx.fillRect(22, 22, W - 44, 108);
  ctx.restore();

  /* HI circle */
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.arc(92, 76, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('HI', 92, 76);

  /* Hospital name */
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px "Noto Sans KR", sans-serif';
  ctx.fillText('에이치아이여성의원', 138, 65);
  ctx.font = '12px "Noto Sans KR", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText('HI MEMBERS · 임신 성공 가족을 위한 특별한 멤버십', 138, 89);

  /* Chip: 가입확인서 */
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  rrPath(ctx, W - 196, 42, 162, 48, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
  rrPath(ctx, W - 196, 42, 162, 48, 10); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('회원 가입 확인서', W - 115, 66);

  /* Title */
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.primary;
  ctx.font = '13px "Noto Sans KR", sans-serif';
  ctx.fillText('✦  H I   M E M B E R S  ✦', W / 2, 173);
  ctx.fillStyle = C.text;
  ctx.font = 'bold 38px "Noto Sans KR", sans-serif';
  ctx.fillText('가  입  증', W / 2, 222);

  /* Divider */
  ctx.strokeStyle = C.primaryLight; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(200, 240); ctx.lineTo(W - 200, 240); ctx.stroke();

  /* Fields */
  const fields = [
    ['성    명', r.name],
    ['연  락  처', r.phone],
    ['졸업 날짜', r.gradDate],
    ['가입 일시', r.createdAt],
  ];
  let fy = 290;
  fields.forEach(([label, val]) => {
    ctx.fillStyle = C.secondary;
    rrPath(ctx, 170, fy - 17, 168, 30, 8); ctx.fill();
    ctx.strokeStyle = C.primaryLight; ctx.lineWidth = 1;
    rrPath(ctx, 170, fy - 17, 168, 30, 8); ctx.stroke();

    ctx.fillStyle = C.primaryDark;
    ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 254, fy - 1);

    ctx.fillStyle = C.text;
    ctx.font = '15px "Noto Sans KR", sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(val, 362, fy + 5);

    ctx.strokeStyle = '#F0D8DC'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(362, fy + 13); ctx.lineTo(W - 170, fy + 13); ctx.stroke();

    fy += 56;
  });

  /* Bottom */
  ctx.fillStyle = C.muted;
  ctx.font = '13px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('위 분은 에이치아이여성의원 HI MEMBERS 회원으로 가입하셨음을 확인합니다.', W / 2, H - 56);
  ctx.fillStyle = C.primary;
  ctx.font = 'bold 12px "Noto Sans KR", sans-serif';
  ctx.fillText(`발급일 ${new Date().toLocaleDateString('ko-KR')}  ·  에이치아이여성의원`, W / 2, H - 32);

  /* Download */
  const a = document.createElement('a');
  a.download = `HI멤버스_가입증_${r.name}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}
