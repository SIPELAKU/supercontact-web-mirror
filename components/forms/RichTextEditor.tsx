// Simple Rich Text Editor Component
"use client";

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  label?: string;
  hasError?: boolean;
}

const RichTextEditor = ({ content, onUpdate, label, hasError }: RichTextEditorProps) => {
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    onUpdate(newContent);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1, color: hasError ? 'error.main' : 'text.secondary' }}>
          {label}
        </Typography>
      )}
      <textarea
        value={localContent}
        onChange={handleChange}
        style={{
          width: '100%',
          minHeight: '300px',
          padding: '12px',
          fontSize: '14px',
          fontFamily: 'monospace',
          border: hasError ? '1px solid #d32f2f' : '1px solid #ccc',
          borderRadius: '4px',
          resize: 'vertical',
        }}
        placeholder="Enter HTML content here..."
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        You can use HTML tags and merge fields like {'{{ contact.first_name }}'}, {'{{ contact.email }}'}, etc.
      </Typography>
    </Box>
  );
};

export default RichTextEditor;
