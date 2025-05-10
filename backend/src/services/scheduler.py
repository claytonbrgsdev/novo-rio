import logging
from apscheduler.schedulers.background import BackgroundScheduler
from .plant_lifecycle import tick_day
from .soil_deterioration import apply_daily_deterioration
from .climate_effects import process_random_climate_event
from .seasonality import check_and_update_season

logger = logging.getLogger(__name__)

# Scheduler de tarefas em background
scheduler = BackgroundScheduler()


def start_scheduler(SessionLocal):
    """
    Inicia o scheduler e agenda as tarefas periódicas, injetando SessionLocal.
    """
    # Só inicia se o scheduler não estiver rodando
    if scheduler.state == 0:  # STATE_STOPPED = 0
        # 1. Job para ciclo diário das plantas
        def tick_day_job():
            db = SessionLocal()
            try:
                tick_day(db)
            finally:
                db.close()
        
        # 2. Job para deterioração natural do solo
        def soil_deterioration_job():
            db = SessionLocal()
            try:
                apply_daily_deterioration(db)
                logger.info("Deterioração diária do solo aplicada")
            except Exception as e:
                logger.error(f"Erro ao aplicar deterioração do solo: {e}")
            finally:
                db.close()
        
        # 3. Job para eventos climáticos aleatórios
        def climate_event_job():
            db = SessionLocal()
            try:
                event_name, counters = process_random_climate_event(db)
                if event_name:
                    logger.info(f"Evento climático '{event_name}' processado. Atualizados: {counters['terrains_updated']} terrenos, {counters['quadrants_updated']} quadrantes")
            except Exception as e:
                logger.error(f"Erro ao processar evento climático: {e}")
            finally:
                db.close()
                
        # 4. Job para verificar mudança de estação
        def check_season_job():
            db = SessionLocal()
            try:
                new_season = check_and_update_season(db)
                if new_season:
                    logger.info(f"Estação mudou para: {new_season.name} (ID: {new_season.id})")
            except Exception as e:
                logger.error(f"Erro ao verificar mudança de estação: {e}")
            finally:
                db.close()
        
        # Adicionar jobs ao scheduler
        # 1. Ciclo de plantas - a cada 6 horas
        scheduler.add_job(
            tick_day_job,
            'cron',
            hour='*/6',
            minute=0,
            id='plant_tick',
            replace_existing=True,
        )
        
        # 2. Deterioração do solo - uma vez por dia às 00:00
        scheduler.add_job(
            soil_deterioration_job,
            'cron',
            hour=0,
            minute=0,
            id='soil_deterioration',
            replace_existing=True,
        )
        
        # 3. Eventos climáticos - duas vezes por dia (6:00 e 18:00)
        scheduler.add_job(
            climate_event_job,
            'cron',
            hour='6,18',
            minute=0,
            id='climate_events',
            replace_existing=True,
        )
        
        # 4. Verificação de mudança de estação - uma vez por dia à meia-noite
        scheduler.add_job(
            check_season_job,
            'cron',
            hour=0,
            minute=0,
            id='season_check',
            replace_existing=True,
        )
        
        # Iniciar o scheduler
        scheduler.start()
        logger.info("Scheduler iniciado com jobs: 'plant_tick', 'soil_deterioration', 'climate_events', 'season_check'")
    else:
        logger.info("Scheduler já está rodando, ignorando chamada para start_scheduler")


def shutdown_scheduler():
    """
    Encerra o scheduler de forma graciosa.
    """
    scheduler.shutdown()
    logger.info("Scheduler encerrado.")
