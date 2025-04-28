// TODO: Migrate this script to use backend REST API for user creation.



export const createDefaultDoctor = async () => {
  const auth = getAuth();
  
  try {
    // Create doctor account
    const doctorCredential = await createUserWithEmailAndPassword(
      auth,
      'doctor@hospital.com',
      'Doctor@123'
    );

    // Add doctor data to Firestore
    await setDoc(doc(db, 'users', doctorCredential.user.uid), {
      email: 'doctor@hospital.com',
      displayName: 'Dr. John Smith',
      role: 'Doctor',
      specialization: 'General Medicine',
      createdAt: new Date(),
      phoneNumber: '+1234567890'
    });

    console.log('Default doctor account created successfully');
    return true;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Doctor account already exists');
      return true;
    }
    console.error('Error creating default doctor:', error);
    return false;
  }
};
