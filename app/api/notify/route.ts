// File: app/api/notify/route.ts
import { NextResponse } from 'next/server';
import { adminDb, adminMessaging, adminAuth } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, link } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Ambil semua token dari koleksi fcm_tokens
    const tokensSnapshot = await adminDb.collection('fcm_tokens').get();
    
    if (tokensSnapshot.empty) {
      return NextResponse.json({ message: 'No registered devices found. Broadcast aborted.' }, { status: 200 });
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    // Siapkan struktur pesan multicast untuk FCM
    // Pastikan tidak mengirim payload lebih dari 500 token sekaligus (limit batch Firebase)
    // Jika skala lebih besar, bisa gunakan perulangan pembagian per 500 token.
    const message = {
      tokens: tokens,
      notification: {
        title: title,
        body: content,
      },
      data: {
        // Harus berupa string untuk payload data
        url: link || '/',
      },
    };

    // Kirim multicast
    const response = await adminMessaging.sendEachForMulticast(message);
    
    // Opsional: Bersihkan token yang sudah expired/tidak valid dari database
    const failedTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        if (resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered') {
          failedTokens.push(tokens[idx]);
        }
      }
    });

    if (failedTokens.length > 0) {
      const batch = adminDb.batch();
      failedTokens.forEach(t => {
        batch.delete(adminDb.collection('fcm_tokens').doc(t));
      });
      await batch.commit();
      console.log(`Pembersihan: Dihapus ${failedTokens.length} token tidak valid.`);
    }

    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount, 
      failureCount: response.failureCount 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error broadcast push notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
