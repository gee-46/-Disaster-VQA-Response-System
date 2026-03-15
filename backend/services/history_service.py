import datetime

class HistoryService:
    def __init__(self):
        self.history = []

    def add_entry(self, question, answer, confidence, risk_level, inference_time_ms, model):
        entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "question": question,
            "answer": answer,
            "confidence": confidence,
            "risk_level": risk_level,
            "inference_time_ms": inference_time_ms,
            "model": model
        }
        self.history.append(entry)
        # Keep only the last 100 entries
        if len(self.history) > 100:
            self.history.pop(0)
        return entry

    def get_history(self, limit=50):
        # Return reversed history (most recent first) up to the limit
        return self.history[::-1][:limit]

# Global singleton
history_service = HistoryService()
