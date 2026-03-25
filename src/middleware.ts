import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 인증 비활성화 - 모든 요청 통과
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
