/**
 * 서강 예수전도단 홈커밍 · 답장 받는 구글 시트 스크립트
 *
 * 1) 응답을 모을 구글 시트를 하나 만들고 [확장 프로그램] → [Apps Script]를 엽니다.
 * 2) 이 파일 내용을 통째로 붙여넣고, 아래 ADMIN_KEY를 준비팀만 아는 비밀번호로 바꿉니다.
 * 3) [배포] → [새 배포] → 유형 "웹 앱", 실행 계정 "나", 액세스 권한 "모든 사용자"로 배포합니다.
 * 4) 나온 웹 앱 URL을 ywam-homecoming/config.js 의 endpoint 에 붙여넣습니다.
 * 자세한 설명은 SETUP.md 를 보세요.
 */

// 응답 보기 페이지(responses.html)에 들어갈 때 쓰는 비밀번호. 꼭 바꿔 주세요.
const ADMIN_KEY = 'change-me-123';

const SHEET_NAME = '응답';
const HEADERS = ['접수시각', '이름', '전화번호', '전공', '학번', '참석여부', '도착예정', '남긴 말', '수정시각'];
const STATUSES = ['참석 가능', '늦참', '고민해보겠음', '불가능'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return json_({ ok: true }); // 스팸 봇

    const name = clean_(d.name, 30);
    const phone = normalizePhone_(d.phone);
    const major = clean_(d.major, 40);
    const year = String(d.year || '').replace(/\D/g, '').slice(0, 2);
    const status = STATUSES.indexOf(d.status) >= 0 ? d.status : '';
    if (!name || !phone || !major || year.length !== 2 || !status) {
      return json_({ ok: false, error: 'invalid' });
    }
    const arrive = status === '늦참' ? clean_(d.arrive, 20) : '';
    const message = clean_(d.message, 500);
    const now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    const sh = sheet_();
    const last = sh.getLastRow();
    let row = -1;
    if (last > 1) {
      const phones = sh.getRange(2, 3, last - 1, 1).getValues();
      for (let i = phones.length - 1; i >= 0; i--) {
        if (normalizePhone_(phones[i][0]) === phone) { row = i + 2; break; }
      }
    }
    if (row > 0) {
      const created = sh.getRange(row, 1).getValue();
      sh.getRange(row, 1, 1, HEADERS.length).setValues([[created, name, phone, major, year, status, arrive, message, now]]);
      return json_({ ok: true, updated: true });
    }
    sh.appendRow([now, name, phone, major, year, status, arrive, message, '']);
    return json_({ ok: true, updated: false });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const key = e && e.parameter && e.parameter.key;
  if (!ADMIN_KEY || ADMIN_KEY === 'change-me-123' || key !== ADMIN_KEY) {
    return json_({ ok: false, error: 'unauthorized' });
  }
  const sh = sheet_();
  const last = sh.getLastRow();
  const rows = last > 1 ? sh.getRange(2, 1, last - 1, HEADERS.length).getDisplayValues() : [];
  return json_({
    ok: true,
    fetchedAt: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    rows: rows.map(function (r) {
      r = r.map(function (c) { return String(c).replace(/^'/, ''); });
      return { createdAt: r[0], name: r[1], phone: r[2], major: r[3], year: r[4], status: r[5], arrive: r[6], message: r[7], updatedAt: r[8] };
    })
  });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#f7eddc');
    sh.setFrozenRows(1);
    sh.getRange('A:I').setNumberFormat('@'); // 학번 05, 전화번호 010 앞자리 0이 사라지지 않게
    sh.setColumnWidth(8, 320);
  }
  return sh;
}

function normalizePhone_(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (!/^01[016789]\d{7,8}$/.test(d)) return '';
  return d.length === 10 ? d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6) : d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
}

function clean_(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  if (/^[=+]/.test(s)) s = "'" + s; // 시트 수식으로 실행되지 않게
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// 배포 전에 한 번 실행하면 '응답' 시트가 만들어지고 권한 승인을 받습니다.
function setup() {
  sheet_();
}
