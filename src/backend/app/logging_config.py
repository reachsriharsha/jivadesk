# logging_config.py
import logging

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
