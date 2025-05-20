import styled from "styled-components";

/* Sliding Panel */
export const PanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? "0" : "-100%")};
  width: 420px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.3);
  transition: right 0.4s ease-in-out;
  padding: 25px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-radius: 15px 0 0 15px;
  color: white;
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
  transition: transform 0.2s ease;

  &:hover {
    transform: rotate(90deg);
  }
`;

/* Title */
export const Title = styled.h2`
  text-align: center;
  margin-bottom: 15px;
  font-size: 22px;
  font-weight: bold;
  text-transform: uppercase;
`;

/* Error & Success Messages */
export const Message = styled.p`
  text-align: center;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: bold;
  color: ${({ type }) => (type === "error" ? "red" : "green")};
`;

/* Form */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 10px;
`;

/* Input Fields */
export const Input = styled.input`
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  outline: none;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;

  &:focus {
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

/* Select Dropdown */
export const Select = styled.select`
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  outline: none;
  transition: all 0.3s ease;
  font-family: "Poppins", sans-serif;

  &:focus {
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  }

  option {
    background: #1e293b;
    color: white;
  }
`;

/* Submit Button */
export const SubmitButton = styled.button`
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
  background: linear-gradient(135deg, #ff7e5f, #feb47b);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(255, 126, 95, 0.4);

  &:hover {
    background: linear-gradient(135deg, #e66465, #feb47b);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(255, 126, 95, 0.6);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.6);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;
