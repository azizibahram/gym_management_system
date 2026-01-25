import { CloudUpload, Delete } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

interface PhotoUploaderProps {
    onPhotoChange: (file: File | null) => void;
    currentPhoto?: string | null;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoChange, currentPhoto }) => {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onPhotoChange(file);
        } else {
            alert('Please upload an image file');
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onPhotoChange(null);
    };

    return (
        <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#667eea' }}>
                Athlete Photo
            </Typography>

            {preview ? (
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 300,
                        mx: 'auto',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    }}
                >
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                        }}
                    />
                    <IconButton
                        onClick={handleRemove}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(244, 67, 54, 0.9)',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#f44336',
                            },
                        }}
                    >
                        <Delete />
                    </IconButton>
                </Box>
            ) : (
                <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                        border: isDragging ? '3px dashed #667eea' : '2px dashed #ccc',
                        borderRadius: 3,
                        p: 4,
                        textAlign: 'center',
                        backgroundColor: isDragging ? 'rgba(102, 126, 234, 0.05)' : '#f9f9f9',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        },
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                        id="photo-upload"
                    />
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                        <CloudUpload
                            sx={{
                                fontSize: 64,
                                color: isDragging ? '#667eea' : '#ccc',
                                mb: 2,
                                transition: 'color 0.3s ease',
                            }}
                        />
                        <Typography variant="h6" sx={{ mb: 1, color: '#667eea', fontWeight: 600 }}>
                            {isDragging ? 'Drop photo here' : 'Upload Photo'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Drag and drop or click to browse
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Supported formats: JPG, PNG, GIF
                        </Typography>
                    </label>
                </Box>
            )}
        </Box>
    );
};

export default PhotoUploader;
