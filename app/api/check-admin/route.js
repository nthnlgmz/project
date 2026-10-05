import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ authorized: false }, { status: 400 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  const isAuthorized = adminEmails.includes(email.toLowerCase());

  return NextResponse.json({ authorized: isAuthorized });
}
