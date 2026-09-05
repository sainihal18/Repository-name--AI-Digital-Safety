"""
Level 3 SMS model: RoBERTa fine-tuned for SMS scam classification.

Requires `torch` and `transformers` (see requirements.txt). Not exercised
in offline/CPU-only smoke tests — this module defines the training and
inference interface so it can be swapped in via config/model_config.yaml
(sms.active_model: "roberta") without touching any calling code,
since it implements the same fit / predict_proba / save / load contract
as ml/sms/models/tfidf_lr.py.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List


@dataclass
class TransformerConfig:
    model_name: str = "roberta-base"
    max_length: int = 128
    batch_size: int = 16
    epochs: int = 3
    learning_rate: float = 2e-5


class RoBERTaSMSModel:
    name = "sms-roberta"
    model_type = "transformer"

    def __init__(self, config: TransformerConfig | None = None, device: str | None = None):
        self.config = config or TransformerConfig()
        self._fitted = False
        self.device = device or self._detect_device()
        self.tokenizer = None
        self.model = None

    @staticmethod
    def _detect_device() -> str:
        try:
            import torch
            return "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            return "cpu"

    def _lazy_init(self):
        """Import torch/transformers only when actually used, so importing
        this module doesn't hard-fail in environments without GPU/internet
        access (e.g. this sandbox) while still being fully functional
        wherever the real dependencies are installed."""
        if self.model is not None:
            return
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        self.tokenizer = AutoTokenizer.from_pretrained(self.config.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.config.model_name, num_labels=2
        ).to(self.device)

    def fit(self, texts: List[str], labels: List[int]) -> "RoBERTaSMSModel":
        self._lazy_init()
        import torch
        from torch.utils.data import DataLoader, TensorDataset
        from torch.optim import AdamW

        encodings = self.tokenizer(
            texts, truncation=True, padding=True, max_length=self.config.max_length,
            return_tensors="pt",
        )
        dataset = TensorDataset(
            encodings["input_ids"], encodings["attention_mask"], torch.tensor(labels)
        )
        loader = DataLoader(dataset, batch_size=self.config.batch_size, shuffle=True)
        optimizer = AdamW(self.model.parameters(), lr=self.config.learning_rate)

        self.model.train()
        for _ in range(self.config.epochs):
            for input_ids, attention_mask, batch_labels in loader:
                optimizer.zero_grad()
                input_ids = input_ids.to(self.device)
                attention_mask = attention_mask.to(self.device)
                batch_labels = batch_labels.to(self.device)
                outputs = self.model(
                    input_ids=input_ids, attention_mask=attention_mask, labels=batch_labels
                )
                outputs.loss.backward()
                optimizer.step()
        self._fitted = True
        return self

    def predict_proba(self, texts: List[str]):
        self._lazy_init()
        import torch
        import torch.nn.functional as F

        self.model.eval()
        encodings = self.tokenizer(
            texts, truncation=True, padding=True, max_length=self.config.max_length,
            return_tensors="pt",
        ).to(self.device)
        with torch.no_grad():
            logits = self.model(**encodings).logits
            probs = F.softmax(logits, dim=-1)
        return probs.cpu().numpy()

    def save(self, directory: str, version: str) -> None:
        out = Path(directory)
        out.mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(out)
        self.tokenizer.save_pretrained(out)
        meta = {"name": self.name, "model_type": self.model_type, "version": version,
                "config": asdict(self.config)}
        (out / "metadata.json").write_text(json.dumps(meta, indent=2))

    @classmethod
    def load(cls, directory: str) -> "RoBERTaSMSModel":
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        meta = json.loads((Path(directory) / "metadata.json").read_text())
        instance = cls(TransformerConfig(**meta["config"]))
        instance.tokenizer = AutoTokenizer.from_pretrained(directory)
        instance.model = AutoModelForSequenceClassification.from_pretrained(directory).to(instance.device)
        instance._fitted = True
        return instance
