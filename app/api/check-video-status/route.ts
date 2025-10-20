import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const statusUrl = `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`;
    
    const statusResp = await axios.get(statusUrl, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY as string
      }
    });

    const data = statusResp.data.data;
    
    return NextResponse.json({
      status: data.status,
      videoUrl: data.video_url,
      error: data.error
    });

  } catch (err: any) {
    console.error('Video status check error:', err);
    return NextResponse.json({ 
      error: 'Failed to check video status',
      status: 'error'
    }, { status: 500 });
  }
}
