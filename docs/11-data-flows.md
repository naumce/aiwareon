# 11 - Data Flow Diagrams

## Authentication Flow

### Login Flow
```
1. User enters email/password on AuthPage
2. authStore.signInWithEmail(email, password) called
3. supabase.auth.signInWithPassword({ email, password })
4. Supabase validates credentials
5. Session JWT returned
6. authStore.setSession(session) updates state
7. isGuest = false, userId populated
8. User redirected to /dashboard (manual navigation)
```

### OAuth Flow
```
1. User clicks "Continue with Google"
2. authStore.signInWithGoogle() called
3. supabase.auth.signInWithOAuth({ provider: 'google' })
4. Redirect to Google consent screen
5. User approves
6. Redirect back to app with code
7. Supabase exchanges code for session
8. onAuthStateChange fires
9. authStore.setSession(session)
```

### Signup Flow
```
1. User enters email/password
2. authStore.signUpWithEmail(email, password)
3. supabase.auth.signUp({ email, password })
4. If email confirmation required:
   - User sees "Check your email" message
   - User clicks confirmation link
   - on_auth_user_created trigger fires
   - profiles row created with 10 credits
5. If auto-confirmed:
   - Session returned immediately
   - Trigger still fires
```

---

## Virtual Try-On Generation Flow

```
1. User uploads reference photo (base64 in studioStore.userPhoto)
2. User uploads garment photo (base64 in studioStore.garmentPhoto)
3. User selects quality (standard/studio) and pose
4. User clicks "Generate Try-On"
5. StudioPage.handleGenerate():
   a. setStatus({ isProcessing: true })
   b. Display "Analyzing garments..." UI
6. virtualTryOn(userPhoto, garmentPhoto, pose, quality) called
7. geminiService:
   a. Resize images to max dimension (640-2048px)
   b. Extract base64 data
   c. Call Gemini API with prompt + images
   d. Wait for response
   e. Extract inlineData from response
   f. Convert to base64 PNG string
8. Return to handleGenerate()
9. setComposite(resultBase64)
10. addToHistory(resultBase64)
11. setStatus({ isProcessing: false })
12. Showcase panel displays result
```

---

## Credit Deduction Flow

```
1. (Incomplete in current code - deduction not called in StudioPage)

EXPECTED FLOW:
1. Before generation starts
2. Check studioStore.getCost() (1 or 2)
3. creditStore.deduct(userId, cost)
4. supabase.rpc('deduct_credits', { amount_to_deduct: cost })
5. PostgreSQL function:
   a. Verify auth.uid() exists
   b. Check credits >= amount
   c. UPDATE profiles SET credits = credits - amount
   d. If rows affected = 0 → raise 'Insufficient credits'
6. If error → show error, abort generation
7. If success → proceed with generation
```

---

## Media Upload Flow

```
1. After generation complete on ResultPage
2. User clicks "Save to Library"
3. mediaService.uploadMedia({
     userId,
     kind: 'image',
     dataUrl: compositeBase64
   })
4. Convert dataUrl → Blob
5. Generate object path: {userId}/image/{timestamp}.png
6. supabase.storage.from('aiwear-media').upload(path, blob)
7. supabase.from('media_items').insert({ user_id, kind, bucket_id, object_path })
8. Return MediaItem with id
```

---

## Media Retrieval Flow

```
1. LibraryPage mounts
2. useEffect calls loadMedia()
3. mediaService.listMyMedia(limit, offset)
4. supabase.from('media_items')
     .select('id, kind, bucket_id, object_path, created_at')
     .order('created_at', { ascending: false })
     .range(offset, offset + limit - 1)
5. RLS ensures only user's rows returned
6. For each item, createSignedMediaUrl() on display
7. supabase.storage.from(bucket_id).createSignedUrl(path, 3600)
8. Signed URL valid for 1 hour
```

---

## Guest Mode Flow

```
1. User visits app without logging in
2. App.tsx: initGuestShots() called
3. creditStore reads localStorage.aiwear_guest_shots_left
4. If not set → default to 2
5. User uploads images and clicks generate
6. (Incomplete in code - but expected:)
7. creditStore.useGuestShot()
8. If guestShotsLeft > 0 → decrement, allow generation
9. If guestShotsLeft === 0 → prompt login/signup
```

---

## Saved Models Flow

```
1. User uploads reference photo
2. Clicks "Save to Models" (on ImageUpload)
3. SaveModelDialog opens
4. User enters name
5. modelStore.saveModel(name, imageBase64)
6. compressImage() reduces to max 800px, JPEG 0.7
7. localStorage.setItem('aiwear_saved_models', JSON.stringify([...models, newModel]))
8. On next visit, modelStore.loadModels() reads from localStorage
9. SavedModels component displays gallery
10. Click model → studioStore.setUserPhoto(model.image)
```
