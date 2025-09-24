import React, { useState, useRef } from 'react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaQuoteLeft, FaLink } from 'react-icons/fa';

const RichTextEditor = ({ value, onChange, placeholder = "İçerik yazın..." }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const insertTag = (openTag, closeTag) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end);
    
    onChange(newText);
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, end + openTag.length);
    }, 0);
  };

  const insertHeader = (level) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let selectedText = value.substring(start, end);
    
    // Eğer metin seçili değilse, placeholder metin ekle
    if (!selectedText.trim()) {
      selectedText = `Başlık ${level}`;
    }
    
    const newText = value.substring(0, start) + `<h${level}>${selectedText}</h${level}>` + value.substring(end);
    
    onChange(newText);
    
    // Focus ve cursor pozisyonunu ayarla
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newStart = start + `<h${level}>`.length;
        const newEnd = newStart + selectedText.length;
        textarea.setSelectionRange(newStart, newEnd);
      }
    }, 50);
  };

  const insertLineBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + '<br><br>' + value.substring(start);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 8, start + 8);
    }, 0);
  };

  const insertList = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    let selectedText = value.substring(start, end);
    
    // Eğer metin seçili değilse, placeholder metin ekle
    if (!selectedText.trim()) {
      selectedText = 'Liste öğesi';
    }
    
    const listTag = type === 'ul' ? 'ul' : 'ol';
    const newText = value.substring(0, start) + `<${listTag}><li>${selectedText}</li></${listTag}>` + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newStart = start + `<${listTag}><li>`.length;
      const newEnd = newStart + selectedText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }, 50);
  };

  return (
    <div className={`border rounded-lg ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
      {/* Toolbar */}
      <div className="p-3 bg-gray-50 border-b flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => insertTag('<strong>', '</strong>')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Kalın"
        >
          <FaBold />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<em>', '</em>')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="İtalik"
        >
          <FaItalic />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<u>', '</u>')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Altı Çizili"
        >
          <FaUnderline />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => insertHeader(1)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Başlık 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertHeader(2)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Başlık 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertHeader(3)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Başlık 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => insertList('ul')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Madde Listesi"
        >
          <FaListUl />
        </button>
        <button
          type="button"
          onClick={() => insertList('ol')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Sıralı Liste"
        >
          <FaListOl />
        </button>
        <button
          type="button"
          onClick={() => insertTag('<blockquote>', '</blockquote>')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Alıntı"
        >
          <FaQuoteLeft />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={insertLineBreak}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Satır Atla"
        >
          Satır Atla
        </button>
      </div>

      {/* Textarea */}
      <div className="p-3">
        <div className="text-sm text-gray-600 mb-2">
          <strong>Kullanım:</strong> Metni seçin ve yukarıdaki butonları kullanın veya HTML kodları yazın.
        </div>
        <textarea
          ref={textareaRef}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full min-h-[300px] p-4 focus:outline-none resize-none font-mono text-sm whitespace-pre-wrap border border-gray-200 rounded"
          style={{ 
            minHeight: '300px',
            direction: 'ltr',
            textAlign: 'left'
          }}
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
