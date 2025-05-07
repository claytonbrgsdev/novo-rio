import logging
from apscheduler.schedulers.background import BackgroundScheduler
from .plant_lifecycle import tick_day

logger = logging.getLogger(__name__)

# Scheduler de tarefas em background
scheduler = BackgroundScheduler()


def start_scheduler():
    """
    Inicia o scheduler e agenda o tick_day a cada 6 horas.
    """
    scheduler.add_job(
        tick_day,
        'cron',
        hour='*/6',
        minute=0,
        id='plant_tick',
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler iniciado: job 'plant_tick' a cada 6h.")


def shutdown_scheduler():
    """
    Encerra o scheduler de forma graciosa.
    """
    scheduler.shutdown()
    logger.info("Scheduler encerrado.")
