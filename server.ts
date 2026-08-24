import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4211', 10);

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Search Grounding API for active folder
app.post('/api/folder-search', async (req, res) => {
  try {
    const { folderName, folderPath, files = [], customQuery } = req.body;

    if (!folderName) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    if (!ai) {
      // Return structured fallback search insights if API key is not configured
      return res.json({
        folderName,
        summary: `Search insights and resources curated for "${folderName}". Connect your Gemini API key in Secrets for live AI-driven Google Search grounding.`,
        searchQueries: [
          `${folderName} best practices and guides`,
          `${folderName} documentation 2026`
        ],
        results: [
          {
            title: `${folderName} - Official Resources & Documentation`,
            url: `https://www.google.com/search?q=${encodeURIComponent(folderName + ' documentation')}`,
            snippet: `Find the official manuals, tutorials, and ecosystem guides for ${folderName}.`,
            source: 'Google Search'
          },
          {
            title: `Community Topics & Libraries for ${folderName}`,
            url: `https://github.com/topics/${encodeURIComponent(folderName.toLowerCase().replace(/\s+/g, '-'))}`,
            snippet: `Discover top open source implementations and code samples related to ${folderName}.`,
            source: 'GitHub'
          },
          {
            title: `Latest News and Discussions: ${folderName}`,
            url: `https://news.ycombinator.com/`,
            snippet: `Read tech announcements and articles covering ${folderName}.`,
            source: 'Tech News'
          }
        ],
        recommendedBookmarks: [
          {
            title: `${folderName} Getting Started Guide`,
            url: `https://www.google.com/search?q=${encodeURIComponent(folderName + ' guide')}`,
            description: `Bookmark this search query to quickly jump to ${folderName} references.`
          }
        ],
        topicTags: [folderName, 'Docs', 'Community', 'Resources']
      });
    }

    const fileSummaryList = files.slice(0, 10).map((f: any) => `- ${f.name} (${f.type || 'file'})`).join('\n');
    
    const prompt = `You are an AI search engine embedded in ExplorerNova file manager.
Active Folder: "${folderName}"
Path: "${folderPath || '/' + folderName}"
Files present in this folder:
${fileSummaryList || '(Empty folder)'}

${customQuery ? `User Search Override Query: "${customQuery}"` : ''}

Task: Use Google Search to find current, authoritative information, official documentation, web links, or news relevant to "${folderName}".

Provide a response in clean JSON format matching this exact schema:
{
  "summary": "2-3 concise sentences explaining key concepts, updates, or helpful context for '${folderName}'.",
  "recommendedBookmarks": [
    {
      "title": "Clear descriptive title of a recommended webpage or doc",
      "url": "https://...",
      "description": "Short summary of why this resource is relevant to this folder."
    }
  ],
  "topicTags": ["Tag1", "Tag2", "Tag3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    
    // Extract search grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const webResults = groundingChunks.map((chunk: any) => {
      if (chunk.web) {
        let domain = 'Google Search';
        try {
          domain = new URL(chunk.web.uri).hostname.replace('www.', '');
        } catch (e) {}

        return {
          title: chunk.web.title || `Result for ${folderName}`,
          url: chunk.web.uri,
          snippet: chunk.web.title ? `Verified web reference for ${folderName}` : 'Web search source',
          source: domain,
        };
      }
      return null;
    }).filter(Boolean);

    let parsed: any = {};
    try {
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      parsed = {
        summary: responseText.slice(0, 300) || `Overview and web insights for ${folderName}.`,
        recommendedBookmarks: [],
        topicTags: [folderName],
      };
    }

    return res.json({
      folderName,
      summary: parsed.summary || `Live web insights for ${folderName}.`,
      searchQueries: webSearchQueries.length > 0 ? webSearchQueries : [`${folderName} guides`],
      results: webResults.length > 0 ? webResults : [
        {
          title: `${folderName} - Search Overview`,
          url: `https://www.google.com/search?q=${encodeURIComponent(folderName)}`,
          snippet: `Top search results and web information for ${folderName}.`,
          source: 'Google Search'
        }
      ],
      recommendedBookmarks: parsed.recommendedBookmarks || [],
      topicTags: parsed.topicTags || [folderName, 'Web Search'],
    });

  } catch (error: any) {
    console.error('Error handling folder search grounding:', error);
    res.status(500).json({
      error: 'Failed to process folder search grounding',
      details: error.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExplorerNova full-stack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
