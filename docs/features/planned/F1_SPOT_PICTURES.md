# Feature 1: Spot Pictures

**Status**: 📋 **PLANNED**

**Goal**: Allow users to visualize spots before arriving with photos.

---

## 1.1 Data Model

```typescript
// src/spot/types.ts
interface SpotPicture {
  id: SpotPictureId;
  spotId: SpotId;
  source: PictureSource;
  url: string;
  thumbnailUrl?: string;
  uploadedBy?: UserId;
  createdAt: Date;
}

enum PictureSource {
  GoogleStreetView = "GoogleStreetView",
  UserUpload = "UserUpload",
}
```

---

## 1.2 Google Street View Integration

- [ ] Create `src/spot/services/streetViewService.ts`
- [ ] Fetch Street View Static API images based on spot coordinates
- [ ] Cache images locally for offline access
- [ ] Handle cases where Street View is unavailable

```typescript
// src/spot/services/streetViewService.ts
const STREET_VIEW_API = "https://maps.googleapis.com/maps/api/streetview";

export const getStreetViewUrl = (lat: number, lng: number): string => {
  return `${STREET_VIEW_API}?size=600x400&location=${lat},${lng}&key=${GOOGLE_API_KEY}`;
};

export const checkStreetViewAvailability = async (
  lat: number,
  lng: number
): Promise<boolean> => {
  // Use Street View Metadata API to check availability
};
```

---

## 1.3 User Photo Upload

- [ ] Create `SpotPhotoUploader` component
- [ ] Integrate `expo-image-picker` for camera/gallery access
- [ ] Implement image compression before upload
- [ ] Create `src/spot/services/imageUploadService.ts`
- [ ] Add photo moderation queue (flag inappropriate content)

---

## 1.4 UI Components

- [ ] Create `SpotGallery` component with horizontal scroll
- [ ] Add photo viewer modal with zoom/pan
- [ ] Show Street View badge vs User Photo badge
- [ ] Add "Add Photo" button in SpotDetailsSheet

---

## 1.5 Database Schema

```sql
CREATE TABLE IF NOT EXISTS spot_pictures (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id),
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);
```

---

## Implementation Checklist

- [ ] Add SpotPicture types to `src/spot/types.ts`
- [ ] Create spot_pictures database table
- [ ] Create `src/spot/services/streetViewService.ts`
- [ ] Implement Google Street View API integration
- [ ] Install expo-image-picker
- [ ] Create `SpotPhotoUploader` component
- [ ] Create `src/spot/services/imageUploadService.ts`
- [ ] Implement image compression
- [ ] Create `SpotGallery` component
- [ ] Create photo viewer modal with zoom/pan
- [ ] Add photo badges (Street View vs User Photo)
- [ ] Integrate into SpotDetailsSheet
- [ ] Add photo moderation queue

---

## Estimated Effort

**2 weeks**

**Priority**: 🟠 Medium (Phase 2: High-Value Features)
