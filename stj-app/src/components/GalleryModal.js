import React from 'react';
import PropTypes from 'prop-types';

const GalleryModal = ({ isOpen, onClose, images }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-lg font-semibold">Gallery</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        &times;
                    </button>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <img key={index} src={image.src} alt={image.alt} className="w-full h-auto rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
};

GalleryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    images: PropTypes.arrayOf(
        PropTypes.shape({
            src: PropTypes.string.isRequired,
            alt: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default GalleryModal;