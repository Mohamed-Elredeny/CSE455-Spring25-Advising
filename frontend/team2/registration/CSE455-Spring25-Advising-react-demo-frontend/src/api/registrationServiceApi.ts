export const getRegistrationData = async () => {
  return Promise.resolve({
    registrationOpen: true,
    registrationDeadline: "2025-12-31T23:59:59Z",
  });
};

export const submitRegistration = async (registrationInfo: any) => {
  console.log("Submitting registration info:", registrationInfo);
  return Promise.resolve({ success: true });
};

export const getWaitlistPosition = async (studentId: string, courseId: string) => {
  return Promise.resolve({ position: 5 });
};
