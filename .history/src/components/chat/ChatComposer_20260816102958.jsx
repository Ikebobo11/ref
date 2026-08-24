/**
 * LETCON - ChatComposer Component
 * Reusable message input with file attachment support.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPaperclip, FaXmark, FaFile, FaPaperPlane } from 'react-icons/fa6';
import Button from '../ui/Button';

/**
 * ChatComposer component.
 * @param {Object} props - Component props.
 * @param {Function} props.onSend - Send callback (content, attachment).
 * @param {boolean} [props.disabled] - Disable the composer.
 * @param {string} [props.placeholder] - Input placeholder.
 * @param {string} [props.sendingLabel] - Label while sending.
 */
export default function ChatComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  sendingLabel = 'Sending...',
}) {
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [sending, setSending] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 25MB.');
      e.target.value = '';
      return;
    }
    setAttachment(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if ((!content.trim() && !attachment) || sending) return;
    setSending(true);
    try {
      await onSend(content.trim(), attachment);
      setContent('');
      setAttachment(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-composer">
      {attachment && (
        <div className="chat-composer-attachment">
          <FaFile className="chat-composer-attachment-icon" />
          <div className="chat-composer-attachment-info">
            <span className="chat-composer-attachment-name">{attachment.name}</span>
            <span className="chat-composer-attachment-size">
              {(attachment.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <button
            type="button"
            className="chat-composer-attachment-remove"
            onClick={() => setAttachment(null)}
            aria-label="Remove attachment"
          >
            <FaXmark />
          </button>
        </div>
      )}
      <div className="chat-composer-input-row">
        <input
          type="file"
          id="chat-file-input"
          className="chat-file-input"
          onChange={handleFileSelect}
          hidden
        />
        <button
          type="button"
          className="chat-attach-btn"
          onClick={() => document.getElementById('chat-file-input')?.click()}
          disabled={disabled || sending}
          aria-label="Attach file"
        >
          <FaPaperclip />
        </button>
        <input
          type="text"
          className="chat-input"
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={disabled || sending}
        />
        <Button
          className="chat-send-btn"
          onClick={handleSend}
          loading={sending}
          disabled={disabled || (!content.trim() && !attachment)}
        >
          {sending ? <span>{sendingLabel}</span> : <FaPaperPlane />}
        </Button>
      </div>
    </div>
  );
}
