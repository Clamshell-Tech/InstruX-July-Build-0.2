import { NextResponse } from 'next/server';
import { getOpenAI, getSupabase } from '../../../lib/ai';
import { randomUUID } from 'crypto';
export async function POST(request) {

  try {
    const { visualPrompt, visualStyle, slideTitle, brandKitId } = await request.json();

    if (!visualPrompt) return NextResponse.json({ imageUrl: null });

    // Style-specific prompt suffixes for better AI art
    const styleGuide = {
      cinematic:   'Cinematic film still, dramatic moody lighting, 8K resolution, vertical portrait',
      illustrated: 'Premium editorial digital illustration, vibrant professional colour palette, vertical portrait',
      comic:       'Bold comic book illustration, dynamic action composition, vertical portrait',
      '3d-render': 'High-quality 3D CGI render, photorealistic, vertical format',
      realistic:   'Professional photography, natural soft lighting, ultra-sharp focus, vertical portrait',
    };
    const styleSuffix = styleGuide[visualStyle] || styleGuide.cinematic;
    const enhancedPrompt = `${visualPrompt}. ${styleSuffix}. No text, no watermarks.`;

    // Using Pollinations.ai (Completely FREE, no API key needed!)
    // It returns the image directly via URL. We just encode the prompt.
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1792&nologo=true&seed=${seed}`;

    return NextResponse.json({ imageUrl });

  } catch (err) {
    console.warn('Free image generation failed:', err.message);
    return NextResponse.json({ imageUrl: null });
  }
}
