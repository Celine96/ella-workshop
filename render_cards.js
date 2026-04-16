const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const OUTPUT_DIR = path.join(__dirname, 'output');
const IMAGES_DIR = path.join(__dirname, 'images');
const CSV_PATH = path.join(__dirname, '실거래가_단계적매칭_서울전체_완전판_오차10%.csv');

// CSV 파싱 (pandas 방식 참고 — 따옴표 내 콤마 처리)
function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  // 헤더도 동일한 파서로 처리
  const parseRow = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

// 거래금액 파싱 (만원 단위, 콤마 제거)
function parsePrice(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/,/g, ''), 10) || 0;
}

// 금액 포맷 (억 단위)
function formatPrice(manwon) {
  const eok = manwon / 10000;
  if (eok >= 1) {
    const remainder = manwon % 10000;
    if (remainder === 0) return `${Math.floor(eok)}억`;
    return `${Math.floor(eok)}억 ${remainder.toLocaleString()}만`;
  }
  return `${manwon.toLocaleString()}만`;
}

// 상세 주소
function fullAddress(row) {
  return row['도로명'] || row['지번'] || row['시군구'] || '';
}

// 건물 이미지 찾기 (images 폴더에서 주소명으로 매칭)
function findBuildingImage(row) {
  if (!fs.existsSync(IMAGES_DIR)) return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
  const files = fs.readdirSync(IMAGES_DIR);
  const address = row['도로명'] || row['지번'] || '';
  // 이미지 파일 중 주소 일부가 포함된 파일 찾기
  for (const file of files) {
    const name = path.parse(file).name;
    if (address.includes(name) || name.split(' ').every(part => address.includes(part))) {
      const imgPath = path.join(IMAGES_DIR, file);
      const ext = path.extname(file).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      const data = fs.readFileSync(imgPath);
      return `url(data:${mime};base64,${data.toString('base64')})`;
    }
  }
  return 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
}

// Jinja2 스타일 템플릿 렌더링
function renderTemplate(html, vars) {
  let result = html;
  // 단순 변수 치환
  for (const [key, val] of Object.entries(vars)) {
    if (typeof val === 'string') {
      result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), val);
    }
  }
  // data_rows 루프 처리
  const loopRegex = /\{%\s*for\s+row\s+in\s+data_rows\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/;
  const loopMatch = result.match(loopRegex);
  if (loopMatch && vars.data_rows) {
    const rowTemplate = loopMatch[1];
    const rendered = vars.data_rows.map(row => {
      return rowTemplate
        .replace(/\{\{\s*row\.label\s*\}\}/g, row.label)
        .replace(/\{\{\s*row\.value\s*\}\}/g, row.value);
    }).join('');
    result = result.replace(loopRegex, rendered);
  }
  // if 블록 처리
  result = result.replace(/\{%\s*if\s+(\w+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g, (match, varName, content) => {
    return vars[varName] ? content : '';
  });
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0]; // --prepare 또는 --now

  if (!mode || (mode !== '--prepare' && mode !== '--now')) {
    console.log('사용법:');
    console.log('  node render_cards.js --prepare   데이터 확인 (선별할 매물 확인)');
    console.log('  node render_cards.js --now        카드뉴스 생성');
    process.exit(0);
  }

  // CSV 읽기
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV 파일을 찾을 수 없습니다: ${CSV_PATH}`);
    process.exit(1);
  }
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(csvText);

  // 유형=일반 + 매칭성공 + 지번 마스킹(*) 없음 + 2026년 데이터만 필터
  const sorted = rows
    .map(r => ({ ...r, _price: parsePrice(r['거래금액(만원)']) }))
    .filter(r =>
      r._price > 0 &&
      r['유형'] === '일반' &&
      r['매칭단계'] !== '매칭실패' &&
      !String(r['지번'] || '').includes('*') &&
      String(r['계약년월'] || '').startsWith('2026')
    )
    .sort((a, b) => b._price - a._price);

  // 최고가 1건 + 최저가 1건 (1억 이상)
  const top1 = sorted.slice(0, 1);
  const aboveOneEok = sorted.filter(r => r._price >= 10000); // 1억 = 10000만원
  const bottom1 = aboveOneEok.slice(-1);
  const selected = [...top1, ...bottom1];

  console.log('선별된 2건:');
  selected.forEach((r, i) => {
    const label = i === 0 ? '최고가' : '최저가';
    console.log(`  ${label}: ${r['시군구']} - ${formatPrice(r._price)}`);
    console.log(`    지번: ${r['지번']}`);
    console.log(`    도로명: ${r['도로명']}`);
    console.log(`    용도: ${r['건축물주용도']} | 연면적: ${r['전용/연면적(㎡)']}㎡ | 대지면적: ${r['대지면적(㎡)']}㎡ | 건축년도: ${r['건축년도']}`);
  });

  // --prepare 모드: 데이터 확인만 하고 종료
  if (mode === '--prepare') {
    console.log('\n데이터 확인 완료. 카드뉴스를 생성하려면 아래 명령어를 실행하세요:');
    console.log('  node render_cards.js --now');
    return;
  }

  // --now 모드: 카드뉴스 생성
  // 출력 폴더 생성
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 템플릿 읽기
  const coverHtml = fs.readFileSync(path.join(TEMPLATE_DIR, 'card_cover.html'), 'utf-8');
  const dataHtml = fs.readFileSync(path.join(TEMPLATE_DIR, 'card_data.html'), 'utf-8');

  const totalSlides = 3; // 표지 1 + 데이터 2
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Playwright 브라우저 시작
  const browser = await chromium.launch();
  try {
  const context = await browser.newContext({ viewport: { width: 1080, height: 1080 } });

  // === 슬라이드 1: 표지 ===
  const coverVars = {
    brand_name: "ELLA'S 1DAY WORKSHOP",
    slide_number: '1',
    total_slides: String(totalSlides),
    category: "ELLA'S 1DAY WORKSHOP",
    title: '실거래가 카드뉴스',
    subtitle: '서울 전체 상업용 부동산 실거래 현황',
    date: dateStr,
    bg_image_css: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
  };
  const coverRendered = renderTemplate(coverHtml, coverVars);

  const coverPage = await context.newPage();
  await coverPage.setContent(coverRendered, { waitUntil: 'networkidle' });

  await coverPage.screenshot({ path: path.join(OUTPUT_DIR, 'slide_1_cover.png'), type: 'png' });
  await coverPage.close();
  console.log('\nslide_1_cover.png 생성 완료');

  // === 슬라이드 2~3: 데이터 (최고가, 최저가) ===
  // 슬라이드 파일명을 지번 주소에서 추출
  const slideLabels = selected.map(r => {
    const jibun = r['지번'] || 'unknown';
    // "서울특별시 구로구 구로동 791-58번지" → "구로동 791-58번지"
    const parts = jibun.split(' ');
    return parts.length >= 3 ? parts.slice(2).join(' ') : jibun;
  });
  for (let i = 0; i < selected.length; i++) {
    const r = selected[i];
    const slideNum = i + 2;
    const priceManwon = r._price;
    const label = slideLabels[i];

    // 건축년도 정수 변환
    const yearRaw = r['건축년도'];
    const yearStr = yearRaw ? `${Math.floor(parseFloat(yearRaw))}년` : '-';

    // 대지면적 처리 (빈값 체크)
    const landArea = r['대지면적(㎡)'] && r['대지면적(㎡)'].trim() ? `${r['대지면적(㎡)'].trim()}㎡` : '-';

    const dataRows = [
      { label: '지번', value: r['지번'] || '-' },
      { label: '용도', value: r['건축물주용도'] || '-' },
      { label: '연면적', value: r['전용/연면적(㎡)'] ? `${r['전용/연면적(㎡)']}㎡` : '-' },
      { label: '대지면적', value: landArea },
      { label: '건축년도', value: yearStr },
    ];

    // 건물 이미지 찾기 (도로명 주소로 매칭)
    const bgImage = findBuildingImage(r);

    const dataVars = {
      brand_name: "ELLA'S 1DAY WORKSHOP",
      slide_number: String(slideNum),
      total_slides: String(totalSlides),
      address: fullAddress(r),
      price_label: '매각완료',
      price_value: formatPrice(priceManwon),
      bg_image_css: bgImage,
      map_image_css: '',
      station: '',
      data_rows: dataRows,
    };

    const dataRendered = renderTemplate(dataHtml, dataVars);

    const dataPage = await context.newPage();
    await dataPage.setContent(dataRendered, { waitUntil: 'networkidle' });

    await dataPage.screenshot({ path: path.join(OUTPUT_DIR, `slide_${slideNum}_${label}.png`), type: 'png' });
    await dataPage.close();
    console.log(`slide_${slideNum}_${label}.png 생성 완료`);
  }

  console.log(`\n완료! ${OUTPUT_DIR} 폴더에 총 ${totalSlides}장의 PNG가 생성되었습니다.`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('오류가 발생했습니다:', err.message);
  process.exit(1);
});
