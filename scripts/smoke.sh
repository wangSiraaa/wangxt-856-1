#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=============================================="
echo "  码头水尺计量系统 - 冒烟测试"
echo "=============================================="

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

BASE_URL="${BASE_URL:-}"
STARTED_BY_SCRIPT=false
CONTAINER_NAME="wangxt_856_1-web-1"

detect_running_service() {
  echo "[1/5] 检测运行中的服务..."
  
  if [ -n "$BASE_URL" ]; then
    echo "      使用指定的 BASE_URL: $BASE_URL"
    return 0
  fi
  
  if command -v docker >/dev/null 2>&1; then
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
      local port
      port=$(docker inspect "${CONTAINER_NAME}" --format='{{range $p, $conf := .NetworkSettings.Ports}}{{(index $conf 0).HostPort}}{{end}}' 2>/dev/null | head -1)
      if [ -n "$port" ]; then
        BASE_URL="http://localhost:${port}"
        echo "      检测到 Docker 容器运行在: $BASE_URL"
        return 0
      fi
    fi
  fi
  
  for port in 8081 5174 5173 8080; do
    if curl -sf "http://localhost:${port}/login" >/dev/null 2>&1; then
      BASE_URL="http://localhost:${port}"
      echo "      检测到服务运行在: $BASE_URL"
      return 0
    fi
  done
  
  return 1
}

start_service() {
  echo "[2/5] 启动服务..."
  
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "      使用 Docker 启动服务..."
    if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
      docker-compose up -d --build >/dev/null 2>&1
      STARTED_BY_SCRIPT=true
      sleep 3
    fi
    
    local port
    port=$(docker inspect "${CONTAINER_NAME}" --format='{{range $p, $conf := .NetworkSettings.Ports}}{{(index $conf 0).HostPort}}{{end}}' 2>/dev/null | head -1)
    if [ -n "$port" ]; then
      BASE_URL="http://localhost:${port}"
    else
      BASE_URL="http://localhost:8081"
    fi
  else
    echo "      使用本地开发服务器启动..."
    lsof -ti:5174 | xargs kill -9 2>/dev/null || true
    npm run dev -- --host 0.0.0.0 --port 5174 >/tmp/smoke-dev.log 2>&1 &
    DEV_PID=$!
    STARTED_BY_SCRIPT=true
    BASE_URL="http://localhost:5174"
    sleep 8
  fi
  
  echo "      服务地址: $BASE_URL"
}

wait_for_service() {
  echo "[3/5] 等待服务就绪..."
  
  local max_attempts=15
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -sf "${BASE_URL}/login" >/dev/null 2>&1; then
      echo "      服务已就绪 ✓"
      return 0
    fi
    attempt=$((attempt + 1))
    echo "      等待中... (${attempt}/${max_attempts})"
    sleep 2
  done
  
  echo "      错误: 服务未能在预期时间内就绪"
  return 1
}

run_smoke_tests() {
  echo "[4/5] 运行冒烟测试..."
  echo ""
  echo "      测试场景 1: 读数未填全不能计算"
  echo "      测试场景 2: 前后水尺差异过大触发复核提示"
  echo ""
  
  export BASE_URL
  
  if ! command -v npx >/dev/null 2>&1; then
    echo "      错误: 未找到 npx 命令"
    return 1
  fi
  
  local test_result=0
  
  npx playwright test water-gauge-acceptance.spec.ts \
    --grep "读数未填全时计算按钮禁用|前后水尺差异过大触发复核提示" \
    --reporter=list \
    --workers=1 \
    --timeout=120000 || test_result=$?
  
  echo ""
  if [ $test_result -eq 0 ]; then
    echo "      ✓ 冒烟测试全部通过"
  else
    echo "      ✗ 冒烟测试失败 (退出码: ${test_result})"
  fi
  
  return $test_result
}

cleanup() {
  echo "[5/5] 清理资源..."
  
  if [ "$STARTED_BY_SCRIPT" = true ]; then
    if [ -n "${DEV_PID:-}" ] && kill -0 "$DEV_PID" 2>/dev/null; then
      kill "$DEV_PID" 2>/dev/null || true
      echo "      已停止本地开发服务器"
    elif command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER_NAME}$"; then
      docker-compose down >/dev/null 2>&1 || true
      echo "      已停止 Docker 容器"
    fi
  else
    echo "      服务由外部启动，保持运行状态"
  fi
}

trap cleanup EXIT

main() {
  if ! detect_running_service; then
    start_service
  fi
  
  if ! wait_for_service; then
    echo "=============================================="
    echo "  ✗ 冒烟测试失败 - 服务无法访问"
    echo "=============================================="
    exit 1
  fi
  
  echo ""
  echo "服务地址: $BASE_URL"
  echo ""
  
  local test_exit_code=0
  run_smoke_tests || test_exit_code=$?
  
  echo ""
  echo "=============================================="
  if [ $test_exit_code -eq 0 ]; then
    echo "  ✓ 冒烟测试 - 全部通过"
    echo "=============================================="
  else
    echo "  ✗ 冒烟测试 - 失败"
    echo "=============================================="
  fi
  
  exit $test_exit_code
}

main "$@"
