"""
SMS feature extraction for the TF-IDF + Logistic Regression baseline.

Kept separate from the model class so the same vectorizer configuration
can be reused for evaluation, inference, and future model comparisons
without duplicating hyperparameters.
"""
from __future__ import annotations

from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer


def build_tfidf_vectorizer(max_features: int = 8000, ngram_range=(1, 2)) -> TfidfVectorizer:
    return TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        sublinear_tf=True,
        strip_accents="unicode",
        min_df=1,
    )


def fit_transform(vectorizer: TfidfVectorizer, texts: List[str]):
    return vectorizer.fit_transform(texts)


def transform(vectorizer: TfidfVectorizer, texts: List[str]):
    return vectorizer.transform(texts)
