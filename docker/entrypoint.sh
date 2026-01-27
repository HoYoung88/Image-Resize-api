#!/bin/sh
set -e

# [수정 1] 유연성 확보
# 외부에서 PORT 환경변수가 들어오면 그걸 쓰고, 없으면 4000을 기본값으로 사용
export PORT=${PORT:-4000}

echo "Starting Node.js app on port $PORT..."

# Node 앱 백그라운드 실행
node dist/server.js &

# Node 프로세스 ID(PID) 저장
NODE_PID=$!

# [수정 2] 레이스 컨디션 방지 (선택 사항)
# Node가 켜지기도 전에 Nginx가 요청을 받으면 에러가 날 수 있으므로 1~2초 대기
# (더 정교하게 하려면 wait-for-it 같은 스크립트가 필요하지만, sleep으로도 충분한 경우가 많음)
sleep 2

echo "Starting Nginx..."

# Nginx 실행
# exec를 사용하면 이 쉘 프로세스가 Nginx로 대체됩니다.
exec nginx -g 'daemon off;'