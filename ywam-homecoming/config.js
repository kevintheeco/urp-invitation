/*
 * 서강 예수전도단 홈커밍 설정
 * 이 파일만 고치면 초대장(index.html)과 응답 보기(responses.html)에 함께 반영됩니다.
 */
window.HOMECOMING = {
  // Google Apps Script 웹 앱 주소 (SETUP.md 2단계에서 복사한 주소를 붙여넣으세요)
  endpoint: 'https://script.google.com/macros/s/AKfycbzR3S_A-8Gnk9uisxCA7FajnEdVcALkoMGG_5ofGPXLRksSzKtXUbjr_Zfc6emaKy9u/exec',

  // endpoint가 비어 있거나 시트 전송이 실패하면 답장이 이 메일로 한 통씩 옵니다 (FormSubmit, 첫 답장 때 오는 확인 메일에서 한 번 활성화)
  email: 'soomin.kim@urpedu.com',

  date: '2026-11-14',
  start: '15:00',
  end: '20:00',

  place: '서강대학교',
  // 비워 두면 "세부 장소는 신청해 주신 분들께 따로 안내드려요"로 표시됩니다
  placeDetail: '',

  fee: 30000,
  // 회비 계좌 (예: '카카오뱅크 3333-00-0000000 홍길동'). 비워 두면 표시하지 않습니다
  account: '토스뱅크 1002-4681-7774 김지오',

  // 문의처 (예: '회장 홍길동 010-0000-0000'). 비워 두면 표시하지 않습니다
  contact: ''
};
