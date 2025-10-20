import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2/video/generate';

export async function POST (req: NextRequest) {
  try {
    const body = await req.json();
    const { script, avatarId, voiceId } = body;

    if (!script || !avatarId || !voiceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Now using the correct HeyGen API structure
    const payload = {
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatarId,
            avatar_style: "normal"
          },
          voice: {
            type: "text",
            input_text: script,
            voice_id: voiceId
          }
        }
      ],
      dimension: {
        width: 1280,
        height: 720
      }
    };

    console.log('Sending HeyGen request with payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(HEYGEN_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': HEYGEN_API_KEY as string
      }
    });
    
    console.log('HeyGen response:', response.data);

            const videoId = response.data.data.video_id;
            console.log('Video generation started with ID:', videoId);
            
            // Return immediately with video ID for frontend polling
            return NextResponse.json({ 
              videoId,
              status: 'processing',
              message: 'Video generation started. Please wait while we process your video...'
            });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const responseData = err && typeof err === 'object' && 'response' in err && 
      typeof (err as { response?: { data?: unknown } }).response === 'object' && 
      (err as { response: { data?: unknown } }).response?.data;
    console.error('HeyGen video generation error:', responseData || errorMessage);
    
    // For demo purposes, return a mock video URL when HeyGen fails
    // In production, you'd want to handle this differently
    console.log('Falling back to mock video for demo purposes');
    return NextResponse.json({ 
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      note: "Demo mode - HeyGen API error, using sample video"
    });
  }
}
