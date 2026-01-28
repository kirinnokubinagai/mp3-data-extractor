"""
yt-dlp API Server for Chrome Extension
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="YouTube Downloader API")

# CORS設定（Chrome拡張機能からのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では拡張機能IDに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoRequest(BaseModel):
    url: str


class VideoInfo(BaseModel):
    title: str
    duration: int
    uploader: str
    thumbnail: str
    formats: list


@app.get("/")
async def root():
    return {"status": "ok", "service": "YouTube Downloader API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/api/video-info")
async def get_video_info(request: VideoRequest):
    """
    YouTube動画情報を取得
    """
    try:
        logger.info(f"Fetching info for: {request.url}")

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)

            # フォーマット情報を整形
            formats = []
            for f in info.get('formats', []):
                # 動画+音声フォーマット、または音声のみフォーマット
                if f.get('vcodec') != 'none' or f.get('acodec') != 'none':
                    formats.append({
                        'format_id': f.get('format_id'),
                        'ext': f.get('ext'),
                        'quality': f.get('quality'),
                        'format_note': f.get('format_note'),
                        'filesize': f.get('filesize'),
                        'url': f.get('url'),
                        'has_video': f.get('vcodec') != 'none',
                        'has_audio': f.get('acodec') != 'none',
                        'width': f.get('width'),
                        'height': f.get('height'),
                        'fps': f.get('fps'),
                        'vcodec': f.get('vcodec'),
                        'acodec': f.get('acodec'),
                        'abr': f.get('abr'),
                        'tbr': f.get('tbr'),
                    })

            return {
                'success': True,
                'data': {
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                    'thumbnail': info.get('thumbnail', ''),
                    'formats': formats,
                }
            }

    except Exception as e:
        logger.error(f"Error fetching video info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/download-url")
async def get_download_url(request: VideoRequest):
    """
    最高画質の動画ダウンロードURLを取得
    """
    try:
        logger.info(f"Getting download URL for: {request.url}")

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': 'bestvideo+bestaudio/best',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)

            # 最適なフォーマットを取得
            if 'requested_formats' in info:
                # 動画+音声が分離している場合
                video_url = info['requested_formats'][0]['url']
                audio_url = info['requested_formats'][1]['url']
                return {
                    'success': True,
                    'data': {
                        'title': info.get('title', 'Unknown'),
                        'video_url': video_url,
                        'audio_url': audio_url,
                        'merged': False,
                    }
                }
            else:
                # 動画+音声が1つのファイルの場合
                return {
                    'success': True,
                    'data': {
                        'title': info.get('title', 'Unknown'),
                        'url': info['url'],
                        'merged': True,
                    }
                }

    except Exception as e:
        logger.error(f"Error getting download URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio-url")
async def get_audio_url(request: VideoRequest):
    """
    最高音質の音声ダウンロードURLを取得
    """
    try:
        logger.info(f"Getting audio URL for: {request.url}")

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': 'bestaudio/best',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)

            return {
                'success': True,
                'data': {
                    'title': info.get('title', 'Unknown'),
                    'url': info['url'],
                    'ext': info.get('ext', 'webm'),
                }
            }

    except Exception as e:
        logger.error(f"Error getting audio URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
