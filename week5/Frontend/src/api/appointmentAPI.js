const API_BASE_URL = "http://localhost:8000"; // Adjust if needed

export const bookAppointment = async (appointmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      throw new Error("Failed to book appointment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};
