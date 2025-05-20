# timezone_utils.py
from datetime import datetime, timezone
from pytz import timezone as pytz_timezone
from typing import Optional
from fastapi import HTTPException

# Default configuration
DEFAULT_TIMEZONE = 'America/New_York'

class TimezoneHandler:
    def __init__(self, default_timezone: str = DEFAULT_TIMEZONE):
        self.default_timezone = pytz_timezone(default_timezone)
    
    def convert_to_utc(self, local_dt: datetime, tz_str: Optional[str] = None) -> datetime:
        """
        Convert a local datetime to UTC.
        If tz_str is not provided, uses the default timezone.
        """
        try:
            tz = pytz_timezone(tz_str) if tz_str else self.default_timezone
            
            if local_dt.tzinfo is None:
                localized = tz.localize(local_dt)
            else:
                localized = local_dt.astimezone(tz)
            
            return localized.astimezone(pytz_timezone('UTC'))
        except Exception as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid datetime or timezone: {str(e)}"
            )
    
    def convert_from_utc(self, utc_dt: datetime, tz_str: str) -> datetime:
        """Convert UTC datetime to specified local timezone."""
        try:
            tz = pytz_timezone(tz_str)
            if utc_dt.tzinfo is None:
                utc_dt = utc_dt.replace(tzinfo=timezone.utc)
            return utc_dt.astimezone(tz)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid timezone: {str(e)}"
            )
    
    def get_utc_now(self) -> datetime:
        """Get current time in UTC without timezone info (for MongoDB storage)."""
        return datetime.now(timezone.utc).replace(tzinfo=None)
    
    def make_timezone_aware(self, dt: datetime, tz_str: str) -> datetime:
        """Make a naive datetime timezone-aware."""
        try:
            tz = pytz_timezone(tz_str)
            return tz.localize(dt) if dt.tzinfo is None else dt.astimezone(tz)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid timezone: {str(e)}"
            )

# Create a default instance for easy import
timezone_handler = TimezoneHandler()