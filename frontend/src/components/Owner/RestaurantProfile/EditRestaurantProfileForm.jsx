import React from "react";
import RestaurantPhotoGallerySection from "./PhotoGallery";
import OpeningHoursSection from "./EditOpeningHour";
import BookingRulesSection from "./EditBookingRule";

export default function EditRestaurantProfileForm({
                                                      form,
                                                      images,
                                                      loading,
                                                      status,
                                                      galleryStatus,
                                                      uploadingImages,
                                                      imageActionId,
                                                      onChange,
                                                      onRuleChange,
                                                      onHourChange,
                                                      onAutomaticSpendToggle,
                                                      onImageUpload,
                                                      onSetPrimaryImage,
                                                      onDeleteImage,
                                                      onSubmit,
                                                  }) {
    return (
        <div className="owner-profile-page">
            <form className="owner-profile-edit" onSubmit={onSubmit}>
                <div className="profile-header">
                    <div className="profile-header__content">
                        <input
                            className="profile-edit__title-input"
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            placeholder="Restaurant name"
                        />
                        <input
                            className="profile-edit__subtitle-input"
                            name="location"
                            value={form.location}
                            onChange={onChange}
                            placeholder="Location"
                        />
                    </div>
                </div>

                {loading && <p>Loading profile...</p>}
                {status && <p className="status">{status}</p>}

                {!loading && (
                    <>
                        <div className="profile-card">
                            <h3>Restaurant Info</h3>

                            <div className="profile-edit__stack">
                                <label className="profile-edit__field">
                                    <span>Description</span>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={onChange}
                                        placeholder="Add a short restaurant description"
                                    />
                                </label>

                                <label className="profile-edit__field">
                                    <span>Spend calculation</span>
                                    <div className="profile-edit__checkbox-row">
                                        <input
                                            id="automaticSpendCalculation"
                                            type="checkbox"
                                            checked={form.automaticSpendCalculation}
                                            onChange={onAutomaticSpendToggle}
                                        />
                                        <label htmlFor="automaticSpendCalculation">
                                            Calculate estimated spend automatically from the menu
                                        </label>
                                    </div>
                                </label>

                                <div className="profile-edit__grid">
                                    <label className="profile-edit__field">
                                        <span>Estimated spend min (£)</span>
                                        <input
                                            name="estimatedSpendMin"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.estimatedSpendMin}
                                            onChange={onChange}
                                            placeholder="e.g. 10"
                                            disabled={form.automaticSpendCalculation}
                                        />
                                    </label>

                                    <label className="profile-edit__field">
                                        <span>Estimated spend max (£)</span>
                                        <input
                                            name="estimatedSpendMax"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.estimatedSpendMax}
                                            onChange={onChange}
                                            placeholder="e.g. 18"
                                            disabled={form.automaticSpendCalculation}
                                        />
                                    </label>
                                </div>

                                <p className="profile-edit__hint">
                                    {form.automaticSpendCalculation
                                        ? "The system will calculate the spend range from active visible menu items."
                                        : "Turn off automatic calculation to enter your own spend range manually."}
                                </p>
                            </div>
                        </div>

                        <RestaurantPhotoGallerySection
                            formName={form.name}
                            images={images}
                            galleryStatus={galleryStatus}
                            uploadingImages={uploadingImages}
                            imageActionId={imageActionId}
                            onImageUpload={onImageUpload}
                            onSetPrimaryImage={onSetPrimaryImage}
                            onDeleteImage={onDeleteImage}
                        />

                        <OpeningHoursSection
                            openingHours={form.openingHours}
                            onHourChange={onHourChange}
                        />

                        <BookingRulesSection
                            bookingRule={form.bookingRule}
                            onRuleChange={onRuleChange}
                        />

                        <div className="profile-edit__actions">
                            <button
                                type="submit"
                                className="profile-header__edit"
                                disabled={loading}
                            >
                                Save Changes
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}