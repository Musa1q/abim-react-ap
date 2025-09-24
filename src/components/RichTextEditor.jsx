import { useState } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "İçerik yazın..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`border rounded-lg ${isFocused ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}`}>
      <div className="p-3 bg-gray-50 border-b text-sm text-gray-600">
        <strong>Not:</strong> Bu alan için HTML formatlaması kullanabilirsiniz. 
        Örnek: &lt;h1&gt;Başlık&lt;/h1&gt;, &lt;strong&gt;Kalın&lt;/strong&gt;, &lt;em&gt;İtalik&lt;/em&gt;, &lt;ul&gt;&lt;li&gt;Liste&lt;/li&gt;&lt;/ul&gt;
      </div>
      <textarea
        value={value || ''}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 focus:outline-none resize-none font-mono text-sm"
        style={{ 
          minHeight: '200px',
          direction: 'ltr',
          textAlign: 'left'
        }}
        dir="ltr"
      />
    </div>
  );
};

export default RichTextEditor;
