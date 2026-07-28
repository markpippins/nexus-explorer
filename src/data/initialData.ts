import { FileItem, KeyboardShortcut } from '../types';

export const INITIAL_FILES: FileItem[] = [
  // Root Level Folders
  {
    id: 'folder-react19',
    name: 'React 19 & Next.js Ecosystem',
    parentId: 'root',
    isFolder: true,
    fileType: 'folder',
    size: 4096,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tags: ['Dev', 'Frontend', 'React'],
    pinned: true,
    color: '#38bdf8', // Sky blue
    cloudSyncStatus: 'synced',
  },
  {
    id: 'folder-ai-ml',
    name: 'Machine Learning & LLM Pipelines',
    parentId: 'root',
    isFolder: true,
    fileType: 'folder',
    size: 4096,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    tags: ['AI', 'Python', 'Models'],
    pinned: true,
    color: '#a855f7', // Purple
    cloudSyncStatus: 'synced',
  },
  {
    id: 'folder-finance',
    name: 'Financial Reports & Portfolio 2026',
    parentId: 'root',
    isFolder: true,
    fileType: 'folder',
    size: 4096,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    tags: ['Finance', 'Tax', 'Reports'],
    pinned: false,
    color: '#22c55e', // Green
    cloudSyncStatus: 'synced',
  },
  {
    id: 'folder-travel',
    name: 'Tokyo & Kyoto Japan Travel Plan',
    parentId: 'root',
    isFolder: true,
    fileType: 'folder',
    size: 4096,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    tags: ['Travel', 'Japan', 'Vacation'],
    pinned: false,
    color: '#f43f5e', // Rose
    cloudSyncStatus: 'synced',
  },
  {
    id: 'folder-design',
    name: 'UI UX Design Systems & Tokens',
    parentId: 'root',
    isFolder: true,
    fileType: 'folder',
    size: 4096,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    tags: ['Design', 'Tailwind', 'Assets'],
    pinned: false,
    color: '#eab308', // Amber
    cloudSyncStatus: 'synced',
  },

  // Files in Root
  {
    id: 'file-welcome-readme',
    name: 'README-ExplorerNova.md',
    parentId: 'root',
    isFolder: false,
    fileType: 'document',
    size: 2048,
    updatedAt: new Date().toISOString(),
    content: `# Welcome to ExplorerNova 🚀

ExplorerNova is a next-generation file manager equipped with a **Dual-Pane Active Folder Search** powered by Google Search grounding.

### Key Features:
- 🔍 **Active Folder Web Grounding**: Click any folder to see real-time Google search results, news, docs, and summaries relevant to that folder topic.
- 🎨 **Triple Theme Engine**: Seamlessly switch between **Light**, **Dark**, and **Steel** metallic aesthetics.
- ⚡ **Batch Processing**: Multi-select files to perform batch deletion, batch move, batch tag edits, or batch export.
- 🖐️ **Drag & Drop**: Effortlessly drag files into subfolders or trash bin.
- ☁️ **Cloud Synchronization**: Simulated device pairing and cross-platform cloud sync status tracking.
- ⌨️ **Customizable Shortcuts**: Rebind navigation and file action hotkeys to fit your workflow.
`,
    tags: ['Guide', 'System'],
    pinned: true,
    cloudSyncStatus: 'synced',
  },
  {
    id: 'file-root-bookmark',
    name: 'Google AI Studio Portal.url',
    parentId: 'root',
    isFolder: false,
    fileType: 'bookmark',
    size: 120,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    content: 'https://ai.studio/',
    tags: ['Web', 'AI'],
    cloudSyncStatus: 'synced',
  },

  // Subfiles in "React 19 & Next.js Ecosystem"
  {
    id: 'react-use-action-state',
    name: 'useActionState_examples.tsx',
    parentId: 'folder-react19',
    isFolder: false,
    fileType: 'code',
    size: 3420,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    content: `import { useActionState } from 'react';

async function updateProfile(previousState: any, formData: FormData) {
  const name = formData.get('name');
  if (!name) return { error: 'Name is required' };
  
  // Perform server action or API call
  return { success: true, user: { name } };
}

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      <input name="name" placeholder="Enter full name" className="p-2 border rounded" />
      <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded">
        {isPending ? 'Saving...' : 'Update Profile'}
      </button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">Profile saved!</p>}
    </form>
  );
}`,
    tags: ['React19', 'Hooks', 'TypeScript'],
    cloudSyncStatus: 'synced',
  },
  {
    id: 'react-notes-md',
    name: 'react19-server-components-guide.md',
    parentId: 'folder-react19',
    isFolder: false,
    fileType: 'document',
    size: 1850,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    content: `# React 19 Architectural Highlights

1. **Actions & Async Transitions**: Standardized handling of pending states, optimistic updates, and form submissions.
2. **Server Components & Server Actions**: Direct RPC communication between client UI and node backend.
3. **Asset Loading Integration**: Resource preloading and stylesheet hoist support built directly into React core.
4. **Custom Elements Support**: Full compatibility with Web Components.
`,
    tags: ['Architecture', 'Docs'],
    cloudSyncStatus: 'synced',
  },
  {
    id: 'react-bookmark-doc',
    name: 'React 19 Official Documentation.url',
    parentId: 'folder-react19',
    isFolder: false,
    fileType: 'bookmark',
    size: 150,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    content: 'https://react.dev/blog/2024/12/05/react-19',
    tags: ['Docs', 'Bookmark'],
    cloudSyncStatus: 'synced',
  },

  // Subfiles in "Machine Learning & LLM Pipelines"
  {
    id: 'ml-transformer-script',
    name: 'gemini_3_6_pipeline.py',
    parentId: 'folder-ai-ml',
    isFolder: false,
    fileType: 'code',
    size: 4210,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    content: `from google import genai
from google.genai import types

def run_grounded_search(query: str):
    client = genai.Client()
    response = client.models.generate_content(
        model='gemini-3.6-flash',
        contents=query,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
    )
    
    print("AI Response:", response.text)
    if response.candidates[0].grounding_metadata.grounding_chunks:
        print("Grounding Chunks:", response.candidates[0].grounding_metadata.grounding_chunks)

if __name__ == "__main__":
    run_grounded_search("What are the latest breakthroughs in AI agents 2026?")
`,
    tags: ['Python', 'Gemini', 'AI'],
    cloudSyncStatus: 'synced',
  },
  {
    id: 'ml-dataset-schema',
    name: 'fine_tuning_dataset.json',
    parentId: 'folder-ai-ml',
    isFolder: false,
    fileType: 'data',
    size: 12000,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    content: `[
  {
    "instruction": "Summarize user request into key parameters.",
    "input": "Build a file explorer with Google Search grounding.",
    "output": "{\"features\": [\"dual-pane\", \"search-grounding\", \"triple-theme\", \"shortcuts\"]}"
  }
]`,
    tags: ['JSON', 'Dataset'],
    cloudSyncStatus: 'synced',
  },

  // Subfiles in "Financial Reports & Portfolio 2026"
  {
    id: 'fin-q3-summary',
    name: 'Q3_Financial_Summary_2026.csv',
    parentId: 'folder-finance',
    isFolder: false,
    fileType: 'data',
    size: 5120,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    content: `Month,Revenue,Expenses,Net Profit,ROI
Jan 2026,$45200,$18400,$26800,59.2%
Feb 2026,$51800,$19200,$32600,62.9%
Mar 2026,$63400,$21100,$42300,66.7%
Apr 2026,$58900,$20500,$38400,65.1%
`,
    tags: ['Spreadsheet', 'Metrics'],
    cloudSyncStatus: 'synced',
  },
  {
    id: 'fin-tax-guide',
    name: '2026_Tax_Deductions_Checklist.pdf',
    parentId: 'folder-finance',
    isFolder: false,
    fileType: 'pdf',
    size: 145000,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    content: 'PDF Document: 2026 Tax Deductions and Business Equipment Claims Guide',
    tags: ['Tax', 'PDF'],
    cloudSyncStatus: 'synced',
  },

  // Subfiles in "Tokyo & Kyoto Japan Travel Plan"
  {
    id: 'travel-tokyo-hotels',
    name: 'tokyo_hotel_options.md',
    parentId: 'folder-travel',
    isFolder: false,
    fileType: 'document',
    size: 2900,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    content: `# Tokyo Hotel Shortlist 🗾

1. **Shinjuku Park Tower Hotel**
   - Near JR Shinjuku Station
   - Includes rooftop hot spring pass
2. **Asakusa Traditional Ryokan**
   - Authentic tatami mat rooms
   - Walking distance to Senso-ji Temple
3. **Shibuya Stream Hotel**
   - High-speed Wi-Fi, modern co-working lounge
`,
    tags: ['Tokyo', 'Hotels'],
    cloudSyncStatus: 'synced',
  },
  {
    id: 'travel-japan-rail',
    name: 'Japan_Rail_Pass_Map.png',
    parentId: 'folder-travel',
    isFolder: false,
    fileType: 'image',
    size: 340000,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    content: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    tags: ['Image', 'Transit'],
    cloudSyncStatus: 'synced',
  }
];

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: 'new_file',
    label: 'Create New File',
    category: 'File Operations',
    keyDisplay: 'Ctrl + N',
    key: 'n',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'new_folder',
    label: 'Create New Folder',
    category: 'File Operations',
    keyDisplay: 'Ctrl + Shift + N',
    key: 'N',
    ctrlOrCmd: true,
    shiftKey: true,
    altKey: false,
  },
  {
    id: 'rename',
    label: 'Rename Item',
    category: 'File Operations',
    keyDisplay: 'F2',
    key: 'F2',
    ctrlOrCmd: false,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'delete',
    label: 'Delete Item(s)',
    category: 'File Operations',
    keyDisplay: 'Delete',
    key: 'Delete',
    ctrlOrCmd: false,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'select_all',
    label: 'Select All Items',
    category: 'Selection & Edit',
    keyDisplay: 'Ctrl + A',
    key: 'a',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'copy',
    label: 'Copy Selected Item(s)',
    category: 'Selection & Edit',
    keyDisplay: 'Ctrl + C',
    key: 'c',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'paste',
    label: 'Paste Copied Item(s)',
    category: 'Selection & Edit',
    keyDisplay: 'Ctrl + V',
    key: 'v',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'search',
    label: 'Focus File Filter/Search',
    category: 'Navigation & View',
    keyDisplay: 'Ctrl + F',
    key: 'f',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'toggle_search_pane',
    label: 'Toggle Active Folder Search Pane',
    category: 'Navigation & View',
    keyDisplay: 'Ctrl + G',
    key: 'g',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'toggle_theme',
    label: 'Cycle Themes (Light / Dark / Steel)',
    category: 'Navigation & View',
    keyDisplay: 'Ctrl + T',
    key: 't',
    ctrlOrCmd: true,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'cloud_sync',
    label: 'Trigger Cloud Sync',
    category: 'System & Sync',
    keyDisplay: 'Ctrl + Shift + S',
    key: 'S',
    ctrlOrCmd: true,
    shiftKey: true,
    altKey: false,
  },
  {
    id: 'quick_preview',
    label: 'Quick File Preview (QuickLook)',
    category: 'Navigation & View',
    keyDisplay: 'Space',
    key: ' ',
    ctrlOrCmd: false,
    shiftKey: false,
    altKey: false,
  },
  {
    id: 'help',
    label: 'Open Keyboard Shortcuts Guide',
    category: 'System & Sync',
    keyDisplay: '?',
    key: '?',
    ctrlOrCmd: false,
    shiftKey: false,
    altKey: false,
  }
];
