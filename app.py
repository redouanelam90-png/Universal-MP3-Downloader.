import streamlit as st
import yt_dlp
import os
import time

# --- إعدادات الواجهة ---
st.set_page_config(page_title="Universal MP3 Downloader", page_icon="🎵", layout="centered")

# --- تصميم CSS احترافي يطابق طلبك ---
st.markdown("""
    <style>
    .main { text-align: center; }
    .main-title { font-size: 48px; font-weight: bold; text-align: center; color: #1a1a1a; margin-bottom: 0px; }
    .highlight { color: #00d084; }
    .sub-title { text-align: center; color: #666; margin-bottom: 30px; }
    .stTextInput input { border-radius: 30px !important; padding: 12px 25px !important; border: 1px solid #ddd !important; }
    .stButton button {
        background-color: #000000 !important;
        color: white !important;
        border-radius: 30px !important;
        width: 100% !important;
        height: 50px !important;
        font-weight: bold !important;
        transition: 0.3s;
    }
    .stButton button:hover { background-color: #333 !important; border-color: #00d084 !important; }
    </style>
    """, unsafe_allow_html=True)

# --- محتوى الصفحة ---
st.markdown('<p class="main-title">Convert Video to <span class="highlight">MP3</span></p>', unsafe_allow_html=True)
st.markdown('<p class="sub-title">Download high-quality audio from YouTube, TikTok & more</p>', unsafe_allow_html=True)

url = st.text_input("", placeholder="أدخل رابط الفيديو هنا (YouTube, TikTok, FB, IG)...", label_visibility="collapsed")
convert_btn = st.button("Download MP3 📥")

if convert_btn:
    if url:
        with st.spinner('جاري المعالجة... يرجى الانتظار قليلاً'):
            try:
                # إنشاء مجلد للتحميلات إذا لم يوجد
                if not os.path.exists('downloads'):
                    os.makedirs('downloads')

                # إعدادات yt-dlp الاحترافية لتجاوز القيود
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': '192',
                    }],
                    'outtmpl': 'downloads/%(title)s.%(ext)s',
                    'quiet': True,
                    'no_warnings': True,
                    # إضافة User-Agent لتبدو كمتصفح حقيقي
                    'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    # الحصول على المسار الصحيح للملف المحول
                    temp_file = ydl.prepare_filename(info)
                    base, ext = os.path.splitext(temp_file)
                    final_mp3 = base + ".mp3"

                # عرض النتيجة
                if os.path.exists(final_mp3):
                    st.success(f"✅ تم التحويل بنجاح: {info.get('title')}")
                    with open(final_mp3, "rb") as f:
                        st.download_button(
                            label="تحميل ملف الـ MP3 الآن",
                            data=f,
                            file_name=f"{info.get('title')}.mp3",
                            mime="audio/mp3"
                        )
                    # تنظيف الملفات بعد التحميل
                    time.sleep(2)
                    os.remove(final_mp3)
                
            except Exception as e:
                st.error("⚠️ فشل التحميل. يوتيوب أو المنصة قد تحظر الطلب من هذا السيرفر. جرب رابطاً آخر أو استضافة مختلفة.")
                st.info("نصيحة: إذا كنت تشغل الكود داخل Google AI Studio، فلن يشتغل بسبب قيود جوجل.")
    else:
        st.warning("الرجاء وضع رابط أولاً!")

st.markdown("---")
st.caption("Supports YouTube, Facebook, TikTok, Instagram and 1000+ sites.")
