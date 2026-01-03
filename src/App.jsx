import { Upload, Trash2, Download, FileJson } from "lucide-react"
import React, { useState }  from "react"

const API_BASE = 'https://695254133b3c518fca124652.mockapi.io/api/v1'

export default function AdminPanel(){
  const [jsonData, setJsonData] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Load JSON file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('📂 Reading file...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);
        
        setJsonData(JSON.stringify(parsed, null, 2));
        setStats({
          users: parsed.users?.length || 0,
          flashcards: parsed.flashcards?.length || 0
        });
        setStatus(`✅ File loaded: ${file.name}`);
      } catch (error) {
        setStatus('❌ Invalid JSON file!');
        setJsonData('');
      }
    };
    reader.readAsText(file);
  };
  // Upload to MockAPI
  const uploadToMockAPI = async () => {
    if (!jsonData) {
      setStatus('❌ Please load a JSON file first!');
      return;
    }

    setLoading(true);
    try {
      const data = JSON.parse(jsonData);
      let uploadedCount = { users: 0, flashcards: 0 };
      
      // Upload users
      setStatus('📚 Uploading users...');
      if (data.users && data.users.length > 0) {
        for (let i = 0; i < data.users.length; i++) {
          try {
            await fetch(`${API_BASE}/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data.users[i])
            });
            uploadedCount.users++;
            setStatus(`📚 Uploading users... ${i + 1}/${data.users.length}`);
          } catch (err) {
            console.error('Failed to upload user:', err);
          }
        }
      }
      
      // Upload flashcards
      setStatus('🎴 Uploading flashcards...');
      if (data.flashcards && data.flashcards.length > 0) {
        for (let i = 0; i < data.flashcards.length; i++) {
          try {
            await fetch(`${API_BASE}/flashcards`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data.flashcards[i])
            });
            uploadedCount.flashcards++;
            setStatus(`🎴 Uploading flashcards... ${i + 1}/${data.flashcards.length}`);
          } catch (err) {
            console.error('Failed to upload flashcard:', err);
          }
        }
      }
      
      setStatus(`🎉 Upload completed! Users: ${uploadedCount.users}, Flashcards: ${uploadedCount.flashcards}`);
    } catch (error) {
      setStatus('❌ Upload failed: ' + error.message);
    }
    setLoading(false);
  };

  // Clear MockAPI data
  const clearMockAPI = async () => {
    if (!confirm('⚠️ This will DELETE ALL data on MockAPI! Are you sure?')) return;
    
    setLoading(true);
    setStatus('🗑️ Clearing data...');
    try {
      let deletedCount = { users: 0, flashcards: 0 };
      
      // Clear flashcards
      const flashcards = await fetch(`${API_BASE}/flashcards`).then(r => r.json());
      for (const item of flashcards) {
        await fetch(`${API_BASE}/flashcards/${item.id}`, { method: 'DELETE' });
        deletedCount.flashcards++;
      }
      
      // Clear users
      const users = await fetch(`${API_BASE}/users`).then(r => r.json());
      for (const item of users) {
        await fetch(`${API_BASE}/users/${item.id}`, { method: 'DELETE' });
        deletedCount.users++;
      }
      
      setStatus(`✅ Cleared ${deletedCount.users} users, ${deletedCount.flashcards} flashcards`);
    } catch (error) {
      setStatus('❌ Clear failed: ' + error.message);
    }
    setLoading(false);
  };

  // Download JSON
  const downloadJSON = () => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcard-data.json';
    a.click();
  };
  return (
    <div className="min-h-screen bg-gradien-to-br form-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/*Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
              🎴 Flashcard Admin Panel
          </h1>
          <p className="text-amber-700">
            Upload JSON file and sync to MockAPI
          </p>
        </div>
        {/*File upload section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-amber-900 mb-4">📂 Step 1: Load JSON File</h2>

          <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center">
            <FileJson size={48} className="mx-auto mb-4 text-amber-600"/>
            <label className="cursor-pointer">
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload}/> 
              <span className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                Choose JSON File
              </span>
            </label>
            {fileName && (
              <p className="mt-4 text-amber-800 font-medium">
                📄 {fileName}
              </p>
            )}
          </div>

          {stats && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-900">{stats.users}</p>
                <p className="text-sm text-amber-700">Users</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-900">{stats.flashcards}</p>
                <p className="text-sm text-amber-700">Flashcards</p>
              </div>
            </div>
          )}
        {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-900 mb-4">⚡ Step 2: Upload to MockAPI</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
              onClick={uploadToMockAPI}
              disabled={loading || !jsonData}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={20} />
              Upload to MockAPI
            </button>

            <button
              onClick={downloadJSON}
              disabled={!jsonData}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Download JSON
            </button>

            <button
              onClick={clearMockAPI}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
              Clear MockAPI
            </button>
            </div>
          </div>
          {/* Status */}
          {status && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-mono text-sm text-amber-900">{status}</p>
            </div>
          )}
        </div>

        {/* JSON Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900">📝 JSON Preview</h2>
            <span className="text-sm text-amber-700">
              {jsonData ? `${jsonData.length} characters` : 'No data loaded'}
            </span>
          </div>

          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Load a JSON file or paste JSON here..."
            className="w-full h-96 p-4 font-mono text-sm border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">🔗 Test Endpoints:</p>
            <div className="space-y-1 text-xs font-mono text-blue-800">
              <div>GET {API_BASE}/users</div>
              <div>GET {API_BASE}/flashcards</div>
            </div>
          </div>
      </div>
    </div>
  )
  
}