/**
 * UIコンポーネント生成関数
 * Vanilla JavaScript + Tailwind CSS
 */

/**
 * ボタンを作成
 * @param {Object} options - オプション
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} options.variant - バリアント
 * @param {'sm'|'md'|'lg'} [options.size='md'] - サイズ
 * @param {string} options.text - ボタンテキスト
 * @param {Function} [options.onClick] - クリックハンドラ
 * @param {boolean} [options.disabled=false] - 無効化
 * @param {boolean} [options.loading=false] - ローディング状態
 * @param {string} [options.icon] - Lucide Icon名（オプション）
 * @param {string} [options.ariaLabel] - aria-label（アイコンのみの場合必須）
 * @returns {HTMLButtonElement}
 */
export function createButton(options) {
  const {
    variant = 'primary',
    size = 'md',
    text,
    onClick,
    disabled = false,
    loading = false,
    icon,
    ariaLabel
  } = options;

  const button = document.createElement('button');
  button.type = 'button';

  // 基本クラス
  const baseClasses = 'rounded-md transition-colors duration-200 font-medium';

  // サイズクラス
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-5 text-lg'
  };

  // バリアントクラス
  const variantClasses = {
    primary:
      'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
    secondary:
      'bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 text-white shadow-sm focus:ring-secondary-500',
    outline:
      'bg-transparent hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300 text-neutral-700 focus:ring-neutral-300',
    ghost:
      'bg-transparent hover:bg-neutral-50 active:bg-neutral-100 text-primary-600 focus:ring-primary-300',
    danger:
      'bg-error hover:bg-error-dark text-white shadow-sm focus:ring-error'
  };

  // 無効化・フォーカスクラス
  const stateClasses =
    'disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  // クラス適用
  button.className = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses}`;

  // アイコン + テキスト、またはテキストのみ
  if (loading) {
    const wrapper = document.createElement('span');
    wrapper.className = 'flex items-center gap-2';

    const iconElement = document.createElement('i');
    iconElement.setAttribute('data-lucide', 'loader-2');
    iconElement.className = 'h-4 w-4 animate-spin';

    const textElement = document.createElement('span');
    textElement.textContent = text;

    wrapper.appendChild(iconElement);
    wrapper.appendChild(textElement);
    button.appendChild(wrapper);
    button.disabled = true;
  } else if (icon && text) {
    const wrapper = document.createElement('span');
    wrapper.className = 'flex items-center gap-2';

    const iconElement = document.createElement('i');
    iconElement.setAttribute('data-lucide', icon);
    iconElement.className = 'h-4 w-4';

    const textElement = document.createElement('span');
    textElement.textContent = text;

    wrapper.appendChild(iconElement);
    wrapper.appendChild(textElement);
    button.appendChild(wrapper);
  } else if (icon) {
    const iconElement = document.createElement('i');
    iconElement.setAttribute('data-lucide', icon);
    iconElement.className = 'h-5 w-5';
    button.appendChild(iconElement);
    if (ariaLabel) {
      button.setAttribute('aria-label', ariaLabel);
    }
  } else {
    button.textContent = text;
  }

  // 無効化
  if (disabled) {
    button.disabled = true;
  }

  // クリックハンドラ
  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * アイコンボタンを作成
 * @param {Object} options - オプション
 * @param {string} options.icon - Lucide Icon名
 * @param {string} options.ariaLabel - aria-label（必須）
 * @param {Function} [options.onClick] - クリックハンドラ
 * @param {boolean} [options.disabled=false] - 無効化
 * @returns {HTMLButtonElement}
 */
export function createIconButton(options) {
  const { icon, ariaLabel, onClick, disabled = false } = options;

  const button = document.createElement('button');
  button.type = 'button';
  button.className =
    'h-8 w-8 bg-transparent hover:bg-neutral-100 active:bg-neutral-200 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

  const iconElement = document.createElement('i');
  iconElement.setAttribute('data-lucide', icon);
  iconElement.className = 'h-5 w-5 text-neutral-700';
  button.appendChild(iconElement);
  button.setAttribute('aria-label', ariaLabel);

  if (disabled) {
    button.disabled = true;
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * チェックボックスを作成
 * @param {Object} options - オプション
 * @param {string} [options.id] - input要素のID
 * @param {string} [options.name] - input要素のname
 * @param {boolean} [options.checked=false] - チェック状態
 * @param {boolean} [options.disabled=false] - 無効化
 * @param {Function} [options.onChange] - 変更ハンドラ
 * @param {string} [options.ariaLabel] - aria-label
 * @returns {HTMLInputElement}
 */
export function createCheckbox(options) {
  const {
    id,
    name,
    checked = false,
    disabled = false,
    onChange,
    ariaLabel
  } = options;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'h-5 w-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500';

  if (id) {
    checkbox.id = id;
  }
  if (name) {
    checkbox.name = name;
  }
  if (checked) {
    checkbox.checked = true;
  }
  if (disabled) {
    checkbox.disabled = true;
  }
  if (ariaLabel) {
    checkbox.setAttribute('aria-label', ariaLabel);
  }

  if (onChange) {
    checkbox.addEventListener('change', onChange);
  }

  return checkbox;
}

/**
 * プログレスバーを作成
 * @param {Object} options - オプション
 * @param {number} options.value - 進捗値（0-100）
 * @param {'default'|'success'|'error'} [options.variant='default'] - バリアント
 * @param {string} [options.ariaLabel='進捗'] - aria-label
 * @returns {HTMLDivElement}
 */
export function createProgressBar(options) {
  const {
    value,
    variant = 'default',
    ariaLabel = '進捗'
  } = options;

  // バリアントごとの色クラス
  const variantClasses = {
    default: {
      container: 'bg-neutral-200',
      fill: 'bg-primary-500'
    },
    success: {
      container: 'bg-success-light',
      fill: 'bg-success'
    },
    error: {
      container: 'bg-error-light',
      fill: 'bg-error'
    }
  };

  const colors = variantClasses[variant];

  // コンテナ
  const container = document.createElement('div');
  container.className = `w-full h-2 ${colors.container} rounded-full overflow-hidden`;

  // プログレスバー本体
  const fill = document.createElement('div');
  fill.className = `h-full ${colors.fill} rounded-full transition-all duration-300`;
  fill.style.width = `${Math.min(100, Math.max(0, value))}%`;
  fill.setAttribute('role', 'progressbar');
  fill.setAttribute('aria-valuenow', value.toString());
  fill.setAttribute('aria-valuemin', '0');
  fill.setAttribute('aria-valuemax', '100');
  fill.setAttribute('aria-label', ariaLabel);

  container.appendChild(fill);
  return container;
}

/**
 * バッジを作成
 * @param {Object} options - オプション
 * @param {string} options.text - バッジテキスト
 * @param {'default'|'success'|'warning'|'error'|'info'} [options.variant='default'] - バリアント
 * @param {'sm'|'md'} [options.size='sm'] - サイズ
 * @returns {HTMLSpanElement}
 */
export function createBadge(options) {
  const {
    text,
    variant = 'default',
    size = 'sm'
  } = options;

  const badge = document.createElement('span');

  // サイズクラス
  const sizeClasses = {
    sm: 'h-5 px-2 text-xs',
    md: 'h-6 px-3 text-sm'
  };

  // バリアントクラス
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-700',
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    error: 'bg-error-light text-error-dark',
    info: 'bg-info-light text-info-dark'
  };

  badge.className = `inline-flex items-center justify-center font-medium rounded ${sizeClasses[size]} ${variantClasses[variant]}`;
  badge.textContent = text;

  return badge;
}

/**
 * プログレスインジケーターを作成（プログレスバー + ステータステキスト）
 * @param {Object} options - オプション
 * @param {number} options.progress - 進捗値（0-100）
 * @param {string} [options.statusText] - ステータステキスト（例: "変換中... 0.8x"）
 * @param {string} [options.remainingTime] - 残り時間テキスト（例: "残り約1分20秒"）
 * @param {'default'|'success'|'error'} [options.variant='default'] - バリアント
 * @returns {HTMLDivElement}
 */
export function createProgressIndicator(options) {
  const {
    progress,
    statusText,
    remainingTime,
    variant = 'default'
  } = options;

  const container = document.createElement('div');
  container.className = 'mt-3 ml-8';

  // ステータステキスト行
  if (statusText || remainingTime) {
    const statusRow = document.createElement('div');
    statusRow.className = 'flex items-center justify-between text-sm text-neutral-600 mb-2';

    if (statusText) {
      const leftText = document.createElement('span');
      leftText.textContent = statusText;
      statusRow.appendChild(leftText);
    }

    if (remainingTime) {
      const rightText = document.createElement('span');
      rightText.textContent = remainingTime;
      statusRow.appendChild(rightText);
    }

    container.appendChild(statusRow);
  }

  // プログレスバー
  const progressBar = createProgressBar({ value: progress, variant });
  container.appendChild(progressBar);

  return container;
}

/**
 * 空の状態を作成
 * @param {Object} [options] - オプション
 * @param {string} [options.icon='folder-open'] - Lucide Icon名
 * @param {string} [options.title='メディアファイルが見つかりませんでした'] - タイトル
 * @param {string} [options.message='このページには動画・音声ファイルが検出されませんでした。別のページで試してください。'] - メッセージ
 * @returns {HTMLDivElement}
 */
export function createEmptyState(options = {}) {
  const {
    icon = 'folder-open',
    title = 'メディアファイルが見つかりませんでした',
    message = 'このページには動画・音声ファイルが検出されませんでした。別のページで試してください。'
  } = options;

  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center py-12 px-4';

  // アイコン
  const iconEl = document.createElement('i');
  iconEl.setAttribute('data-lucide', icon);
  iconEl.className = 'h-16 w-16 text-neutral-400 mb-4';
  container.appendChild(iconEl);

  // タイトル
  const titleEl = document.createElement('h3');
  titleEl.className = 'text-lg font-medium text-neutral-900 mb-2';
  titleEl.textContent = title;
  container.appendChild(titleEl);

  // メッセージ
  const messageEl = document.createElement('p');
  messageEl.className = 'text-sm text-neutral-600 text-center max-w-xs';
  messageEl.textContent = message;
  container.appendChild(messageEl);

  return container;
}

/**
 * 注意事項ボックスを作成
 * @param {Object} options - オプション
 * @param {string} [options.title='注意事項'] - タイトル
 * @param {string[]} options.items - 注意事項リスト
 * @param {'warning'|'info'|'error'} [options.variant='warning'] - バリアント
 * @returns {HTMLDivElement}
 */
export function createNoticeBox(options) {
  const {
    title = '注意事項',
    items,
    variant = 'warning'
  } = options;

  // バリアントごとの色とアイコン
  const variantConfig = {
    warning: {
      bg: 'bg-warning-light',
      border: 'border-warning',
      icon: 'alert-triangle',
      iconColor: 'text-warning-dark'
    },
    info: {
      bg: 'bg-info-light',
      border: 'border-info',
      icon: 'info',
      iconColor: 'text-info-dark'
    },
    error: {
      bg: 'bg-error-light',
      border: 'border-error',
      icon: 'alert-circle',
      iconColor: 'text-error-dark'
    }
  };

  const config = variantConfig[variant];

  const container = document.createElement('div');
  container.className = `px-4 py-3 ${config.bg} border-l-4 ${config.border}`;

  const innerContainer = document.createElement('div');
  innerContainer.className = 'flex items-start gap-3';

  // アイコン
  const iconEl = document.createElement('i');
  iconEl.setAttribute('data-lucide', config.icon);
  iconEl.className = `h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`;
  innerContainer.appendChild(iconEl);

  // コンテンツ
  const contentDiv = document.createElement('div');
  contentDiv.className = 'flex-1';

  // タイトル
  const titleEl = document.createElement('h4');
  titleEl.className = 'text-sm font-semibold text-neutral-900 mb-1';
  titleEl.textContent = title;
  contentDiv.appendChild(titleEl);

  // リスト
  const ul = document.createElement('ul');
  ul.className = 'text-xs text-neutral-700 space-y-1';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  contentDiv.appendChild(ul);

  innerContainer.appendChild(contentDiv);
  container.appendChild(innerContainer);

  return container;
}

/**
 * ヘッダーを作成
 * @param {Object} options - オプション
 * @param {Function} [options.onRescan] - 再スキャンボタンのクリックハンドラ
 * @returns {HTMLElement}
 */
export function createHeader(options = {}) {
  const { onRescan } = options;

  const header = document.createElement('header');
  header.className = 'flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white';

  // タイトル部分
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex items-center gap-2';

  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', 'film');
  icon.className = 'h-6 w-6 text-primary-500';
  titleDiv.appendChild(icon);

  const title = document.createElement('h1');
  title.className = 'text-xl font-semibold text-neutral-900';
  title.textContent = 'Media Extractor';
  titleDiv.appendChild(title);

  header.appendChild(titleDiv);

  // 再スキャンボタン
  const rescanBtn = document.createElement('button');
  rescanBtn.className = 'h-9 px-3 text-sm text-primary-600 hover:bg-primary-50 rounded-md flex items-center gap-2';

  const iconElement = document.createElement('i');
  iconElement.setAttribute('data-lucide', 'refresh-cw');
  iconElement.className = 'h-4 w-4';

  const textElement = document.createElement('span');
  textElement.textContent = '再スキャン';

  rescanBtn.appendChild(iconElement);
  rescanBtn.appendChild(textElement);

  if (onRescan) {
    rescanBtn.addEventListener('click', onRescan);
  }

  header.appendChild(rescanBtn);

  return header;
}

/**
 * 一括操作バーを作成
 * @param {Object} options - オプション
 * @param {Function} [options.onSelectAll] - すべて選択チェックボックスの変更ハンドラ
 * @param {Function} [options.onBulkDownload] - 一括動画ダウンロードボタンのクリックハンドラ
 * @param {Function} [options.onBulkExtract] - 一括音声抽出ボタンのクリックハンドラ
 * @param {boolean} [options.selectAllChecked=false] - すべて選択の初期状態
 * @returns {HTMLDivElement}
 */
export function createBulkActions(options = {}) {
  const {
    onSelectAll,
    onBulkDownload,
    onBulkExtract,
    selectAllChecked = false
  } = options;

  const container = document.createElement('div');
  container.className = 'px-4 py-3 border-b border-neutral-200 bg-neutral-50';

  // すべて選択
  const selectAllDiv = document.createElement('div');
  selectAllDiv.className = 'flex items-center gap-2 mb-3';

  const checkbox = createCheckbox({
    id: 'select-all',
    checked: selectAllChecked,
    onChange: onSelectAll
  });
  selectAllDiv.appendChild(checkbox);

  const label = document.createElement('label');
  label.htmlFor = 'select-all';
  label.className = 'text-sm font-medium text-neutral-700';
  label.textContent = 'すべて選択';
  selectAllDiv.appendChild(label);

  container.appendChild(selectAllDiv);

  // 一括操作ボタン
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'flex gap-2';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-md';
  downloadBtn.textContent = '選択した項目を動画ダウンロード';
  if (onBulkDownload) {
    downloadBtn.addEventListener('click', onBulkDownload);
  }
  buttonsDiv.appendChild(downloadBtn);

  const extractBtn = document.createElement('button');
  extractBtn.className = 'h-9 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md';
  extractBtn.textContent = '選択した項目を音声抽出';
  if (onBulkExtract) {
    extractBtn.addEventListener('click', onBulkExtract);
  }
  buttonsDiv.appendChild(extractBtn);

  container.appendChild(buttonsDiv);

  return container;
}

/**
 * メディアアイテムカードを作成
 * @param {Object} options - オプション
 * @param {string} options.id - アイテムID
 * @param {'video'|'audio'} options.type - メディアタイプ
 * @param {string} options.filename - ファイル名
 * @param {string} options.url - URL
 * @param {'detected'|'converting'|'completed'|'error'} [options.status='detected'] - 状態
 * @param {number} [options.progress] - 進捗（0-100）
 * @param {string} [options.statusText] - ステータステキスト
 * @param {string} [options.remainingTime] - 残り時間
 * @param {string} [options.errorMessage] - エラーメッセージ
 * @param {boolean} [options.checked=false] - チェック状態
 * @param {Function} [options.onCheckChange] - チェックボックス変更ハンドラ
 * @param {Function} [options.onEdit] - 編集ボタンクリックハンドラ
 * @param {Function} [options.onDownload] - ダウンロードボタンクリックハンドラ
 * @param {Function} [options.onExtract] - 音声抽出ボタンクリックハンドラ
 * @param {Function} [options.onCancel] - キャンセルボタンクリックハンドラ
 * @param {Function} [options.onRetry] - 再試行ボタンクリックハンドラ
 * @param {Function} [options.onDelete] - 削除ボタンクリックハンドラ
 * @returns {HTMLDivElement}
 */
export function createMediaItem(options) {
  const {
    id,
    type,
    filename,
    url,
    status = 'detected',
    progress,
    statusText,
    remainingTime,
    errorMessage,
    metadata,
    checked = false,
    onCheckChange,
    onEdit,
    onDownload,
    onExtract,
    onCancel,
    onRetry,
    onDelete
  } = options;

  const container = document.createElement('div');
  container.className = 'p-4 border border-neutral-200 rounded-lg bg-white hover:border-neutral-300 hover:shadow-sm transition-all duration-200';
  container.setAttribute('role', 'article');
  container.setAttribute('aria-label', filename);
  container.dataset.itemId = id;

  // ヘッダー行
  const headerDiv = document.createElement('div');
  headerDiv.className = 'flex items-start gap-3';

  // アイコン
  const iconDiv = document.createElement('div');
  iconDiv.className = 'mt-0.5';
  const iconName = status === 'completed' ? 'music' : type === 'video' ? 'video' : 'headphones';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', iconName);
  icon.className = 'h-5 w-5 text-neutral-600';
  iconDiv.appendChild(icon);
  headerDiv.appendChild(iconDiv);

  // タイトルとURL
  const titleDiv = document.createElement('div');
  titleDiv.className = 'flex-1 min-w-0';

  const title = document.createElement('h3');
  title.className = 'text-lg font-medium text-neutral-900 truncate';
  title.textContent = filename;
  titleDiv.appendChild(title);

  const urlEl = document.createElement('p');
  urlEl.className = 'text-sm text-neutral-500 font-mono truncate mt-1';
  urlEl.textContent = url;
  titleDiv.appendChild(urlEl);

  // メタデータ表示
  if (metadata) {
    const metadataDiv = document.createElement('div');
    metadataDiv.className = 'flex flex-wrap gap-3 mt-2 text-xs text-neutral-600';

    if (metadata.duration) {
      const durationSpan = document.createElement('span');
      durationSpan.className = 'flex items-center gap-1';
      const clockIcon = document.createElement('i');
      clockIcon.setAttribute('data-lucide', 'clock');
      clockIcon.className = 'h-3 w-3';
      durationSpan.appendChild(clockIcon);
      durationSpan.appendChild(document.createTextNode(metadata.duration));
      metadataDiv.appendChild(durationSpan);
    }

    if (metadata.size) {
      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'flex items-center gap-1';
      const fileIcon = document.createElement('i');
      fileIcon.setAttribute('data-lucide', 'file');
      fileIcon.className = 'h-3 w-3';
      sizeSpan.appendChild(fileIcon);
      sizeSpan.appendChild(document.createTextNode(metadata.size));
      metadataDiv.appendChild(sizeSpan);
    }

    if (metadata.codec) {
      const codecSpan = document.createElement('span');
      codecSpan.textContent = metadata.codec;
      metadataDiv.appendChild(codecSpan);
    }

    if (metadata.resolution) {
      const resolutionSpan = document.createElement('span');
      resolutionSpan.textContent = metadata.resolution;
      metadataDiv.appendChild(resolutionSpan);
    }

    titleDiv.appendChild(metadataDiv);
  }

  headerDiv.appendChild(titleDiv);

  // 編集ボタン（検出済み時のみ）
  if (status === 'detected' && onEdit) {
    const editBtn = document.createElement('button');
    editBtn.className = 'h-8 px-3 text-sm text-primary-600 hover:bg-primary-50 rounded-md';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', onEdit);
    headerDiv.appendChild(editBtn);
  }

  container.appendChild(headerDiv);

  // プレビュー（動画/音声の場合）
  // 直接再生可能なURLのみプレビュー表示
  const canPreview = url &&
    !url.startsWith('blob:') &&
    !url.includes('youtube.com') &&
    !url.includes('youtu.be') &&
    (type === 'video' || type === 'audio');

  if (canPreview) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'mt-3 rounded-lg overflow-hidden bg-neutral-100';

    if (type === 'video') {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.preload = 'metadata';
      video.className = 'w-full max-h-64 object-contain';
      video.setAttribute('controlsList', 'nodownload');
      video.setAttribute('crossorigin', 'anonymous');

      // エラーハンドリング（CORS等でプレビュー失敗時は非表示）
      video.addEventListener('error', () => {
        previewDiv.remove();
      });

      previewDiv.appendChild(video);
    } else if (type === 'audio') {
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = true;
      audio.preload = 'metadata';
      audio.className = 'w-full';
      audio.setAttribute('controlsList', 'nodownload');
      audio.setAttribute('crossorigin', 'anonymous');

      // エラーハンドリング
      audio.addEventListener('error', () => {
        previewDiv.remove();
      });

      previewDiv.appendChild(audio);
    }

    container.appendChild(previewDiv);
  }

  // アクションボタン（状態別）
  if (status === 'detected') {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex gap-2 mt-3 ml-8';

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-md';
    downloadBtn.textContent = '動画ダウンロード';
    if (onDownload) {
      downloadBtn.addEventListener('click', onDownload);
    }
    actionsDiv.appendChild(downloadBtn);

    const extractBtn = document.createElement('button');
    extractBtn.className = 'h-9 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-md';
    extractBtn.textContent = '音声抽出';
    if (onExtract) {
      extractBtn.addEventListener('click', onExtract);
    }
    actionsDiv.appendChild(extractBtn);

    container.appendChild(actionsDiv);
  } else if (status === 'converting') {
    // プログレスインジケーター
    if (progress !== undefined) {
      const indicator = createProgressIndicator({
        progress,
        statusText,
        remainingTime,
        variant: 'default'
      });
      container.appendChild(indicator);
    }

    // キャンセルボタン
    if (onCancel) {
      const cancelDiv = document.createElement('div');
      cancelDiv.className = 'mt-3 ml-8';
      const cancelBtn = createButton({
        variant: 'outline',
        size: 'sm',
        text: 'キャンセル',
        onClick: onCancel
      });
      cancelDiv.appendChild(cancelBtn);
      container.appendChild(cancelDiv);
    }
  } else if (status === 'completed') {
    // 完了ステータス
    const completedDiv = document.createElement('div');
    completedDiv.className = 'mt-3 ml-8 text-sm text-success-dark';
    completedDiv.textContent = statusText || '変換完了';
    container.appendChild(completedDiv);

    // ボタン
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex gap-2 mt-3 ml-8';

    const downloadBtn = createButton({
      variant: 'primary',
      size: 'sm',
      text: 'ダウンロード',
      icon: 'download',
      onClick: onDownload
    });
    actionsDiv.appendChild(downloadBtn);

    if (onDelete) {
      const deleteBtn = createButton({
        variant: 'danger',
        size: 'sm',
        text: '削除',
        icon: 'trash-2',
        onClick: onDelete
      });
      actionsDiv.appendChild(deleteBtn);
    }

    container.appendChild(actionsDiv);
  } else if (status === 'error') {
    // エラーメッセージ
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mt-3 ml-8 px-3 py-2 bg-error-light border-l-4 border-error rounded text-sm text-error-dark';
    errorDiv.textContent = errorMessage || 'エラーが発生しました';
    container.appendChild(errorDiv);

    // ボタン
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'flex gap-2 mt-3 ml-8';

    if (onRetry) {
      const retryBtn = createButton({
        variant: 'primary',
        size: 'sm',
        text: '再試行',
        icon: 'refresh-cw',
        onClick: onRetry
      });
      actionsDiv.appendChild(retryBtn);
    }

    if (onDelete) {
      const deleteBtn = createButton({
        variant: 'danger',
        size: 'sm',
        text: '削除',
        icon: 'trash-2',
        onClick: onDelete
      });
      actionsDiv.appendChild(deleteBtn);
    }

    container.appendChild(actionsDiv);
  }

  return container;
}

/**
 * メタデータ編集モーダルを作成
 * @param {Object} options - オプション
 * @param {Object} [options.metadata] - 初期メタデータ
 * @param {string} [options.metadata.title] - タイトル
 * @param {string} [options.metadata.artist] - アーティスト
 * @param {string} [options.metadata.album] - アルバム
 * @param {string} [options.metadata.year] - 年
 * @param {string} [options.metadata.genre] - ジャンル
 * @param {string} [options.metadata.comment] - コメント
 * @param {Function} [options.onClose] - 閉じるボタンクリックハンドラ
 * @param {Function} [options.onSave] - 保存ボタンクリックハンドラ
 * @returns {HTMLDivElement}
 */
export function createMetadataModal(options = {}) {
  const {
    metadata = {},
    onClose,
    onSave
  } = options;

  // オーバーレイ
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50';

  // モーダルコンテナ
  const modalContainer = document.createElement('div');
  modalContainer.className = 'fixed inset-0 flex items-center justify-center p-4';

  // モーダルコンテンツ
  const modal = document.createElement('div');
  modal.className = 'w-full max-w-md bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto animate-in fade-in duration-200';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');

  // ヘッダー
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between px-6 py-4 border-b border-neutral-200';

  const titleEl = document.createElement('h2');
  titleEl.id = 'modal-title';
  titleEl.className = 'text-xl font-semibold text-neutral-900';
  titleEl.textContent = 'メタデータ編集';
  header.appendChild(titleEl);

  const closeBtn = createIconButton({
    icon: 'x',
    ariaLabel: '閉じる',
    onClick: onClose
  });
  header.appendChild(closeBtn);

  modal.appendChild(header);

  // ボディ（フォーム）
  const body = document.createElement('div');
  body.className = 'px-6 py-4 space-y-4';

  const fields = [
    { name: 'title', label: 'タイトル', placeholder: '曲名・動画名' },
    { name: 'artist', label: 'アーティスト', placeholder: 'アーティスト名' },
    { name: 'album', label: 'アルバム', placeholder: 'アルバム名' },
    { name: 'year', label: '年', placeholder: '2024' },
    { name: 'genre', label: 'ジャンル', placeholder: 'ポップ' },
    { name: 'comment', label: 'コメント', placeholder: 'コメント' }
  ];

  fields.forEach(field => {
    const fieldDiv = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-neutral-700 mb-1';
    label.textContent = field.label;
    label.htmlFor = `metadata-${field.name}`;
    fieldDiv.appendChild(label);

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `metadata-${field.name}`;
    input.name = field.name;
    input.className = 'w-full h-10 px-3 border border-neutral-300 rounded-md text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
    input.placeholder = field.placeholder;
    input.value = metadata[field.name] || '';
    fieldDiv.appendChild(input);

    body.appendChild(fieldDiv);
  });

  modal.appendChild(body);

  // フッター
  const footer = document.createElement('div');
  footer.className = 'flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200';

  const cancelBtn = createButton({
    variant: 'outline',
    size: 'md',
    text: 'キャンセル',
    onClick: onClose
  });
  footer.appendChild(cancelBtn);

  const saveBtn = createButton({
    variant: 'primary',
    size: 'md',
    text: '保存',
    onClick: () => {
      if (onSave) {
        const formData = {};
        fields.forEach(field => {
          const input = modal.querySelector(`#metadata-${field.name}`);
          formData[field.name] = input.value;
        });
        onSave(formData);
      }
    }
  });
  footer.appendChild(saveBtn);

  modal.appendChild(footer);

  modalContainer.appendChild(modal);
  overlay.appendChild(modalContainer);

  // ESCキーで閉じる
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  });

  // オーバーレイクリックで閉じる
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && onClose) {
      onClose();
    }
  });

  return overlay;
}
