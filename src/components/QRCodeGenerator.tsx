'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCodeDownloader(props: { url: string }) {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if(props?.url) {
      setUrl(props.url)
    }
  }, [props.url])

  const generateAndDownload = async () => {
    if (!url) return;

    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(url);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qrcode.png';
      a.click();
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-md">
      {/* <h1 className="text-xl mb-4 font-bold">QR Code Generator</h1> */}
      {/* <input
        type="text"
        placeholder="Enter URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border border-gray-300 p-2 w-full mb-4 rounded"
      /> */}
      <button
        onClick={generateAndDownload}
        disabled={isGenerating}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isGenerating ? 'Generating...' : 'Download QR Code'}
      </button>
    </div>
  );
}
