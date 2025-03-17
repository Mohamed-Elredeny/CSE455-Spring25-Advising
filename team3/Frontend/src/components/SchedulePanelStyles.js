import styled from "styled-components";

/* Sliding Panel */
export const PanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? "0" : "-100%")};
  width: 420px;
  height: 100vh;
  background: rgba(30, 30, 30, 0.4);
  backdrop-filter: blur(18px);
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
  transition: right 0.4s ease-in-out;
  padding: 30px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-radius: 15px 0 0 15px;
  color: white;
  overflow-y: auto;

  h2 {
    font-size: 1.6rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 15px;
    letter-spacing: 1px;
  }
`;

/* Dark Overlay */
export const Overlay = styled.div`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  transition: opacity 0.3s ease-in-out;
`;

/* Close Button */
export const CloseButton = styled.button`
  align-self: flex-end;
  background: transparent;
  border: none;
  font-size: 28px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease, color 0.2s ease;

  &:hover {
    transform: rotate(90deg);
    color: #f39c12;
  }
`;

/* Appointments List */
export const ScheduleList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
  overflow-y: auto;
  max-height: 75vh;
`;

/* Individual Appointment */
export const ScheduleItem = styled.li`
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  margin-bottom: 12px;
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  position: relative;
  box-shadow: 0 4px 10px rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  strong {
    color: #f39c12;
    font-weight: 600;
  }
`;

/* No Appointments Message */
export const NoAppointments = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: white;
  opacity: 0.8;
  margin-top: 20px;
  font-weight: 500;
`;

