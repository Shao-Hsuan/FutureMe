# 連結預覽功能使用指南

## 簡介

本文檔說明如何在FutureMe應用中使用連結預覽功能。此功能基於Peekalink API，可以為您的日誌和收藏頁面中的連結提供豐富的預覽效果。

## 環境設置

1. 請確保已在`.env.local`文件中添加Peekalink API密鑰：

```
VITE_PEEKALINK_API_KEY=您的API密鑰
```

2. 確保已安裝必要的依賴：

```bash
npm install axios
```

## 可用組件

### 1. LinkPreview

最基本的連結預覽組件，直接顯示連結的預覽卡片。

```tsx
import { LinkPreview } from '../components/LinkPreview';

// 在您的組件中
<LinkPreview url="https://example.com" />
```

#### 屬性

- `url` (必需): 要預覽的URL
- `className` (可選): 自定義CSS類名
- `onLoad` (可選): 預覽加載成功時的回調函數
- `onError` (可選): 預覽加載失敗時的回調函數

### 2. LinkPreviewEditor

適用於日誌編輯頁面的連結輸入和預覽組件。

```tsx
import { LinkPreviewEditor } from '../components/LinkPreview';

// 在您的組件中
<LinkPreviewEditor onLinkAdd={(url) => console.log('添加連結:', url)} />
```

#### 屬性

- `onLinkAdd` (可選): 用戶添加連結時的回調函數
- `className` (可選): 自定義CSS類名

### 3. LinkPreviewCard

適用於收藏頁面的連結卡片組件，可顯示自定義標題和描述。

```tsx
import { LinkPreviewCard } from '../components/LinkPreview';

// 在您的組件中
<LinkPreviewCard 
  url="https://example.com" 
  title="我的收藏網站" 
  onDelete={() => handleDelete(id)} 
/>
```

#### 屬性

- `url` (必需): 要預覽的URL
- `title` (可選): 自定義標題
- `description` (可選): 自定義描述
- `onDelete` (可選): 刪除按鈕點擊時的回調函數
- `className` (可選): 自定義CSS類名

## 在日誌編輯頁面中使用

在日誌編輯頁面中，您可以這樣整合連結預覽功能：

```tsx
import { LinkPreviewEditor, LinkPreview } from '../components/LinkPreview';

// 在編輯器工具欄中添加連結按鈕
function MyEditor() {
  const [currentLink, setCurrentLink] = useState('');
  
  const handleAddLink = (url) => {
    setCurrentLink(url);
    // 將連結添加到編輯器內容中
  };
  
  return (
    <div>
      {/* 編輯器工具欄 */}
      <div className="editor-toolbar">
        <button onClick={() => /* 顯示連結輸入UI */}>添加連結</button>
        {/* 其他工具按鈕 */}
      </div>
      
      {/* 連結輸入和預覽 */}
      <LinkPreviewEditor onLinkAdd={handleAddLink} />
      
      {/* 編輯器內容區域 */}
      <div className="editor-content">
        {/* 您的編輯器實現 */}
        
        {/* 如果要在內容中顯示連結預覽 */}
        {currentLink && <LinkPreview url={currentLink} />}
      </div>
    </div>
  );
}
```

## 在收藏頁面中使用

在收藏頁面中，您可以這樣使用連結卡片：

```tsx
import { LinkPreviewCard } from '../components/LinkPreview';

function MyCollectionPage() {
  const [savedLinks, setSavedLinks] = useState([
    { id: '1', url: 'https://example.com', title: '我的收藏' }
  ]);
  
  const handleDelete = (id) => {
    setSavedLinks(savedLinks.filter(link => link.id !== id));
  };
  
  return (
    <div className="collection-page">
      <h1>我的收藏</h1>
      
      <div className="links-grid">
        {savedLinks.map(link => (
          <LinkPreviewCard
            key={link.id}
            url={link.url}
            title={link.title}
            description={link.description}
            onDelete={() => handleDelete(link.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

## 使用linkService直接獲取預覽數據

如果您需要在自定義組件中使用連結預覽數據，可以直接使用linkService：

```tsx
import { getLinkPreview } from '../services/linkService';

async function fetchPreview(url) {
  const previewData = await getLinkPreview(url);
  
  if (previewData) {
    console.log('預覽標題:', previewData.title);
    console.log('預覽描述:', previewData.description);
    console.log('預覽圖片:', previewData.image?.medium?.url);
  }
}
```

## 範例頁面

查看`src/examples/LinkPreviewExample.tsx`文件，了解完整的使用範例。

## 緩存機制

為了提高性能，連結預覽數據會被緩存24小時。如果需要刷新緩存，可以：

```tsx
import { getLinkPreview, clearLinkPreviewCache } from '../services/linkService';

// 強制刷新特定URL的緩存
const freshData = await getLinkPreview(url, true);

// 清除特定URL的緩存
clearLinkPreviewCache(url);

// 清除所有緩存
clearLinkPreviewCache();
```
