import { useState } from 'react';
import { Download, Music, Loader2, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!url) {
      setError('الرجاء إدخال رابط أولاً!');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, check if the URL is valid by fetching info
      const infoResponse = await axios.post('/api/info', { url });
      const title = infoResponse.data.title || 'audio';

      // Trigger the actual download
      // We use window.location.href or a hidden link to trigger browser download
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${title}.mp3`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`✅ تم التحويل بنجاح: ${title}`);
    } catch (err: any) {
      console.error(err);
      setError('⚠️ فشل التحميل. قد تكون المنصة تحظر الطلب أو الرابط غير صالح.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-xl shadow-black/5 p-8 md:p-12 text-center border border-black/5"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-6 text-white"
          >
            <Music size={32} />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-2 tracking-tight">
            Convert Video to <span className="text-[#00d084]">MP3</span>
          </h1>
          <p className="text-[#666] text-lg">
            Download high-quality audio from YouTube, TikTok & more
          </p>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="أدخل رابط الفيديو هنا (YouTube, TikTok, FB, IG)..."
              dir="rtl"
              className="w-full px-6 py-4 bg-[#f1f3f5] border border-transparent focus:border-[#00d084] focus:bg-white rounded-full text-lg transition-all outline-none placeholder:text-gray-400 text-right"
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-black hover:bg-[#333] disabled:bg-gray-400 text-white font-bold py-4 rounded-full text-lg transition-all flex items-center justify-center gap-2 group border-2 border-transparent hover:border-[#00d084]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <>
                <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Download MP3 📥</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 text-right justify-end"
            >
              <span className="text-sm font-medium">{error}</span>
              <AlertCircle size={20} />
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 flex items-center gap-3 text-right justify-end"
            >
              <span className="text-sm font-medium">{success}</span>
              <CheckCircle2 size={20} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Globe size={14} />
              <span>Supports 1000+ sites</span>
            </div>
            <span>•</span>
            <span>YouTube</span>
            <span>•</span>
            <span>TikTok</span>
            <span>•</span>
            <span>Facebook</span>
            <span>•</span>
            <span>Instagram</span>
          </div>
        </div>
      </motion.div>

      <footer className="mt-8 text-gray-400 text-sm">
        Universal MP3 Downloader • High Quality Audio
      </footer>
    </div>
  );
}
