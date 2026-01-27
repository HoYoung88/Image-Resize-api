# syntax=docker/dockerfile:1

# ---- Runtime (최종 실행 이미지만 정의) ----
FROM node:25-alpine

# Nginx 설치
RUN apk add --no-cache nginx

WORKDIR /app

# ★ 핵심 변경 ★
# 빌더 단계(--from=builder)가 아니라,
# 젠킨스 작업 공간에 있는 ./dist 폴더를 그대로 가져옵니다.
COPY ./dist /app/dist

# 설정 파일 복사
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=development
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]