# Habit Flow

Habit Flow는 네온 다크 테마의 월간 습관/할일 대시보드형 Habit Tracker입니다.  
사용자는 습관을 추가하고 날짜별 완료 여부를 체크하며, 월간/주간/일별 완료율과 습관별 진행률을 한 화면에서 확인할 수 있습니다.

## 1. 프로젝트 소개

Habit Flow는 반복 습관을 단순한 체크리스트로만 관리하는 것이 아니라, 월간 대시보드 형태로 시각화하는 생산성 웹앱입니다.

레퍼런스 이미지처럼 검정 배경, 네온 그린 포인트, 고밀도 그리드 UI를 사용해 다음 정보를 한 화면에서 확인할 수 있도록 구성했습니다.

- 오늘과 이번 달의 습관 진행 상황
- 날짜별 완료율 변화
- 주차별 완료율
- 습관별 월간 달성률
- 가장 많이 완료한 습관 순위

현재는 프론트엔드 중심의 MVP이며, 데이터는 브라우저 `localStorage`에 저장됩니다.

## 2. 개발 목적

이 프로젝트의 목적은 React 기반으로 실제 사용할 수 있는 습관 추적 대시보드를 구현하는 것입니다.

개발 과정에서 중점적으로 다룬 부분은 다음과 같습니다.

- React 컴포넌트 기반 UI 설계
- 습관 완료 데이터의 월간/주간/일간 통계 계산
- 대시보드형 고밀도 UI 구성
- `localStorage` 기반 데이터 저장 및 유지
- 추후 Todo/Event/DB/AI 기능으로 확장 가능한 구조 설계

## 3. 주요 기능

### 월간 습관 체크 그리드

- 선택된 월의 모든 날짜를 가로 그리드로 표시
- 습관별 날짜 셀을 클릭해 완료 여부 체크
- 완료 셀은 네온 그린으로 표시
- 오늘 날짜와 선택 날짜 강조
- 습관 이름/목표 열은 sticky 형태로 고정

### 일별 완료율 라인 차트

- 월간 날짜별 완료율을 SVG 라인 차트로 표시
- 0~100% 기준의 흐린 grid line 제공
- 네온 그린 곡선과 포인트 표시
- 우측 상단에 평균/최근 완료율 표시

### 월간 진행률 도넛 차트

- 월 전체 기준 완료 수, 남은 수, 완료율 표시
- 중앙에 퍼센트 표시
- 완료율이 높을수록 네온 그린 원형 progress가 채워짐

### Week Overview

- 월을 Week 1~Week 5/6 단위로 분리
- 각 주차의 날짜별 완료율과 완료 개수 표시
- 주차별 평균 완료율 표시

### Week Detail Modal

- Week Overview에서 특정 주차 클릭 시 상세 모달 표시
- 요일별 카드로 습관 완료 현황 확인
- 각 날짜별 원형 완료율, 완료/미완료 습관 목록 표시
- 모달 안에서도 습관 체크 토글 가능

### Top Habits

- 월간 완료 수 기준 상위 습관 표시
- emoji, 습관 이름, 완료 수 표시
- 가장 많이 완료한 습관을 강조

### Overall Progress

- 모든 습관의 진행률 표 제공
- 컬럼: `DONE`, `LEFT`, `%`, `BAR`
- 완료 수는 초록색, 남은 수는 빨간색으로 구분
- 100% 달성 항목은 더 밝게 강조

### Add/Edit Habit Modal

- 대시보드에서 습관 추가 가능
- 기존 습관 이름 클릭 시 수정 모달 표시
- 입력 항목:
  - Habit Name
  - Emoji
  - Monthly Goal
  - Color
  - Category
  - Active 여부
- `ESC`, overlay 클릭, X 버튼으로 닫기 가능

### Todo/Event 확장 구조

현재 Habit 중심 대시보드가 메인 화면이지만, 프로젝트 내부에는 Todo/Event 기능을 확장할 수 있는 구조가 포함되어 있습니다.

- `events` 배열 기반 일정 데이터 구조
- `todos` 배열 기반 할 일 데이터 구조
- Calendar, Todos 페이지 컴포넌트 유지

### localStorage 저장

- 브라우저 `localStorage`에 데이터 저장
- 새로고침 후에도 습관/완료 기록 유지
- version 기반 저장 구조 사용

## 4. 기술 스택

- React
- Vite
- JavaScript
- CSS
- localStorage
- lucide-react

차트는 `recharts` 없이 SVG/CSS로 직접 구현했습니다.

## 5. 실행 방법

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

Vite 개발 서버는 일반적으로 아래 주소에서 실행됩니다.

```text
http://localhost:5173
```

환경에 따라 다른 포트가 열릴 수 있으므로 터미널에 출력되는 주소를 확인하면 됩니다.

## 6. 폴더 구조

```text
src/
  assets/
  components/
    dashboard/
      DashboardShell.jsx
      DailyCompletionChart.jsx
      DailyHabitsGrid.jsx
      LeftControlPanel.jsx
      MonthlyOverviewGrid.jsx
      MonthlyProgressDonut.jsx
      OverallProgressPanel.jsx
      RightStatsPanel.jsx
      TopHabitsPanel.jsx
    modals/
      HabitModal.jsx
      WeekDetailModal.jsx
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
    dashboardStats.js
    dateUtils.js
    eventUtils.js
    habitUtils.js
    rpgUtils.js
    todoUtils.js
  App.jsx
  main.jsx
  styles.css
```

## 7. 데이터 구조

현재 데이터는 `localStorage`의 `habit-flow-mvp` key에 저장됩니다.

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
  id: string,
  name: string,
  type: 'custom' | 'wake' | 'workout' | 'study',
  color: string,
  emoji: string,
  days: number[],
  monthlyGoal: number,
  active: boolean,
  target: object,
  createdAt: string,
  updatedAt: string
}
```

### Completions

```js
{
  'YYYY-MM-DD': {
    [habitId]: {
      progressPercent: number
    }
  }
}
```

습관 유형에 따라 기상 시간, 운동 볼륨, 공부 시간 등 추가 기록이 포함될 수 있습니다.

### Event

```js
{
  id: string,
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  location: string,
  category: string,
  memo: string,
  color: string,
  isAllDay: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Todo

```js
{
  id: string,
  title: string,
  dueDate: string,
  priority: 'high' | 'medium' | 'low',
  isCompleted: boolean,
  completedAt: string | null,
  category: string,
  memo: string,
  createdAt: string,
  updatedAt: string
}
```

## 8. 화면 구성

### Home Dashboard

메인 화면은 월간 습관 대시보드입니다.

- 왼쪽: 월/오늘 요약, Add Habit 버튼
- 중앙 상단: Daily Completion Rate 라인 차트
- 중앙: Monthly Overview
- 중앙 하단: Daily Habits Grid
- 오른쪽: Monthly Progress, Top Habits, Overall Progress

### Calendar

날짜별 일정, 할 일, 습관 기록을 확인하기 위한 캘린더 페이지입니다.

### Todos

마감일 기반 할 일을 추가하고 완료 여부를 관리하는 페이지입니다.

### Habits

기존 습관 추가/관리 기능을 유지하는 페이지입니다.

### Records

습관 실행 기록을 확인하고 날짜별 기록을 수정할 수 있는 페이지입니다.

### Companion

습관 달성에 따른 슬라임 성장/보상 요소를 확인하는 페이지입니다.

## 9. AI 활용 개발 방식

이 프로젝트는 AI 도구를 활용해 기획, 구현, 리뷰를 반복하며 개발했습니다.

- GPT
  - 기능 요구사항 정리
  - 화면 구성 기획
  - 개발 방향 검토
  - README 및 포트폴리오 문서 구성

- Codex
  - React 컴포넌트 구현
  - 대시보드 구조 분리
  - localStorage 저장 구조 정리
  - 월간 통계 유틸 작성
  - CSS 반응형 및 네온 다크 UI 개선
  - 빌드 검증

AI가 생성한 결과를 그대로 사용하는 방식이 아니라, 요구사항을 단계별로 나누고 구현 결과를 확인하면서 수정하는 방식으로 진행했습니다.

## 10. 향후 개선 계획

- 로그인 기능
- 백엔드 API 연동
- DB 연동
- 습관/할 일 알림
- CSV/JSON export
- AI 루틴 추천
- AI 기반 습관 분석 및 피드백
- 모바일 PWA 개선
- 사용자별 데이터 동기화

## 11. 보안 고려사항

현재 프로젝트는 클라이언트 기반 MVP이므로 보안 측면에서 다음 사항을 고려해야 합니다.

- 민감정보를 `localStorage`에 저장하지 않기
- `.env` 파일을 GitHub에 업로드하지 않기
- API key, 토큰, 비밀번호 등은 클라이언트 코드에 포함하지 않기
- 로그인 기능 도입 시 인증/인가 구조 설계 필요
- DB 연동 시 사용자별 데이터 접근 권한 검증 필요

## 12. 현재 상태

현재 Habit Flow는 월간 습관 대시보드 중심의 프론트엔드 MVP입니다.  
습관 추가, 날짜별 체크, 월간/주간/일별 통계 확인, 모달 기반 상세 확인, localStorage 저장 기능을 중심으로 구현되어 있습니다.
