import logging
from apscheduler.schedulers.background import BackgroundScheduler
from .plant_lifecycle import tick_day

logger = logging.getLogger(__name__)

# Scheduler de tarefas em background
scheduler = BackgroundScheduler()


def start_scheduler(SessionLocal):
    """
    Inicia o scheduler e agenda o tick_day a cada 6 horas, injetando SessionLocal.
    """
    # Só inicia se o scheduler não estiver rodando
    if scheduler.state == 0:  # STATE_STOPPED = 0
        def tick_day_job():
            db = SessionLocal()
            try:
                tick_day(db)
            finally:
                db.close()
        scheduler.add_job(
            tick_day_job,
            'cron',
            hour='*/6',
            minute=0,
            id='plant_tick',
            replace_existing=True,
        )
        scheduler.start()
        logger.info("Scheduler iniciado: job 'plant_tick' a cada 6h.")
    else:
        logger.info("Scheduler já está rodando, ignorando chamada para start_scheduler")


def shutdown_scheduler():
    """
    Encerra o scheduler de forma graciosa.
    """
    scheduler.shutdown()
    logger.info("Scheduler encerrado.")
