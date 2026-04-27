# Habit Flow

Habit Flow는 습관, 일정, 할 일을 한 곳에서 관리할 수 있는 React 기반 생산성 웹앱입니다.  
사용자는 반복 습관을 추적하고, 날짜별 일정을 등록하며, 마감일 기반 할 일을 관리할 수 있습니다. 또한 슬라임 성장 요소를 넣어 꾸준한 사용을 유도하는 간단한 게임화 구조를 포함했습니다.

## 개발 목적

이 프로젝트는 단순한 Habit Tracker에서 출발해 일정 관리와 Todo 관리까지 확장 가능한 생산성 앱을 만드는 것을 목표로 했습니다.

개발 과정에서는 다음에 중점을 두었습니다.

- 모바일에서도 사용할 수 있는 반응형 UI
- 습관, 일정, 할 일을 분리한 데이터 구조
- localStorage 기반의 클라이언트 저장
- 추후 백엔드, 로그인, DB 연동이 가능한 구조
- 사용자의 꾸준한 기록을 유도하는 슬라임 성장 시스템

## 주요 기능

### 습관 관리

- 습관 추가 및 삭제
- 반복 요일 설정
- 기상, 운동, 공부, 일반 습관 유형 지원
- 유형별 기록 방식 제공
  - 기상: 목표 시간과 실제 기상 시간
  - 운동: 부위, 무게, 횟수, 세트 기반 볼륨
  - 공부: 공부 시간
  - 일반: 진행률 퍼센트

### 일정 관리

- 월간 캘린더 제공
- 날짜별 일정 추가 및 삭제
- 하루 종일 일정 지원
- 시작 시간, 종료 시간, 장소, 카테고리, 메모 입력
- 일정이 있는 날짜를 캘린더에 표시

### 할 일 관리

- 마감일 기반 Todo 추가 및 삭제
- 완료 체크
- 오늘 할 일, 이번 주 할 일, 완료된 할 일 필터
- High / Medium / Low 우선순위 표시
- 완료된 항목 취소선 처리

### 완료율 통계

- 오늘 습관 완료율
- 주간 완료율
- 월간 진행률
- 최근 기록 히스토리
- 캘린더 날짜별 습관 완료율 표시

### 슬라임 성장 시스템

- 습관 기록에 따라 경험치, 골드, 에너지 등 성장 요소 반영
- 슬라임 레벨과 성장 단계 표시
- 기상, 운동, 공부 기록에 따라 보상 계산
- 사용자의 꾸준한 자기관리를 게임처럼 느끼게 하는 동기부여 요소

### localStorage 저장

- 브라우저 localStorage에 데이터 저장
- 새로고침 후에도 데이터 유지
- version 기반 저장 구조 사용
- 기존 데이터 마이그레이션 처리

## 기술 스택

- React
- Vite
- JavaScript
- CSS
- lucide-react
- localStorage

## 실행 방법

의존성 설치:

```bash
npm install
```

개발 서버 실행:

```bash
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

Vite 기본 개발 서버는 보통 아래 주소에서 실행됩니다.

```text
http://localhost:5173
```

환경에 따라 다른 포트가 열릴 수 있으므로 터미널 출력의 주소를 확인하면 됩니다.

## 폴더 구조

```text
src/
  assets/
  components/
    CalendarGrid.jsx
    EventForm.jsx
    HabitCard.jsx
    HabitForm.jsx
    SlimeCompanion.jsx
    StatCard.jsx
    TodoForm.jsx
    TodoItem.jsx
  constants/
    habitConstants.js
  hooks/
    useLocalStorage.js
  pages/
    CalendarPage.jsx
    CompanionPage.jsx
    HabitsPage.jsx
    HomePage.jsx
    RecordsPage.jsx
    TodosPage.jsx
  utils/
    dateUtils.js
    eventUtils.js
    habitUtils.js
    rpgUtils.js
    todoUtils.js
  App.jsx
  main.jsx
```

## 데이터 구조

현재 localStorage에는 `habit-flow-mvp` 키로 다음 구조가 저장됩니다.

```js
{
  version: 1,
  habits: [],
  completions: {},
  events: [],
  todos: [],
  settings: {
    theme: 'light',
    weekStartsOn: 'monday'
  }
}
```

### Habit

```js
{
  id,
  name,
  type,
  color,
  emoji,
  days,
  target,
  createdAt
}
```

### Event

```js
{
  id,
  title,
  date,
  startTime,
  endTime,
  location,
  category,
  memo,
  color,
  isAllDay,
  createdAt,
  updatedAt
}
```

### Todo

```js
{
  id,
  title,
  dueDate,
  priority,
  isCompleted,
  completedAt,
  category,
  memo,
  createdAt,
  updatedAt
}
```

## 화면 구성

- 홈: 오늘 날짜, 오늘의 일정, 오늘의 할 일, 오늘의 습관, 슬라임 상태 요약
- 캘린더: 월간 캘린더, 날짜별 일정/할 일/습관 완료율 확인
- 할 일: Todo 추가, 오늘/이번 주/완료/전체 필터
- 습관 관리: 습관 추가, 빠른 습관 추가, 등록된 습관 관리
- 기록: 날짜별 습관 기록, 최근 실행 히스토리
- 슬라임: 레벨, 경험치, 재화, 성장 상태 확인

## 현재 구현된 기능

- React + Vite 기반 SPA 구성
- 습관/일정/할 일 데이터 분리
- localStorage 저장 및 마이그레이션
- 월간 캘린더
- 날짜별 일정/할 일/습관 기록 표시
- 폼 검증 및 입력 오류 안내
- 슬라임 성장 시스템
- 모바일 우선 반응형 UI

## 향후 개발 계획

- 로그인 기능 추가
- 백엔드 API 연동
- Supabase 또는 다른 DB 연동
- 모바일 PWA 지원 강화
- 일정/할 일 알림 기능
- AI 기반 일정 추천
- AI 기반 습관 분석 및 보상 추천
- 사용자별 데이터 동기화

## 보안 고려사항

현재 프로젝트는 클라이언트 localStorage 기반으로 동작합니다. 따라서 다음 사항을 고려해야 합니다.

- `.env` 파일은 GitHub에 올리지 않도록 관리
- API 키, 비밀번호, 토큰 등 민감정보를 localStorage에 저장하지 않기
- 백엔드 도입 시 인증/인가 구조 설계
- 사용자별 데이터 접근 권한 검증
- 외부 API 연동 시 환경변수 사용

## AI 활용 개발 방식

이 프로젝트는 AI 도구를 활용해 기획, 구현, 리팩토링을 반복하며 개발했습니다.

- GPT를 활용해 기능 기획, 요구사항 정리, 리뷰 기준 작성
- Codex를 활용해 React 코드 구현, 컴포넌트 분리, localStorage 구조 개선, 빌드 검증 진행
- AI가 생성한 결과를 그대로 사용하기보다, 기능 단위로 검토하고 수정하며 프로젝트 구조를 개선

AI를 단순 코드 생성 도구로만 사용하지 않고, 요구사항을 정리하고 구현 우선순위를 잡는 협업 도구로 활용한 점이 이 프로젝트의 특징입니다.
