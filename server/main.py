"""
yt-dlp API Server for Chrome Extension with Authentication & Quota
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import logging
import os
from supabase import create_client, Client
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase設定
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.warning("⚠️  Supabase環境変数が設定されていません。認証機能は無効です。")
    supabase: Optional[Client] = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase接続成功")

app = FastAPI(title="YouTube Downloader API with Auth")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では拡張機能IDに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VideoRequest(BaseModel):
    url: str


class AuthResponse(BaseModel):
    user_id: str
    email: str
    plan: str
    usage: int
    quota: int
    remaining: int


async def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """
    JWTトークンを検証してユーザーIDを返す
    """
    if not supabase:
        # 認証無効モード（開発用）
        return "dev-user"

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="認証が必要です")

    token = authorization.replace("Bearer ", "")

    try:
        # トークン検証
        user = supabase.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="無効なトークンです")

        return user.user.id

    except Exception as e:
        logger.error(f"認証エラー: {str(e)}")
        raise HTTPException(status_code=401, detail="認証に失敗しました")


async def check_and_increment_quota(user_id: str):
    """
    クオータチェック＆使用回数インクリメント
    """
    if not supabase:
        # 認証無効モード
        return

    try:
        # クオータチェック
        result = supabase.rpc('check_quota', {'p_user_id': user_id}).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="クオータ情報の取得に失敗しました")

        quota_info = result.data[0]

        if not quota_info['allowed']:
            raise HTTPException(
                status_code=429,
                detail=f"今月の利用上限（{quota_info['quota']}回）に達しました。プランをアップグレードしてください。"
            )

        # 使用回数インクリメント
        supabase.rpc('increment_usage', {'p_user_id': user_id}).execute()

        logger.info(f"✅ ユーザー {user_id}: 残り {quota_info['remaining'] - 1} 回")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"クオータチェックエラー: {str(e)}")
        raise HTTPException(status_code=500, detail="クオータチェックに失敗しました")


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "YouTube Downloader API",
        "auth_enabled": supabase is not None
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/api/user")
async def get_user_info(user_id: str = Depends(verify_token)):
    """
    ユーザー情報と使用状況を取得
    """
    if not supabase:
        return {
            "user_id": "dev-user",
            "email": "dev@example.com",
            "plan": "free",
            "usage": 0,
            "quota": 999,
            "remaining": 999
        }

    try:
        # 今月の使用状況を取得
        result = supabase.rpc('check_quota', {'p_user_id': user_id}).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="ユーザー情報の取得に失敗しました")

        quota_info = result.data[0]

        # ユーザー情報取得
        user = supabase.auth.admin.get_user_by_id(user_id)

        return {
            "user_id": user_id,
            "email": user.user.email if user and user.user else "unknown",
            "plan": quota_info['plan'],
            "usage": quota_info['quota'] - quota_info['remaining'],
            "quota": quota_info['quota'],
            "remaining": quota_info['remaining']
        }

    except Exception as e:
        logger.error(f"ユーザー情報取得エラー: {str(e)}")
        raise HTTPException(status_code=500, detail="ユーザー情報の取得に失敗しました")


@app.post("/api/video-info")
async def get_video_info(
    request: VideoRequest,
    user_id: str = Depends(verify_token)
):
    """
    YouTube動画情報を取得（クオータ消費なし）
    """
    try:
        logger.info(f"Fetching info for: {request.url} (user: {user_id})")

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)

            formats = []
            for f in info.get('formats', []):
                if f.get('vcodec') != 'none' or f.get('acodec') != 'none':
                    formats.append({
                        'format_id': f.get('format_id'),
                        'ext': f.get('ext'),
                        'quality': f.get('quality'),
                        'format_note': f.get('format_note'),
                        'filesize': f.get('filesize'),
                        'has_video': f.get('vcodec') != 'none',
                        'has_audio': f.get('acodec') != 'none',
                        'width': f.get('width'),
                        'height': f.get('height'),
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
async def get_download_url(
    request: VideoRequest,
    user_id: str = Depends(verify_token)
):
    """
    最高画質の動画ダウンロードURLを取得（クオータ消費）
    """
    # クオータチェック＆インクリメント
    await check_and_increment_quota(user_id)

    try:
        logger.info(f"Getting download URL for: {request.url} (user: {user_id})")

        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': 'bestvideo+bestaudio/best',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)

            if 'requested_formats' in info:
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
async def get_audio_url(
    request: VideoRequest,
    user_id: str = Depends(verify_token)
):
    """
    最高音質の音声ダウンロードURLを取得（クオータ消費）
    """
    # クオータチェック＆インクリメント
    await check_and_increment_quota(user_id)

    try:
        logger.info(f"Getting audio URL for: {request.url} (user: {user_id})")

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
