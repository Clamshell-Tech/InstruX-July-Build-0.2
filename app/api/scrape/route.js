import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL provided.' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and navigation elements
    $('script, style, nav, footer, header, noscript, iframe, svg').remove();

    // Extract text from main content areas, fallback to body
    let mainText = $('main, article, .content, #content, .post').text();
    
    if (!mainText || mainText.trim().length < 200) {
      mainText = $('body').text();
    }

    // Clean up text
    const cleanText = mainText
      .replace(/\s+/g, ' ')
      .trim();

    const title = $('title').text().trim() || url;

    return NextResponse.json({ 
      title,
      text: cleanText.substring(0, 50000) // limit to 50k chars
    });

  } catch (error) {
    console.error('Scrape API Error:', error);
    return NextResponse.json({ error: 'Failed to scrape the webpage.' }, { status: 500 });
  }
}
