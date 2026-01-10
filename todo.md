# Technical Issues

- [x] **CRITICAL: Credit ledger RLS policy blocking credit deductions**
  - Error: 403 when trying to INSERT into credit_ledger
  - Fixed: Added INSERT policy to allow users to manage their own credits
  - Solution: Run migration `004_fix_credit_ledger_rls.sql` in Supabase SQL Editor

- [x] **Credits not decreasing after generation**
  - FIXED! Credits now deduct properly after applying RLS migration

- [x] **Google OAuth + Email sign-in conflict**
  - Added error message to guide users to use Google sign-in if they registered via OAuth
  - Shows: "This email is registered with Google sign-in. Please use 'Sign in with Google' instead."

- [x] **Images persist after logout**
  - Fixed: Generation store now resets on logout
  - Uploaded images are cleared when user signs out

# UI/UX Improvements

- [x] Generate button disabled after failed generation
- [x] Add quality selector UI (Standard 1cr vs Studio 2cr)
- [x] Rename "Model" to "Person" throughout UI
- [x] Show user name/email under credits
- [x] Align email and Google sign-up buttons
- [x] Move "Save to Gallery" button to top corner with heart icon
- [ ] Add example person images to select from (avoid re-uploading)



we shoyld make math - how much is 1 image for us, and how much we will sell to the ppl - so we can convert credits - to tokens 

we should save the images ( the person images ) so the user dont have to upload the image or take photo of himself, but just pick a photo of his last photos, and that is. 

he can use new photo if he want. we have to make this handy 

ok , on mobile, Log out section shoyld get at the bottom. 
AT That same section we should show the email or the name username - whatever we have. 

on mobile when we enter into the library - we cant get back ( we need button or something to get back ) 
- [x] the loading of the image ( final image while getting the loading ) should go from blured to clear

