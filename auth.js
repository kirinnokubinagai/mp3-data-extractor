/**
 * 認証画面スクリプト
 */
import { createClient } from '@supabase/supabase-js';

// Supabase設定（デプロイ後に更新）
const SUPABASE_URL = 'https://your-project.supabase.co'; // TODO: 更新
const SUPABASE_ANON_KEY = 'your-anon-key'; // TODO: 更新

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM要素
const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const messageEl = document.getElementById('message');

// タブ切り替え
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;

    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    document.getElementById(`${tabName}-form`).classList.add('active');
    messageEl.innerHTML = '';
  });
});

// ログイン
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  loginBtn.disabled = true;
  loginBtn.textContent = 'ログイン中...';
  messageEl.innerHTML = '';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // セッション保存
    await chrome.storage.local.set({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user
      }
    });

    showMessage('ログイン成功！', 'success');

    // 1秒後にpopup.htmlに遷移
    setTimeout(() => {
      window.location.href = 'popup.html';
    }, 1000);

  } catch (error) {
    console.error('ログインエラー:', error);
    showMessage(`ログインエラー: ${error.message}`, 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'ログイン';
  }
});

// 新規登録
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  signupBtn.disabled = true;
  signupBtn.textContent = '登録中...';
  messageEl.innerHTML = '';

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    showMessage('登録完了！確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。', 'success');

    // フォームクリア
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';

  } catch (error) {
    console.error('登録エラー:', error);
    showMessage(`登録エラー: ${error.message}`, 'error');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = '新規登録';
  }
});

// メッセージ表示
function showMessage(text, type) {
  messageEl.innerHTML = `<div class="${type}">${text}</div>`;
}

// 初期化: すでにログイン済みならpopup.htmlへ
async function init() {
  const { session } = await chrome.storage.local.get('session');
  if (session?.access_token) {
    // トークン有効性チェック
    const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
    if (user && !error) {
      window.location.href = 'popup.html';
    }
  }
}

init();
