import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    alt?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    alt
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </Button>
                
                <img
                    src={imageUrl}
                    alt={alt || 'Expanded image'}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />
                
                {alt && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg">
                        <p className="text-sm">{alt}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
