# syntax=docker/dockerfile:1

# ---- Runtime ----
FROM node:25-alpine

# Nginx 설치
RUN apk add --no-cache nginx

# pnpm 활성화 (필수)
RUN npm install -g pnpm

WORKDIR /app

# [★ 추가된 부분 1] 패키지 설정 파일 복사
COPY package.json pnpm-lock.yaml ./

# [★ 추가된 부분 2] 실행에 필요한 라이브러리만 설치 (--prod)
# --prod: 개발용(devDependencies)은 빼고 설치해서 이미지를 가볍게 유지
RUN pnpm install --prod --frozen-lockfile

# 기존 빌드 결과물(dist) 복사
COPY ./dist /app/dist

# 설정 파일 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=development
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]