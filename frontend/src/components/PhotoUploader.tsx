import { CameraAlt, CloudUpload, Delete } from '@mui/icons-material';
import { Box, Fade, IconButton, Typography, Zoom } from '@mui/material';
import React, { useCallback, useState } from 'react';

interface PhotoUploaderProps {
    onPhotoChange: (file: File | null) => void;
    currentPhoto?: string | null;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoChange, currentPhoto }) => {
    const [preview, setPreview] = useState<string | null>(currentPhoto || null);
    const [isDragging, setIsDragging] = useState(false);
    const [hovered, setHovered] = useState(false);

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

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };



    const handleRemove = () => {
        setPreview(null);
        onPhotoChange(null);
    };

    return (
        <Box sx={{ my: 2 }}>
            <Typography 
                variant="subtitle2" 
                sx={{ 
                    mb: 2, 
                    fontWeight: 700, 
                    color: '#6366f1',
                    textAlign: 'center',
                }}
            >
                Athlete Photo
            </Typography>

            {preview ? (
                <Zoom in={true} timeout={300}>
                    <Box
                        sx={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: 280,
                            mx: 'auto',
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
                            },
                        }}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                transition: 'transform 0.3s ease',
                                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                            }}
                        />
                        <Fade in={hovered}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <IconButton
                                    onClick={handleRemove}
                                    sx={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                        color: 'white',
                                        width: 56,
                                        height: 56,
                                        '&:hover': {
                                            backgroundColor: '#ef4444',
                                            transform: 'scale(1.1)',
                                        },
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                                    }}
                                >
                                    <Delete sx={{ fontSize: 28 }} />
                                </IconButton>
                            </Box>
                        </Fade>
                        
                        <IconButton
                            onClick={handleRemove}
                            sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                color: 'white',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                    backgroundColor: '#ef4444',
                                    transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                            }}
                        >
                            <Delete />
                        </IconButton>
                    </Box>
                </Zoom>
            ) : (
                <Zoom in={true} timeout={300}>
                    <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                            border: isDragging ? '3px dashed #6366f1' : '2px dashed #cbd5e1',
                            borderRadius: 4,
                            p: 5,
                            textAlign: 'center',
                            backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            maxWidth: 320,
                            mx: 'auto',
                            '&:hover': {
                                borderColor: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.15)',
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
                        <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'block' }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: isDragging 
                                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                                        : 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    transition: 'all 0.3s ease',
                                    boxShadow: isDragging 
                                        ? '0 8px 25px rgba(99, 102, 241, 0.4)' 
                                        : '0 4px 15px rgba(0,0,0,0.05)',
                                }}
                            >
                                {isDragging ? (
                                    <CloudUpload sx={{ fontSize: 40, color: 'white' }} />
                                ) : (
                                    <CameraAlt sx={{ fontSize: 36, color: '#6366f1' }} />
                                )}
                            </Box>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 1, 
                                    color: isDragging ? '#6366f1' : '#1e293b', 
                                    fontWeight: 700,
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                {isDragging ? 'Drop photo here' : 'Upload Photo'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Drag and drop or click to browse
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Supported formats: JPG, PNG, GIF
                            </Typography>
                        </label>
                    </Box>
                </Zoom>
            )}
        </Box>
    );
};

export default PhotoUploader;
