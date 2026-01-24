# logging_config.py
import logging
from typing import Dict, Optional

class CustomFormatter(logging.Formatter):
    def format(self, record):
        # Add file name and line number to the log format
        record.fileline = f"{record.filename}:{record.lineno}"
        return super().format(record)

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(fileline)s] %(name)s: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

formatter = CustomFormatter(LOG_FORMAT, datefmt=DATE_FORMAT)

handler = logging.StreamHandler()
handler.setFormatter(formatter)

# Root logger config
logging.basicConfig(level=logging.INFO, handlers=[handler])


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    # Avoid duplicate handlers if imported multiple times
    if not logger.hasHandlers():
        logger.addHandler(handler)
    logger.propagate = True  # Allow logs to propagate to root logger
    return logger


def set_log_level(logger_name: Optional[str], level: str) -> None:
    """
    Set log level for a specific logger or root logger.
    
    Args:
        logger_name: Name of the logger (e.g., 'app.api.auth'). If None, sets root logger.
        level: Log level as string (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Raises:
        ValueError: If the log level is invalid
    """
    # Validate level
    numeric_level = getattr(logging, level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f"Invalid log level: {level}")
    
    if logger_name:
        # Set specific logger level
        target_logger = logging.getLogger(logger_name)
        target_logger.setLevel(numeric_level)
    else:
        # Set root logger level
        logging.getLogger().setLevel(numeric_level)


def get_all_log_levels() -> Dict[str, str]:
    """
    Get current log levels for all active loggers.
    
    Returns:
        Dictionary mapping logger names to their current log levels
    """
    levels = {}
    
    # Get root logger level
    root_logger = logging.getLogger()
    levels["root"] = logging.getLevelName(root_logger.level)
    
    # Get all other active loggers
    # Access the internal logger dictionary
    for name in sorted(logging.Logger.manager.loggerDict.keys()):
        logger = logging.getLogger(name)
        # Only include loggers that have an explicit level set
        if logger.level != logging.NOTSET:
            levels[name] = logging.getLevelName(logger.level)
    
    return levels
