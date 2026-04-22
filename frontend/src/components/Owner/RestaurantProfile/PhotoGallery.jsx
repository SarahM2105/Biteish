import React from "react";

export default function RestaurantPhotoGallerySection({
                                                          formName,
                                                          images,
                                                          galleryStatus,
                                                          uploadingImages,
                                                          imageActionId,
                                                          onImageUpload,
                                                          onSetPrimaryImage,
                                                          onDeleteImage,
                                                      }) {
    return (
        <div className="profile-card">
            <div className="profile-gallery">
                <div className="profile-gallery__header">
                    <div className="profile-gallery__header-copy">
                        <h3>Restaurant Photos</h3>
                        <p>
                            Upload photos to showcase your restaurant.
                            The primary image will be used as the main preview.
                        </p>
                    </div>
                </div>

                <div className="profile-gallery__upload">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onImageUpload}
                        disabled={uploadingImages}
                    />
                    <p className="profile-gallery__upload-hint">
                        {uploadingImages
                            ? "Uploading images..."
                            : "You can upload up to 8 images at a time. JPG, PNG, and other image files are supported."}
                    </p>
                </div>

                {galleryStatus ? (
                    <p className="profile-edit__hint">{galleryStatus}</p>
                ) : null}

                {images.length > 0 ? (
                    <div className="profile-gallery__grid">
                        {images.map((image, index) => {
                            const busy = imageActionId === image.id;

                            return (
                                <div
                                    key={image.id}
                                    className="profile-gallery__card"
                                >
                                    <div className="profile-gallery__media">
                                        <img
                                            src={image.imageUrl}
                                            alt={
                                                image.altText ||
                                                `${formName || "Restaurant"} image ${index + 1}`
                                            }
                                            className="profile-gallery__image"
                                        />

                                        {image.isPrimary ? (
                                            <span className="profile-gallery__primary-badge">
                                                Primary
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="profile-gallery__meta">
                                        <strong>
                                            {image.isPrimary
                                                ? "Main restaurant image"
                                                : `Gallery image ${index + 1}`}
                                        </strong>
                                        <span>
                                            {image.altText ||
                                                "No image description added yet."}
                                        </span>
                                    </div>

                                    <div className="profile-gallery__actions">
                                        {!image.isPrimary ? (
                                            <button
                                                type="button"
                                                className="profile-gallery__button profile-gallery__button--primary"
                                                onClick={() => onSetPrimaryImage(image.id)}
                                                disabled={busy || uploadingImages}
                                            >
                                                {busy ? "Updating..." : "Set as primary"}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="profile-gallery__button profile-gallery__button--secondary"
                                                disabled
                                            >
                                                Primary image
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="profile-gallery__button profile-gallery__button--danger"
                                            onClick={() => onDeleteImage(image.id)}
                                            disabled={busy || uploadingImages}
                                        >
                                            {busy ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="profile-gallery__empty">
                        No restaurant photos yet. Upload a few images to make
                        your restaurant page feel more complete.
                    </div>
                )}
            </div>
        </div>
    );
}