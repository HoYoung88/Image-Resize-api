# Image-Resize-api

이미지 리사이징 API 서버입니다. 외부 URL에서 이미지를 가져와 리사이즈하고 최적화된 형식(AVIF/WebP)으로 변환하여 제공합니다.

## 프로젝트 설정

### 필수 요구사항
- Node.js >= 23
- pnpm

### 설치
```bash
npm install -g pnpm
pnpm install
```

### 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# CDN Configuration (필수)
CDN_DOMAIN=your-cdn-domain.com

# Logging Configuration
LOGGING_FILE_PATH=./logs

# Image Processing Limits
MAX_IMAGE_SIZE_MB=10
MAX_IMAGE_DIMENSION=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 실행

### 개발 모드
```bash
pnpm run dev
```

### 빌드
```bash
pnpm run build
```

### 프로덕션 실행
```bash
pnpm run start
```

## API 엔드포인트

### 1. 이미지 리사이즈 (URL 파라미터)
```
GET /resize-image
```

**Query Parameters:**
- `url` (string, 필수): 리사이즈할 이미지 URL
- `w` (number, 선택): 너비 (기본값: 원본 너비, 최대: 5000)
- `h` (number, 선택): 높이 (기본값: 원본 높이, 최대: 5000)
- `q` (float, 선택): 품질 (0.0 ~ 1.0, 기본값: 0.8)
- `c` (string, 선택): 크롭 모드 ('c'로 설정 시 크롭)

**예시:**
```
GET /resize-image?url=https://example.com/image.jpg&w=800&h=600&q=0.9
```

### 2. 이미지 리사이즈 (경로 파라미터)
```
GET /img/:path/:filename.:ext
```

**Path Parameters:**
- `path`: 이미지 경로
- `filename`: 파일명
- `ext`: 확장자

**Query Parameters:**
- `w`, `h`, `q`, `c` (위와 동일)

**예시:**
```
GET /img/products/product1.jpg?w=400&h=400&c=c
```

**Response:**
- Content-Type: `image/avif` 또는 `image/webp`
- Cache-Control: `public, max-age=31536000, immutable`
- Body: 이미지 바이너리 데이터

## 주요 기능

- ✅ 이미지 리사이징 및 최적화
- ✅ AVIF/WebP 형식 자동 변환
- ✅ 크롭 모드 지원
- ✅ Rate limiting
- ✅ 보안 헤더 설정
- ✅ 에러 처리 및 로깅
- ✅ 이미지 크기 및 차원 제한
- ✅ Graceful shutdown

## 프로젝트 구조

```
src/
├── config/          # 설정 파일
│   └── env.ts       # 환경 변수 관리
├── controllers/     # 컨트롤러
│   └── imageController.ts
├── middlewares/     # 미들웨어
│   ├── imageMiddleware.ts
│   └── rateLimiter.ts
├── models/          # 데이터 모델
│   ├── imageDataModel.ts
│   └── imageResizeDataModel.ts
├── routes/          # 라우트
│   └── imageRoutes.ts
├── services/        # 비즈니스 로직
│   └── imageService.ts
├── utils/           # 유틸리티
│   ├── errors.ts
│   ├── imageClient.ts
│   ├── logger.ts
│   └── typeUtils.ts
├── app.ts           # Express 앱 설정
└── server.ts        # 서버 시작
```

## 기술 스택

- **Runtime**: Node.js 23+
- **Framework**: Express 5.0
- **Language**: TypeScript
- **Image Processing**: Sharp
- **Logging**: Winston
- **Package Manager**: pnpm

## 보안 기능

- Rate limiting (기본: 100 requests/분)
- 보안 HTTP 헤더 (X-Content-Type-Options, X-Frame-Options 등)
- 이미지 크기 및 차원 제한
- URL 검증 (HTTP/HTTPS만 허용)
- 이미지 타입 검증

## 제한 사항

- 최대 이미지 크기: 10MB (환경 변수로 설정 가능)
- 최대 이미지 차원: 5000x5000 (환경 변수로 설정 가능)
- 지원 형식: JPEG, PNG, GIF, WebP, AVIF
- Rate limit: 100 requests/분 (환경 변수로 설정 가능)

## 라이선스

MIT
