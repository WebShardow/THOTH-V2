# Stage 1: Install dependencies
FROM node:24-alpine AS deps
# เพิ่ม openssl สำหรับ Prisma 6 ใน Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# จัดการ pnpm (ใน Node 24 corepack พร้อมใช้งานอยู่แล้ว)
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Stage 2: Build the application
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# สร้าง Prisma Client (สำคัญมากสำหรับ Prisma 6+)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED 1

# รัน build (Next.js 16 จะใช้ Turbopack ในขั้นตอนนี้โดยอัตโนมัติ)
RUN npm run build

# Stage 3: Runner (Production Image)
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# มาตรฐานความปลอดภัย
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# เตรียมโฟลเดอร์สำหรับ Cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# ใช้ Output File Tracing (อย่าลืมตั้ง output: 'standalone' ใน next.config.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
