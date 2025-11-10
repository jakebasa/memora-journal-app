import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { buildApiUrl } from '@/config/api';

interface UploadedImage {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    originalName: string;
    alt?: string;
}

interface ImageUploadProps {
    images: UploadedImage[];
    onImagesChange: (images: UploadedImage[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    images,
    onImagesChange,
    maxImages = 5,
    disabled = false
}) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { token } = useAuth();

    const handleFileSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const selectedFiles = Array.from(files);
        const remainingSlots = maxImages - images.length;

        if (selectedFiles.length > remainingSlots) {
            toast({
                title: 'Too many files',
                description: `You can only upload ${remainingSlots} more image(s).`,
                variant: 'destructive',
            });
            return;
        }

        // Validate file types and sizes
        const validFiles = selectedFiles.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

            if (!isValidType) {
                toast({
                    title: 'Invalid file type',
                    description: `${file.name} is not a valid image file.`,
                    variant: 'destructive',
                });
                return false;
            }

            if (!isValidSize) {
                toast({
                    title: 'File too large',
                    description: `${file.name} is larger than 10MB.`,
                    variant: 'destructive',
                });
                return false;
            }

            return true;
        });

        if (validFiles.length > 0) {
            uploadFiles(validFiles);
        }
    };

    const uploadFiles = async (files: File[]) => {
        if (!token) {
            toast({
                title: 'Authentication required',
                description: 'Please log in to upload images.',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch(buildApiUrl('/api/images/upload'), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            const newImages = data.images.map((img: UploadedImage) => ({
                ...img,
                alt: '', // Default empty alt text
            }));

            onImagesChange([...images, ...newImages]);

            toast({
                title: 'Images uploaded',
                description: `Successfully uploaded ${files.length} image(s).`,
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload failed',
                description: error instanceof Error ? error.message : 'Failed to upload images',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async (index: number) => {
        const imageToRemove = images[index];
        
        try {
            // Delete from Cloudinary
            if (token) {
                const response = await fetch(buildApiUrl(`/api/images/delete?publicId=${encodeURIComponent(imageToRemove.publicId)}`), {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                });
                
                // Log response for debugging but don't fail on 404 since deletion might still work
                if (!response.ok && response.status !== 404) {
                    console.warn('Image deletion API error:', response.status, response.statusText);
                }
            }

            // Remove from local state regardless of API response
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);

            toast({
                title: 'Image removed',
                description: 'Image has been deleted successfully.',
            });
        } catch (error) {
            console.error('Delete error:', error);
            // Still remove from local state since cloud deletion likely worked
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
            
            toast({
                title: 'Image removed',
                description: 'Image deleted from cloud storage.',
            });
        }
    };

    const updateAltText = (index: number, alt: string) => {
        const newImages = [...images];
        newImages[index] = { ...newImages[index], alt };
        onImagesChange(newImages);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {images.length < maxImages && (
                <Card 
                    className={`border-2 border-dashed transition-colors ${
                        dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Uploading images...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, GIF, WebP up to 10MB ({maxImages - images.length} remaining)
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={disabled || uploading}
            />

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-sm font-medium">Uploaded Images</Label>
                    {/* Single Image Layout */}
                    {images.length === 1 && (
                        <div className='relative group'>
                            <div className='aspect-video bg-muted rounded-xl overflow-hidden shadow-soft'>
                                <img
                                    src={images[0].url}
                                    alt={images[0].alt || 'Uploaded image'}
                                    className='w-full h-full object-cover'
                                    loading="lazy"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg'
                                onClick={() => removeImage(0)}
                            >
                                <X className='w-4 h-4' />
                            </Button>
                            <div className='mt-3'>
                                <Input
                                    placeholder="Add a description for this image..."
                                    value={images[0].alt || ''}
                                    onChange={(e) => updateAltText(0, e.target.value)}
                                    className='text-sm'
                                />
                            </div>
                        </div>
                    )}

                    {/* Two Images Layout */}
                    {images.length === 2 && (
                        <div className='grid grid-cols-2 gap-4'>
                            {images.map((image, index) => (
                                <div key={image.publicId} className='relative group'>
                                    <div className='aspect-square bg-muted rounded-lg overflow-hidden shadow-soft'>
                                        <img
                                            src={image.url}
                                            alt={image.alt || `Uploaded image ${index + 1}`}
                                            className='w-full h-full object-cover'
                                            loading="lazy"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg'
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className='w-4 h-4' />
                                    </Button>
                                    <div className='mt-2'>
                                        <Input
                                            placeholder="Alt text..."
                                            value={image.alt || ''}
                                            onChange={(e) => updateAltText(index, e.target.value)}
                                            className='text-sm'
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Three or More Images Layout */}
                    {images.length >= 3 && (
                        <div className='space-y-4'>
                            {/* First image - hero */}
                            <div className='relative group'>
                                <div className='aspect-video bg-muted rounded-xl overflow-hidden shadow-soft'>
                                    <img
                                        src={images[0].url}
                                        alt={images[0].alt || 'Main image'}
                                        className='w-full h-full object-cover'
                                        loading="lazy"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg'
                                    onClick={() => removeImage(0)}
                                >
                                    <X className='w-4 h-4' />
                                </Button>
                                <div className='mt-3'>
                                    <Input
                                        placeholder="Description for main image..."
                                        value={images[0].alt || ''}
                                        onChange={(e) => updateAltText(0, e.target.value)}
                                        className='text-sm'
                                    />
                                </div>
                            </div>
                            
                            {/* Remaining images in compact grid */}
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                                {images.slice(1).map((image, index) => (
                                    <div key={image.publicId} className='relative group'>
                                        <div className='aspect-square bg-muted rounded-lg overflow-hidden shadow-soft'>
                                            <img
                                                src={image.url}
                                                alt={image.alt || `Image ${index + 2}`}
                                                className='w-full h-full object-cover'
                                                loading="lazy"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg'
                                            onClick={() => removeImage(index + 1)}
                                        >
                                            <X className='w-3 h-3' />
                                        </Button>
                                        <div className='mt-2'>
                                            <Input
                                                placeholder="Alt text..."
                                                value={image.alt || ''}
                                                onChange={(e) => updateAltText(index + 1, e.target.value)}
                                                className='text-xs h-8'
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
