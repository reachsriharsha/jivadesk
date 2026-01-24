"""Dynamic Log Level Management API endpoints"""
import logging
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from app.core.config import settings
from app.utils.token_handler import JWTHandler
from app.logging_config import get_logger, set_log_level, get_all_log_levels

logger = get_logger(__name__)

router = APIRouter(tags=["Log Level Management"])
security = HTTPBearer()


class SetLogLevelRequest(BaseModel):
    """Request schema for setting log level"""
    logger: Optional[str] = Field(None, description="Logger name (e.g., 'app.api.auth'). If not provided, sets root logger level.")
    level: str = Field(..., description="Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL")


class LogLevelResponse(BaseModel):
    """Response schema for log level operations"""
    status: str
    message: str


class GetLogLevelsResponse(BaseModel):
    """Response schema for getting all log levels"""
    status: str
    loggers: Dict[str, str]


async def verify_admin_access(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify that the request comes from an authenticated user.
    
    Note: Currently validates JWT token only. In production, add role-based
    access control to restrict to admin/devops users only.
    """
    jwt_handler = JWTHandler(
        secret_key=settings.secret_key,
        algorithm=settings.jwt_algorithm,
        access_token_expire_minutes=settings.access_token_expire_minutes,
        refresh_token_expire_days=settings.refresh_token_expire_days
    )
    try:
        payload = jwt_handler.decode_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            logger.warning("loglevel_access_denied | reason=invalid_token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"status": "error", "message": "Invalid token", "error_code": "UNAUTHORIZED"}
            )
        
        # TODO: Add role check when user roles are implemented
        # if user.role not in ["admin", "devops"]:
        #     raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        return user_id
    except Exception as e:
        logger.warning(f"loglevel_access_denied | error={str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"status": "error", "message": "Invalid or expired token", "error_code": "UNAUTHORIZED"}
        )


@router.post(
    "/",
    response_model=LogLevelResponse,
    summary="Set log level",
    description="Set log level globally (root logger) or for a specific component/module. Requires authentication."
)
async def set_loglevel(
    request: SetLogLevelRequest,
    user_id: str = Depends(verify_admin_access)
) -> LogLevelResponse:
    """
    Set log level for a logger or root logger.
    
    - **logger**: Optional logger name (e.g., 'app.api.auth'). If omitted, sets root logger.
    - **level**: One of DEBUG, INFO, WARNING, ERROR, CRITICAL
    """
    # Validate log level
    valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    level_upper = request.level.upper()
    
    if level_upper not in valid_levels:
        logger.warning(f"loglevel_set_failed | user_id={user_id} | logger={request.logger} | level={request.level} | reason=invalid_level")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "error",
                "message": f"Invalid log level. Must be one of: {', '.join(valid_levels)}",
                "error_code": "INVALID_LOG_LEVEL"
            }
        )
    
    try:
        logger_name = request.logger if request.logger else "root"
        set_log_level(request.logger, level_upper)
        
        logger.info(f"loglevel_updated | user_id={user_id} | logger={logger_name} | level={level_upper}")
        
        return LogLevelResponse(
            status="success",
            message=f"Log level for '{logger_name}' set to {level_upper}"
        )
    
    except ValueError as e:
        logger.error(f"loglevel_set_error | user_id={user_id} | logger={request.logger} | level={level_upper} | error={str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "error",
                "message": str(e),
                "error_code": "INVALID_LOGGER"
            }
        )
    except Exception as e:
        logger.error(f"loglevel_set_error | user_id={user_id} | logger={request.logger} | level={level_upper} | error_type={type(e).__name__} | error={str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": "Failed to set log level",
                "error_code": "INTERNAL_ERROR"
            }
        )


@router.get(
    "/",
    response_model=GetLogLevelsResponse,
    summary="Get current log levels",
    description="Get current log levels for all active loggers. Requires authentication."
)
async def get_loglevels(
    user_id: str = Depends(verify_admin_access)
) -> GetLogLevelsResponse:
    """
    Get current log levels for all active loggers.
    
    Returns a dictionary mapping logger names to their current log levels.
    """
    try:
        levels = get_all_log_levels()
        
        logger.debug(f"loglevel_retrieved | user_id={user_id} | logger_count={len(levels)}")
        
        return GetLogLevelsResponse(
            status="success",
            loggers=levels
        )
    
    except Exception as e:
        logger.error(f"loglevel_get_error | user_id={user_id} | error_type={type(e).__name__} | error={str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "message": "Failed to retrieve log levels",
                "error_code": "INTERNAL_ERROR"
            }
        )
