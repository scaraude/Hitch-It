# Feature 9: Community Section

**Status**: 📋 **PLANNED**

**Goal**: Build a hitchhiker community with advice, stories, and chat.

---

## 9.1 Sections

```
Community
├── 💡 Conseils (Tips)
│   ├── Pour débutants
│   ├── Équipement
│   ├── Sécurité
│   └── Par région
├── 💬 Forum
│   ├── Questions
│   ├── Récits de voyage
│   └── Rencontres
├── 📖 Histoires (Stories)
│   └── User-submitted travel stories
└── 🗺️ Guides régionaux
    └── Community-written area guides
```

---

## 9.2 Data Model

```typescript
// src/community/types.ts
interface Post {
  id: PostId;
  type: PostType;
  title: string;
  content: string;
  authorId: UserId;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  commentCount: number;
  isPinned: boolean;
}

enum PostType {
  Tip = "Tip",
  Question = "Question",
  Story = "Story",
  Guide = "Guide",
}
```

---

## 9.3 Features

- [ ] Browse/search posts by category
- [ ] Create posts (markdown support)
- [ ] Comment and like system
- [ ] Report inappropriate content
- [ ] Moderation queue
- [ ] Push notifications for replies

---

## 9.4 Moderation

- [ ] Community guidelines
- [ ] Report system
- [ ] Moderator roles
- [ ] Auto-flag suspicious content
- [ ] Ban system for repeat offenders

---

## Implementation Checklist

- [ ] Create `src/community/` feature module
- [ ] Define Post, Comment data models
- [ ] Create posts database table
- [ ] Create comments database table
- [ ] Create post_likes database table
- [ ] Build community navigation structure
- [ ] Create post browsing/search UI
- [ ] Implement post creation with markdown
- [ ] Build comment and like system
- [ ] Implement report system
- [ ] Create moderation queue
- [ ] Add push notifications for replies
- [ ] Define community guidelines
- [ ] Implement moderator roles
- [ ] Add auto-flag suspicious content
- [ ] Implement ban system

---

## Estimated Effort

**4 weeks**

**Priority**: 🟡 Lower (Phase 3: Advanced Features)

**Dependencies**: Backend infrastructure, moderation system
