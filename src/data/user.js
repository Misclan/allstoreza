const userProfile = {
  _id: 'user_987654321',
  createdAt: '2026-06-07T16:20:00Z',
  onboardingType: 'personal',
  profile: { heightCm: 170, weightKg: 62, baseTopSize: 'S', baseBottomSize: '32' },
  // Full-body African woman, plain background, standing pose
  // NOTE: For production, host your own model photo on S3 for full control
  // Upload via the camera icon in the app to override this default
  avatarCanvasUrl: 'https://allstoreza.s3.us-east-1.amazonaws.com/assets/fullbodi.png',
};
export default userProfile;
