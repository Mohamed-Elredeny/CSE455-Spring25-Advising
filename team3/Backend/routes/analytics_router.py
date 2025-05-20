from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from database.connection import appointments_collection
from bson import ObjectId

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)



@router.get("/summary")
async def get_analytics_summary():
    """Get key appointment metrics"""
    try:
        total = appointments_collection.count_documents({})
        upcoming = appointments_collection.count_documents({
            "date_time": {"$gte": datetime.utcnow()}
        })
        completed = appointments_collection.count_documents({
            "date_time": {"$lt": datetime.utcnow()}
        })
        
        return {
            "total_appointments": total,
            "upcoming": upcoming,
            "completed": completed,
            "completion_rate": round((completed / total) * 100, 2) if total > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/advisor-performance")
async def get_advisor_performance():
    """Get advisor performance metrics"""
    try:
        pipeline = [
            {"$group": {
                "_id": "$advisor_id",
                "total_appointments": {"$sum": 1},
                "completed": {
                    "$sum": {
                        "$cond": [{"$lt": ["$date_time", datetime.utcnow()]}, 1, 0]
                    }
                }
            }},
            {"$addFields": {
                "completion_rate": {
                    "$cond": [
                        {"$eq": ["$total_appointments", 0]},
                        0,
                        {"$multiply": [
                            {"$divide": ["$completed", "$total_appointments"]},
                            100
                        ]}
                    ]
                }
            }},
            {"$sort": {"total_appointments": -1}}
        ]
        
        results = list(appointments_collection.aggregate(pipeline))
        return {"advisors": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))