import React from "react";

interface LegalModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <div className="prose max-w-none text-gray-800" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
