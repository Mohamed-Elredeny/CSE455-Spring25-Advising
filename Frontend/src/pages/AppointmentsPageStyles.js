import styled from "styled-components";
import Calendar from "react-calendar";

export const Container = styled.div`
  max-width: 700px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #333;
  text-align: center;
  font-family: Arial, sans-serif;
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #222;
`;

export const StyledCalendar = styled(Calendar)`
  width: 100%;
  max-width: 500px;
  border: none;
  background: transparent;
  font-family: Arial, sans-serif;

  /* Header Styling */
  .react-calendar__navigation {
    display: flex;
    justify-content: space-between;
    background: #f5f5f5;
    padding: 10px;
    border-radius: 8px 8px 0 0;
  }

  .react-calendar__navigation button {
    background: none;
    border: none;
    color: #333;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }

  /* Calendar Grid */
  .react-calendar__month-view {
    padding: 10px;
  }

  .react-calendar__tile {
    background: transparent;
    color: #333;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s;
    margin: 5px;
  }

  .react-calendar__tile:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  /* Highlighted Dates */
  .react-calendar__tile--active {
    background: #f4a896;
    color: white;
  }

  /* Weekend Styling */
  .react-calendar__month-view__days__day--weekend {
    color: #d9534f;
  }

  /* Border & Grid */
  .react-calendar__month-view__weekdays {
    text-transform: uppercase;
    font-size: 12px;
    color: #666;
    background: #f5f5f5;
    padding: 8px;
  }

  /* Remove Borders */
  .react-calendar__tile:enabled:focus {
    background: #f4a896;
    color: white;
  }
`;


export const AppointmentList = styled.ul`
  margin-top: 15px;
  padding: 0;
  list-style: none;
`;

export const AppointmentItem = styled.li`
  background: #f9f9f9;
  padding: 12px;
  margin: 8px 0;
  border-radius: 5px;
  font-size: 14px;
  border: 1px solid #ddd;
`;

export const Button = styled.button`
  padding: 10px 15px;
  margin: 5px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
`;

export const EditButton = styled(Button)`
  background: #28a745;

  &:hover {
    background: #218838;
  }
`;

export const CancelButton = styled(Button)`
  background: #dc3545;

  &:hover {
    background: #c82333;
  }
`;
