from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.appointment_routes import router as appointment_router

app = FastAPI()

# Enable CORS to allow requests from frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(appointment_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Advising Appointment Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)